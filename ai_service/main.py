from fastapi import FastAPI

app = FastAPI(title="AI Learning Analytics Service")

@app.get("/")
def root():
    return {"message": "FastAPI is running"}
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Learning Analytics Service")

class StudentAnalytics(BaseModel):
    student_id: str
    attendance_rate: float
    avg_score: float

@app.get("/")
def root():
    return {"message": "AI Learning Analytics Service is running"}
# test API bằng posman
@app.post("/analyze-student")
def analyze_student(data: StudentAnalytics):
    if data.attendance_rate < 0.7 or data.avg_score < 5:
        risk = "HIGH"
    elif data.attendance_rate < 0.85:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "student_id": data.student_id,
        "risk_level": risk,
        "attendance_rate": data.attendance_rate,
        "avg_score": data.avg_score
    }
