import ipaddress
import socket
from time import perf_counter
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, HttpUrl, field_validator

router = APIRouter(tags=['scan'])


class ScanRequest(BaseModel):
    url: HttpUrl

    @field_validator('url')
    @classmethod
    def validate_scheme(cls, value: HttpUrl) -> HttpUrl:
        if value.scheme not in {'http', 'https'}:
            raise ValueError('仅支持 http 和 https 协议')
        return value


class RiskItem(BaseModel):
    name: str
    severity: str
    description: str
    recommendation: str


class ScanResponse(BaseModel):
    url: str
    score: int
    risks: list[RiskItem]
    reachable: bool
    status_code: int | None = None
    response_time_ms: int | None = None


def _is_private_host(hostname: str) -> bool:
    try:
        addresses = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='目标域名无法解析') from exc

    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_unspecified:
            return True
    return False


def _check_response(response: httpx.Response, url: str, elapsed_ms: int) -> ScanResponse:
    headers = {key.lower(): value for key, value in response.headers.items()}
    risks: list[RiskItem] = []

    if response.url.scheme == 'https' and 'strict-transport-security' not in headers:
        risks.append(RiskItem(name='HSTS 未启用', severity='High', description='HTTPS 响应缺少 Strict-Transport-Security，浏览器可能被降级到非安全连接。', recommendation='在 HTTPS 响应中添加 Strict-Transport-Security: max-age=31536000; includeSubDomains。'))
    if 'content-security-policy' not in headers:
        risks.append(RiskItem(name='缺失 Content-Security-Policy', severity='Medium', description='响应未配置内容安全策略，可能增加 XSS 与脚本执行风险。', recommendation='根据实际资源来源配置 Content-Security-Policy，先使用 Report-Only 模式验证规则，再逐步收紧。'))
    if 'x-content-type-options' not in headers:
        risks.append(RiskItem(name='缺失 X-Content-Type-Options', severity='Low', description='响应未禁止 MIME 类型嗅探，建议设置为 nosniff。', recommendation='添加响应头 X-Content-Type-Options: nosniff。'))
    if 'x-frame-options' not in headers and 'frame-ancestors' not in headers.get('content-security-policy', ''):
        risks.append(RiskItem(name='缺失点击劫持防护', severity='Medium', description='未发现 X-Frame-Options 或 CSP frame-ancestors 防护。', recommendation='添加 X-Frame-Options: DENY，或在 CSP 中配置 frame-ancestors，仅允许可信来源嵌入。'))
    if response.url.scheme == 'http':
        risks.append(RiskItem(name='未使用 HTTPS', severity='High', description='目标通过明文 HTTP 访问，传输内容可能被窃听或篡改。', recommendation='为站点配置 TLS 证书，将 HTTP 重定向到 HTTPS，并开启 HSTS。'))
    if 'set-cookie' in headers and 'secure' not in headers['set-cookie'].lower():
        risks.append(RiskItem(name='Cookie 缺少 Secure 属性', severity='Medium', description='Set-Cookie 未包含 Secure 属性，可能通过非加密通道发送。', recommendation='为敏感 Cookie 添加 Secure、HttpOnly 和适当的 SameSite 属性。'))

    score = max(0, 100 - sum({'High': 25, 'Medium': 15, 'Low': 8}[risk.severity] for risk in risks))
    return ScanResponse(url=url, score=score, risks=risks, reachable=True, status_code=response.status_code, response_time_ms=elapsed_ms)


@router.post('/scan', response_model=ScanResponse)
async def scan_website(payload: ScanRequest):
    url = str(payload.url)
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname or _is_private_host(hostname):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='出于安全原因，不允许检测内网、回环或保留地址')

    started = perf_counter()
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=httpx.Timeout(8.0, connect=4.0), headers={'User-Agent': 'SafeSight-Security-Checker/1.0'}) as client:
            response = await client.get(url)
    except (httpx.HTTPError, OSError) as exc:
        return ScanResponse(
            url=url,
            score=0,
            risks=[RiskItem(name='目标无法访问', severity='High', description=f'检测请求未完成：{type(exc).__name__}。请确认域名可访问且已获得授权。', recommendation='确认 DNS、域名证书、防火墙和服务器状态正常，并确保检测服务器可以访问该站点。')],
            reachable=False,
            response_time_ms=round((perf_counter() - started) * 1000),
        )

    return _check_response(response, url, round((perf_counter() - started) * 1000))
