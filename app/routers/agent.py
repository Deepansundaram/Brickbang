# app/routers/agent.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.agent.agent import agent_answer
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AgentQuery(BaseModel):
    message: str

@router.post("/agent")
async def query_ai_agent(query: AgentQuery, db: Session = Depends(get_db)):
    try:
        answer = agent_answer(query.message, db)
        return {"suggestion": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))