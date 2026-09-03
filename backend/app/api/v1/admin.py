from fastapi import APIRouter

router = APIRouter(tags=['admin'])


@router.get('/admin/overview')
async def admin_overview():
    return {
        'total_users': 18240,
        'total_scans': 48220,
        'system_status': {
            'api': '正常',
            'postgresql': '正常',
            'redis': '正常',
            'ai_service': '正常',
        },
        'recent_activity': [
            'demo-company@safe.ai 完成检测',
            'school-admin@safe.ai 新增用户',
            'shop-owner@safe.ai 修复高危风险',
        ],
    }
