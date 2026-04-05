"""
Pydantic models for request/response validation
Used across all FastAPI endpoints
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ============================
# STUDENT CHATBOT SCHEMAS
# ============================

class ChatMessage(BaseModel):
    """Single message in chat history"""
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request payload for /chat endpoint - Enhanced with RAG context

    Integration: React frontend sends user questions here
    The AI returns contextual answers based on lecture content and student performance
    
    Enhanced fields (from backend learning context helper):
    - subjectId: Detected or specified subject
    - context: Formatted RAG context window
    - lectureContent: Brief lecture summaries for reference
    - performance: Student's learning metrics
    """
    userId: str = Field(..., description="Student ID")
    studentId: Optional[str] = Field(None, description="Student ID (for context)")
    subjectId: Optional[str] = Field(None, description="Subject ID for context")
    question: str = Field(..., description="Student's question")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous chat messages for context")
    # RAG context fields
    context: Optional[str] = Field(None, description="Formatted learning context with student data and lectures")
    lectureContent: Optional[str] = Field(None, description="Relevant lecture content summaries")
    performance: Optional[dict] = Field(None, description="Student performance metrics")


class SourceReference(BaseModel):
    """Reference to a source document or lecture"""
    sourceId: str = Field(..., description="ID of the source")
    title: str = Field(..., description="Title of lecture or document")
    sourceType: str = Field(..., description="'lecture' or 'document'")
    date: Optional[str] = Field(None, description="Date of lecture/document")


class InsightItem(BaseModel):
    """Single learning insight for student"""
    topic: str
    suggestion: str
    severity: Optional[str] = Field(None, description="'low', 'medium', 'high' - importance of insight")


class ChatResponse(BaseModel):
    """Response payload for /chat endpoint - Enhanced with sources and insights

    Contains AI-generated answer and personalized learning insights,
    plus source citations for RAG
    """
    answer: str = Field(..., description="AI-generated contextual answer")
    insights: List[InsightItem] = Field(default=[], description="Learning insights based on student performance")
    # RAG response enhancements
    sources: List[SourceReference] = Field(default=[], description="Source documents/lectures referenced in the answer")
    confidence: Optional[float] = Field(None, description="Confidence score of the answer (0.0-1.0)")
    reasoning: Optional[str] = Field(None, description="Brief explanation of how the answer was generated")


# ============================
# QUIZ GENERATION SCHEMAS
# ============================

class QuizOption(BaseModel):
    """Single multiple choice option"""
    label: str  # "A" | "B" | "C" | "D"
    text: str


class Question(BaseModel):
    """Single quiz question"""
    questionText: str
    options: List[QuizOption]  # 4 options: A, B, C, D
    correctOption: str  # "A" | "B" | "C" | "D"


class GenerateQuizRequest(BaseModel):
    """Request payload for /generate_quiz endpoint

    Integration: React teacher dashboard sends lecture info
    AI generates quiz questions based on lecture content
    """
    teacherId: str = Field(..., description="Teacher ID who is creating the quiz")
    subjectId: str = Field(..., description="Subject ID")
    lectureId: str = Field(..., description="Lecture ID containing content to generate quiz from")
    questionCount: Optional[int] = Field(default=5, description="Number of questions to generate (5-10)")


class GenerateQuizResponse(BaseModel):
    """Response payload for /generate_quiz endpoint

    Contains generated quiz questions ready to be saved to MongoDB
    """
    quizId: str = Field(..., description="Unique ID for this quiz")
    questions: List[Question] = Field(..., description="Generated quiz questions")


# ============================
# TEACHER INSIGHTS SCHEMAS
# ============================

class StudentInsight(BaseModel):
    """Single insight for a student"""
    studentId: str
    topic: str
    insightType: str  # e.g., "weak_topic", "at_risk", "excelling", "suggested_intervention"
    recommendation: str


class InsightsRequest(BaseModel):
    """Request payload for /insights endpoint

    Integration: React analytics dashboard for teachers
    Analyzes class performance to generate actionable insights
    """
    teacherId: str = Field(..., description="Teacher ID requesting analysis")
    classId: str = Field(..., description="Class ID to analyze")


class InsightsResponse(BaseModel):
    """Response payload for /insights endpoint

    Contains AI-generated insights about class performance and student risks
    """
    insights: List[StudentInsight] = Field(..., description="AI-generated insights for class")


# ============================
# LEGACY SCHEMAS (for backward compatibility)
# ============================

class StudentLearningProfile(BaseModel):
    """Legacy schema - kept for backward compatibility"""
    student_id: str
    student_name: str
    avg_score: float


class ChatContext(BaseModel):
    """Legacy schema - kept for backward compatibility"""
    chat_history: List[str] = []


class LearningRequest(BaseModel):
    """Legacy schema - kept for backward compatibility"""
    profile: StudentLearningProfile
    chat: ChatContext
