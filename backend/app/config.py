from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "SafeSight AI"
    APP_VERSION: str = "0.1.0"
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/safesight"
    REDIS_URL: str = "redis://localhost:6379/0"
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@safesight.ai"
    EMAIL_VERIFICATION_ENABLED: bool = True
    REGISTRATION_ENABLED: bool = True
    GUEST_SCAN_ENABLED: bool = True
    ADMIN_EMAIL: str = "admin@safesight.ai"
    ADMIN_USERNAME: str = "系统管理员"
    ADMIN_PASSWORD: str = "change-this-admin-password"
    ENABLE_DEMO_MODE: bool = True
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
