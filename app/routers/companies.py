from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Company, User
from app.schemas import Company as CompanySchema, CompanyCreate
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CompanySchema])
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=CompanySchema)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/", response_model=CompanySchema)
async def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db)
):
    db_company = db.query(Company).filter(Company.domain == company.domain).first()
    if db_company:
        raise HTTPException(status_code=400, detail="Company domain already registered")
    
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/me/info", response_model=CompanySchema)
async def get_my_company(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company