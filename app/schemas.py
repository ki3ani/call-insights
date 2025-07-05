from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    domain: str
    industry: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "user"

class UserCreate(UserBase):
    password: str
    company_id: int

class User(UserBase):
    id: int
    is_active: bool
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CallBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    audio_url: Optional[str] = None

class CallCreate(CallBase):
    user_id: int
    company_id: int

class CallUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    insights: Optional[Dict[str, Any]] = None
    sentiment_score: Optional[float] = None
    confidence_score: Optional[float] = None

class Call(CallBase):
    id: int
    status: str
    transcript: Optional[str] = None
    summary: Optional[str] = None
    insights: Optional[Dict[str, Any]] = None
    sentiment_score: Optional[float] = None
    confidence_score: Optional[float] = None
    user_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    user_id: Optional[int] = None
    call_id: Optional[int] = None