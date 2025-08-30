# app/agent/agent.py
import requests
from app.models import models  # for ORM queries

OLLAMA_API_URL = "http://localhost:11434/api/chat"  # Ollama's chat endpoint

def construct_context(db):
    total_materials = db.query(models.Material).count()
    low_stock = db.query(models.Material).filter(models.Material.current_stock <= models.Material.minimum_stock).count()
    pending_orders = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.status == 'pending').count()
    task_count = db.query(models.Task).count()
    completed_tasks = db.query(models.Task).filter(models.Task.status == 'completed').count()
    active_workers = db.query(models.Worker).filter(models.Worker.is_active==True).count()
    return (
        f"Project Stats:\n"
        f"- Total materials: {total_materials}\n"
        f"- Low stock items: {low_stock}\n"
        f"- Pending orders: {pending_orders}\n"
        f"- Active workers: {active_workers}\n"
        f"- Tasks: {task_count} total, {completed_tasks} completed\n"
    )

def agent_answer(user_message: str, db) -> str:
    context = construct_context(db)
    prompt = (
        "You are a construction site expert AI agent. "
        "Read the project stats and the user message. "
        "Analyze the labour, materials, and project status. "
        "Predict any upcoming risks. Suggest concrete actions and recommendations. "
        "Be concise and practical.\n\n"
        f"{context}\n"
        f"User message: {user_message}\n\n"
        "What is your advice?"
    )

    data = {
        "model": "llama3.2",
        "messages": [
            {"role": "system", "content": "You are a helpful construction site management advisor."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_API_URL, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        print("DEBUG: LLM raw response:", result)  # <-- Add this line
        return result.get("message", {}).get("content", "No answer generated.")
    except Exception as e:
        print("ERROR calling Ollama API:", e)
        return "AI agent is currently unavailable."

