import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.db import User, VerificationCode, get_db

router = APIRouter(prefix='/auth', tags=['auth'])


def public_user(user: User) -> dict:
    return {'id': user.id, 'email': user.email, 'username': user.username, 'plan': user.plan, 'role': user.role, 'email_verified': user.email_verified}


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str
    verification_code: str = ''


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerificationCodeRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: dict


@router.post('/register', response_model=TokenResponse)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if not settings.REGISTRATION_ENABLED:
        raise HTTPException(status_code=403, detail='当前已关闭新用户注册')
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail='password confirmation does not match')
    if db.query(User).filter_by(email=payload.email).first():
        raise HTTPException(status_code=409, detail='user already exists')
    if settings.EMAIL_VERIFICATION_ENABLED:
        code = db.query(VerificationCode).filter_by(email=payload.email).first()
        if not code or code.value != payload.verification_code or code.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail='邮箱验证码无效或已过期')
    user = User(id=f'user-{secrets.token_hex(8)}', email=payload.email, username=payload.username, password_hash=hash_password(payload.password), plan='free', role='user', email_verified=not settings.EMAIL_VERIFICATION_ENABLED)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.email, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), {'role': user.role})
    return TokenResponse(access_token=token, user=public_user(user))


@router.post('/verification-code')
async def send_verification_code(payload: VerificationCodeRequest, db: Session = Depends(get_db)):
    if not settings.REGISTRATION_ENABLED:
        raise HTTPException(status_code=403, detail='当前已关闭新用户注册')
    value = str(secrets.randbelow(900000) + 100000)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    code = db.query(VerificationCode).filter_by(email=payload.email).first()
    if code:
        code.value = value
        code.expires_at = expires_at
    else:
        db.add(VerificationCode(email=payload.email, value=value, expires_at=expires_at))
    db.commit()
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        message = EmailMessage()
        message['Subject'] = '安盾云检邮箱验证码'
        message['From'] = settings.SMTP_FROM
        message['To'] = payload.email
        message.set_content(f'你的安盾云检注册验证码是：{value}，10 分钟内有效。')
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    result = {'message': '验证码已发送，请查收邮箱'}
    if not settings.SMTP_HOST:
        result['dev_code'] = value
    return result


@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='invalid credentials')
    token = create_access_token(user.email, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), {'role': user.role})
    return TokenResponse(access_token=token, user=public_user(user))


@router.get('/me')
async def me(claims: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=claims['sub']).first()
    if not user:
        raise HTTPException(status_code=404, detail='user not found')
    return {**public_user(user), 'status': 'active'}


@router.post('/refresh')
async def refresh(claims: dict = Depends(get_current_user)):
    token = create_access_token(claims['sub'], timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), {'role': claims.get('role', 'user')})
    return {'access_token': token, 'token_type': 'bearer'}
