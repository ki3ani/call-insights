from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

from app.database import get_db
from app.models import User, Call
from app.schemas import WebSocketMessage
from app.auth import get_current_active_user

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass
    
    async def send_company_message(self, message: str, company_id: int, db: Session):
        users = db.query(User).filter(User.company_id == company_id).all()
        for user in users:
            await self.send_personal_message(message, user.id)
    
    async def broadcast_to_all(self, message: str):
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_text(message)
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        from jose import jwt, JWTError
        import os
        
        SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
        ALGORITHM = os.getenv("ALGORITHM", "HS256")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        user = db.query(User).filter(User.email == email).first()
        if user is None or not user.is_active:
            await websocket.close(code=4001, reason="User not found or inactive")
            return
        
        await manager.connect(websocket, user.id)
        
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "user_id": user.id,
                "message": "Connected successfully"
            }
        }))
        
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await handle_websocket_message(message, user, db)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                }))
                
    except JWTError:
        await websocket.close(code=4001, reason="Invalid token")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
    except Exception as e:
        await websocket.close(code=4000, reason=str(e))

async def handle_websocket_message(message: dict, user: User, db: Session):
    message_type = message.get("type")
    data = message.get("data", {})
    
    if message_type == "call_status_update":
        await handle_call_status_update(data, user, db)
    elif message_type == "join_call_room":
        await handle_join_call_room(data, user)
    elif message_type == "leave_call_room":
        await handle_leave_call_room(data, user)
    elif message_type == "ping":
        await manager.send_personal_message(
            json.dumps({"type": "pong", "data": {"timestamp": datetime.utcnow().isoformat()}}),
            user.id
        )

async def handle_call_status_update(data: dict, user: User, db: Session):
    call_id = data.get("call_id")
    status = data.get("status")
    
    if not call_id or not status:
        return
    
    call = db.query(Call).filter(
        Call.id == call_id,
        Call.company_id == user.company_id
    ).first()
    
    if call:
        call.status = status
        db.commit()
        
        message = json.dumps({
            "type": "call_status_updated",
            "data": {
                "call_id": call_id,
                "status": status,
                "updated_by": user.id
            }
        })
        
        await manager.send_company_message(message, user.company_id, db)

async def handle_join_call_room(data: dict, user: User):
    call_id = data.get("call_id")
    if call_id:
        message = json.dumps({
            "type": "user_joined_call",
            "data": {
                "call_id": call_id,
                "user_id": user.id,
                "user_name": f"{user.first_name} {user.last_name}"
            }
        })
        await manager.send_personal_message(message, user.id)

async def handle_leave_call_room(data: dict, user: User):
    call_id = data.get("call_id")
    if call_id:
        message = json.dumps({
            "type": "user_left_call",
            "data": {
                "call_id": call_id,
                "user_id": user.id,
                "user_name": f"{user.first_name} {user.last_name}"
            }
        })
        await manager.send_personal_message(message, user.id)

@router.post("/broadcast")
async def broadcast_message(
    message: WebSocketMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    websocket_message = json.dumps({
        "type": message.type,
        "data": message.data,
        "from_user": current_user.id,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    if message.user_id:
        await manager.send_personal_message(websocket_message, message.user_id)
    else:
        await manager.send_company_message(websocket_message, current_user.company_id, db)
    
    return {"message": "Message sent successfully"}