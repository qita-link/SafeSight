from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    plan: Mapped[str] = mapped_column(String(40), default='free')
    role: Mapped[str] = mapped_column(String(40), default='user')
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class VerificationCode(Base):
    __tablename__ = 'verification_codes'
    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    value: Mapped[str] = mapped_column(String(12))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ScanSchedule(Base):
    __tablename__ = 'scan_schedules'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    url: Mapped[str] = mapped_column(String(2048))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    cadence: Mapped[str] = mapped_column(String(20), default='daily')
    next_scan: Mapped[str] = mapped_column(String(80), default='每天自动扫描')


class ScanEvent(Base):
    __tablename__ = 'scan_events'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey('users.id'), nullable=True, index=True)
    url: Mapped[str] = mapped_column(String(2048))
    status: Mapped[str] = mapped_column(String(80))
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


def init_db() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        admin = session.query(User).filter_by(email=settings.ADMIN_EMAIL).first()
        if not admin:
            from app.core.security import hash_password
            session.add(User(id='admin-001', email=settings.ADMIN_EMAIL, username=settings.ADMIN_USERNAME, password_hash=hash_password(settings.ADMIN_PASSWORD), plan='enterprise', role='super_admin', email_verified=True))
        else:
            from app.core.security import hash_password
            admin.username = settings.ADMIN_USERNAME
            admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
            admin.role = 'super_admin'
            admin.email_verified = True
        session.commit()


def get_db():
    with SessionLocal() as session:
        yield session
