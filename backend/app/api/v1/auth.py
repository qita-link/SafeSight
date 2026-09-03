from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.config import settings
from app.core.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_USERS = {
    "user@safesight.ai": {
        "id": "demo-user-001",
        "email": "user@safesight.ai",
        "username": "demo-user",
        "password_hash": hash_password("Demo@1234"),
        "plan": "professional",
    },
    "admin@safesight.ai": {
        "id": "demo-admin-001",
        "email": "admin@safesight.ai",
        "username": "demo-admin",
        "password_hash": hash_password("Admin@1234"),
        "plan": "enterprise",
        "role": "super_admin",
    },
}


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password confirmation does not match")
    if payload.email in DEMO_USERS:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="user already exists")

    user = {
        "id": f"user-{len(DEMO_USERS) + 1}",
        "email": payload.email,
        "username": payload.username,
        "password_hash": hash_password(payload.password),
        "plan": "free",
    }
    DEMO_USERS[payload.email] = user
    access_token = create_access_token(subject=user["email"], expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return TokenResponse(access_token=access_token, user={"id": user["id"], "email": user["email"], "username": user["username"], "plan": user["plan"]})


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = DEMO_USERS.get(payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")

    access_token = create_access_token(subject=user["email"], expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return TokenResponse(access_token=access_token, user={"id": user["id"], "email": user["email"], "username": user["username"], "plan": user.get("plan", "free")})


@router.get("/me")
async def me():
    return {
        "id": "demo-user-001",
        "email": "user@safesight.ai",
        "username": "demo-user",
        "plan": "professional",
        "role": "user",
        "status": "active",
    }


@router.post("/refresh")
async def refresh():
    return {
        "access_token": create_access_token(subject="user@safesight.ai", expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)),
        "token_type": "bearer",
    }
