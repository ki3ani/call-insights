from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Call, User
from app.schemas import Call as CallSchema, CallCreate, CallUpdate
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CallSchema])
async def get_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Call).filter(Call.company_id == current_user.company_id)
    
    if status:
        query = query.filter(Call.status == status)
    
    calls = query.offset(skip).limit(limit).all()
    return calls

@router.get("/{call_id}", response_model=CallSchema)
async def get_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    call = db.query(Call).filter(
        Call.id == call_id,
        Call.company_id == current_user.company_id
    ).first()
    
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    return call

@router.post("/", response_model=CallSchema)
async def create_call(
    call: CallCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if call.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to create calls for this company")
    
    db_call = Call(**call.dict())
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call

@router.put("/{call_id}", response_model=CallSchema)
async def update_call(
    call_id: int,
    call_update: CallUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_call = db.query(Call).filter(
        Call.id == call_id,
        Call.company_id == current_user.company_id
    ).first()
    
    if not db_call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    update_data = call_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_call, field, value)
    
    db.commit()
    db.refresh(db_call)
    return db_call

@router.delete("/{call_id}")
async def delete_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_call = db.query(Call).filter(
        Call.id == call_id,
        Call.company_id == current_user.company_id
    ).first()
    
    if not db_call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    db.delete(db_call)
    db.commit()
    return {"message": "Call deleted successfully"}

@router.get("/user/{user_id}", response_model=List[CallSchema])
async def get_user_calls(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    calls = db.query(Call).filter(
        Call.user_id == user_id,
        Call.company_id == current_user.company_id
    ).offset(skip).limit(limit).all()
    
    return calls