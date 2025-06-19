from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db

from app.models import LuckyResult  # model dựa trên sơ đồ bạn gửi

router = APIRouter(prefix="/luckywheel", tags=["Lucky Wheel"])

# Pydantic schemas
class LuckyResultBase(BaseModel):
  thoi_gian: datetime
  giai_thuong: str
  id: int

class LuckyResultCreate(BaseModel):
  thoi_gian: datetime
  giai_thuong: str

class LuckyResultUpdate(BaseModel):
  thoi_gian: datetime = None
  giai_thuong: str = None

class LuckyResultOut(LuckyResultBase):
  class Config:
    orm_mode = True

# CRUD APIs

@router.get("/", response_model=List[LuckyResultOut])
def get_all_results(db: Session = Depends(get_db)):
  results = db.query(LuckyResult).all()
  return results

@router.get("/{result_id}", response_model=LuckyResultOut)
def get_result(result_id: int, db: Session = Depends(get_db)):
  result = db.query(LuckyResult).filter(LuckyResult.id == result_id).first()
  if not result:
    raise HTTPException(status_code=404, detail="Result not found")
  return result

@router.post("/", response_model=LuckyResultOut)
def create_result(result: LuckyResultCreate, db: Session = Depends(get_db)):
  db_result = LuckyResult(thoi_gian=result.thoi_gian, giai_thuong=result.giai_thuong)
  db.add(db_result)
  db.commit()
  db.refresh(db_result)
  return db_result

@router.put("/{result_id}", response_model=LuckyResultOut)
def update_result(result_id: int, result: LuckyResultUpdate, db: Session = Depends(get_db)):
  db_result = db.query(LuckyResult).filter(LuckyResult.id == result_id).first()
  if not db_result:
    raise HTTPException(status_code=404, detail="Result not found")
  if result.thoi_gian is not None:
    db_result.thoi_gian = result.thoi_gian
  if result.giai_thuong is not None:
    db_result.giai_thuong = result.giai_thuong
  db.commit()
  db.refresh(db_result)
  return db_result

@router.delete("/{result_id}")
def delete_result(result_id: int, db: Session = Depends(get_db)):
  db_result = db.query(LuckyResult).filter(LuckyResult.id == result_id).first()
  if not db_result:
    raise HTTPException(status_code=404, detail="Result not found")
  db.delete(db_result)
  db.commit()
  return {"detail": "Result deleted"}