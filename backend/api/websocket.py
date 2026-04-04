from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import JWTError, jwt
from backend.config import SECRET_KEY

ALGORITHM = "HS256"
router = APIRouter()
connected_clients: list[WebSocket] = []

@router.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise ValueError
    except (JWTError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def broadcast(alert: dict):
    for client in list(connected_clients):
        try:
            await client.send_json(alert)
        except Exception:
            if client in connected_clients:
                connected_clients.remove(client)
