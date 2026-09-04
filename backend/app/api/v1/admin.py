from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import get_current_admin
from app.db import ScanEvent, ScanSchedule, User, get_db

router = APIRouter(tags=['admin'])


class AdminSettingsUpdate(BaseModel):
    registration_enabled: bool | None = None
    email_verification_enabled: bool | None = None
    guest_scan_enabled: bool | None = None


class UserStatusUpdate(BaseModel):
    email_verified: bool


@router.get('/admin/overview')
async def admin_overview(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return {'total_users': db.query(User).count(), 'total_scans': db.query(ScanEvent).count(), 'system_status': {'api': '正常', 'postgresql': '正常', 'redis': '待接入', 'ai_service': '已配置' if settings.DEEPSEEK_API_KEY else '未配置'}, 'recent_activity': [f'{event.url} · {event.status}' for event in db.query(ScanEvent).order_by(ScanEvent.created_at.desc()).limit(5).all()]}


@router.get('/admin/settings')
async def admin_settings(admin: dict = Depends(get_current_admin)):
    return {'registration_enabled': settings.REGISTRATION_ENABLED, 'email_verification_enabled': settings.EMAIL_VERIFICATION_ENABLED, 'guest_scan_enabled': settings.GUEST_SCAN_ENABLED}


@router.put('/admin/settings')
async def update_admin_settings(payload: AdminSettingsUpdate, admin: dict = Depends(get_current_admin)):
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(settings, key.upper(), value)
    return await admin_settings(admin)


@router.get('/admin/users')
async def admin_users(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return [{'id': user.id, 'email': user.email, 'username': user.username, 'plan': user.plan, 'email_verified': user.email_verified} for user in db.query(User).order_by(User.created_at.desc()).all()]


@router.patch('/admin/users/{email}/verification')
async def update_user_verification(email: str, payload: UserStatusUpdate, admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail='user not found')
    user.email_verified = payload.email_verified
    db.commit()
    return {'email': email, 'email_verified': user.email_verified}


@router.get('/admin/schedules')
async def admin_schedules(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return [{'user': schedule.user_id, 'url': schedule.url, 'enabled': schedule.enabled, 'cadence': schedule.cadence, 'next_scan': schedule.next_scan} for schedule in db.query(ScanSchedule).all()]


@router.get('/admin/daily-tasks')
async def admin_daily_tasks(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    return [{'user': event.user_id or 'guest', 'url': event.url, 'status': event.status, 'date': event.created_at.date().isoformat()} for event in db.query(ScanEvent).filter(ScanEvent.created_at >= start).order_by(ScanEvent.created_at.desc()).all()]
