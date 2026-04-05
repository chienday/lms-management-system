"""
FastAPI Application for AI Learning Analytics Microservice

Three main endpoints:
1. POST /chat - Student chatbot with contextual learning support
2. POST /generate_quiz - AI-generated quiz from lecture content
3. POST /insights - AI analysis of class performance for teachers

Integration:
- React Frontend: Calls these endpoints from student/teacher dashboards
- MongoDB: Stores lecture content, quiz questions, insights, performance data
- OpenAI API: Powers AI responses and analysis

Author: AI Development Team
Version: 1.0.0
"""

import logging
import uuid
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import all modules
from config import (
    APP_TITLE,
    APP_VERSION,
    ALLOWED_ORIGINS,
    LOG_LEVEL
)
from schemas import (
    ChatRequest,
    ChatResponse,
    InsightItem,
    GenerateQuizRequest,
    GenerateQuizResponse,
    Question,
    QuizOption,
    InsightsRequest,
    InsightsResponse,
    StudentInsight,
    # Legacy imports for backward compatibility
    LearningRequest,
)
from database import (
    get_db,
    get_lecture_content,
    get_student_performance,
    get_past_quizzes,
    get_student_scores,
    save_quiz_questions,
    save_insights,
    get_class_students,
    get_class_performance_summary,
    get_student_attendance,
    check_db_connection,
    MongoDBClient
)
from ai_service import (
    generate_chat_response,
    generate_learning_insights,
    generate_quiz_questions,
    generate_class_insights,
    check_ai_availability
)

# ============================
# LOGGING SETUP
# ============================

logging.basicConfig(
    level=LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================
# APPLICATION LIFECYCLE
# ============================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown
    """
    # Startup
    logger.info(f"🚀 Starting {APP_TITLE} v{APP_VERSION}")
    db_ok = check_db_connection()
    ai_ok = check_ai_availability()

    if not db_ok:
        logger.warning("⚠ MongoDB connection failed - some features may not work")
    if not ai_ok:
        logger.warning("⚠ OpenAI API not configured - AI features disabled")

    yield

    # Shutdown
    logger.info("🛑 Shutting down application")
    try:
        mongo_client = MongoDBClient()
        mongo_client.close()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# ============================
# FASTAPI APPLICATION
# ============================

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="AI-powered Learning Analytics Microservice for LMS",
    lifespan=lifespan
)

# ============================
# CORS MIDDLEWARE
# ============================
# Allows React frontend to call these endpoints from different origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✓ CORS enabled for: {ALLOWED_ORIGINS}")


# ============================
# HEALTH CHECK & STATUS ENDPOINTS
# ============================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "✓ running",
        "service": APP_TITLE,
        "version": APP_VERSION,
        "endpoints": {
            "chat": "/chat (POST)",
            "generate_quiz": "/generate_quiz (POST)",
            "insights": "/insights (POST)"
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check with dependency status"""
    db_status = check_db_connection()
    ai_status = check_ai_availability()

    return {
        "status": "healthy" if (db_status and ai_status) else "degraded",
        "database": "✓ connected" if db_status else "✗ disconnected",
        "ai_service": "✓ available" if ai_status else "✗ unavailable"
    }


# ============================
# 1. STUDENT CHATBOT ENDPOINT
# ============================

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Student Chatbot Endpoint

    POST /chat

    **Purpose:**
    - Answer student questions with contextual learning insights
    - Provide personalized learning recommendations based on performance

    **Request Body:**
    ```json
    {
        "userId": "student_123",
        "question": "How do I implement binary search?",
        "history": [
            {"role": "user", "content": "What is time complexity?"},
            {"role": "assistant", "content": "Time complexity measures..."}
        ]
    }
    ```

    **Response:**
    ```json
    {
        "answer": "Binary search is an efficient algorithm...",
        "insights": [
            {"topic": "Algorithms", "suggestion": "Practice more sorting problems"},
            {"topic": "Time Complexity", "suggestion": "Review complexity analysis"}
        ]
    }
    ```

    **Integration with Frontend:**
    - React State: Dispatch to chatSlice in Redux
    - Component: StudentChatbot.js
    - Call: `axios.post('/api/chat', {userId, question, history})`

    **MongoDB Collections Used:**
    - students: Retrieve performance data
    - quiz_attempts: Get quiz history
    - grades: Get student scores
    - lectures: Get course content for context
    """
    logger.info(f"📨 Chat request from user {request.userId}")

    try:
        # Validate input
        if not request.userId or not request.question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="userId and question are required"
            )

        if len(request.question) > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question too long (max 1000 characters)"
            )

        # ========== ENHANCED: Retrieve student context from MongoDB ==========
        student_data = get_student_performance(request.userId)
        quiz_history = get_past_quizzes(request.userId, limit=5)
        scores = get_student_scores(request.userId)

        # Build student performance summary
        student_performance = None
        if student_data:
            student_performance = {
                "avgScore": student_data.get("avgScore", 0),
                "attendanceRate": student_data.get("attendanceRate", 0),
                "enrolledSubjects": student_data.get("enrolledSubjects", [])
            }

        # Use context from backend if provided, otherwise try to fetch lecture content
        context_str = request.context or ""
        if not context_str and not request.lectureContent:
            # Fallback: try to build basic context
            if student_performance:
                context_str = f"Student performance: Avg score {student_performance['avgScore']}, Attendance {student_performance['attendanceRate']}%"

        # ========== Generate RAG-enhanced AI response ==========
        ai_response_data = generate_chat_response(
            question=request.question,
            lecture_content=request.lectureContent,  # From backend RAG
            student_performance=student_performance or (request.performance if request.performance else None),
            chat_history=[msg.content for msg in (request.history or [])],
            context_with_sources=context_str  # Enhanced context with sources
        )

        # Extract sources if provided
        sources = ai_response_data.get("sources", [])

        # Generate personalized insights
        insights_data = generate_learning_insights(
            question=request.question,
            student_performance=student_performance or (request.performance if request.performance else {}),
            quiz_history=quiz_history
        )

        # Build insight items with severity
        insights = [
            InsightItem(
                topic=item.get("topic", "General"),
                suggestion=item.get("suggestion", ""),
                severity=item.get("severity", "medium")
            )
            for item in insights_data
        ]

        # Build source references from extracted sources
        source_refs = []
        for src in sources:
            source_refs.append({
                "sourceId": src,
                "title": src,
                "sourceType": "lecture",  # Could be "document" as well
                "date": None
            })

        logger.info(f"✓ Sent chat response to user {request.userId} with {len(source_refs)} sources")

        return ChatResponse(
            answer=ai_response_data.get("answer", ""),
            insights=insights,
            sources=source_refs,
            confidence=ai_response_data.get("confidence", 0.8),
            reasoning=ai_response_data.get("reasoning", "Generated from student context and lecture materials")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )


# ============================
# 2. QUIZ GENERATION ENDPOINT
# ============================

@app.post("/generate_quiz", response_model=GenerateQuizResponse)
async def generate_quiz(request: GenerateQuizRequest):
    """
    Quiz Generation Endpoint

    POST /generate_quiz

    **Purpose:**
    - Generate AI-created quiz questions from lecture content
    - Save questions to MongoDB for later use in assessments

    **Request Body:**
    ```json
    {
        "teacherId": "teacher_456",
        "subjectId": "subject_789",
        "lectureId": "lecture_001",
        "questionCount": 8
    }
    ```

    **Response:**
    ```json
    {
        "quizId": "quiz_550e8400",
        "questions": [
            {
                "questionText": "What is the time complexity of quicksort?",
                "options": [
                    {"label": "A", "text": "O(n)"},
                    {"label": "B", "text": "O(n log n)"},
                    {"label": "C", "text": "O(n²)"},
                    {"label": "D", "text": "O(log n)"}
                ],
                "correctOption": "B"
            }
        ]
    }
    ```

    **Integration with Frontend:**
    - Component: TeacherQuizBuilder.js or similar
    - Call: `axios.post('/api/generate_quiz', {teacherId, subjectId, lectureId})`
    - Use quizId to store quiz reference in teacher's dashboard

    **MongoDB Collections Used:**
    - lectures: Retrieve lecture content
    - AI_Questions: Store generated questions
    - subjects: Get subject name for context
    """
    logger.info(f"📋 Quiz generation request from teacher {request.teacherId}")

    try:
        # Validate input
        if not request.teacherId or not request.subjectId or not request.lectureId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="teacherId, subjectId, and lectureId are required"
            )

        # Clamp question count
        question_count = max(5, min(10, request.questionCount or 5))

        # Retrieve lecture content from MongoDB
        lecture = get_lecture_content(request.lectureId)

        if not lecture:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lecture {request.lectureId} not found"
            )

        lecture_content = lecture.get("content", "")
        if not lecture_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lecture has no content to generate quiz from"
            )

        # Generate quiz questions using AI
        questions_data = generate_quiz_questions(
            lecture_content=lecture_content,
            subject_name=lecture.get("subject", "the subject"),
            question_count=question_count
        )

        if not questions_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate quiz questions"
            )

        # Convert to Pydantic models
        questions = []
        for q in questions_data:
            options = [
                QuizOption(label=opt["label"], text=opt["text"])
                for opt in q.get("options", [])
            ]
            question = Question(
                questionText=q.get("questionText", ""),
                options=options,
                correctOption=q.get("correctOption", "A")
            )
            questions.append(question)

        # Save to MongoDB
        quiz_id = save_quiz_questions({
            "createdBy": request.teacherId,
            "subjectId": request.subjectId,
            "lectureId": request.lectureId,
            "questions": [q.dict() for q in questions]
        })

        logger.info(f"✓ Generated quiz {quiz_id} with {len(questions)} questions")

        return GenerateQuizResponse(
            quizId=quiz_id,
            questions=questions
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quiz generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating quiz: {str(e)}"
        )


# ============================
# 3. INSIGHTS ENDPOINT FOR TEACHERS
# ============================

@app.post("/insights", response_model=InsightsResponse)
async def get_insights(request: InsightsRequest):
    """
    Teacher Analytics & Insights Endpoint

    POST /insights

    **Purpose:**
    - Analyze class performance data
    - Generate insights about student risks, weak topics, and recommendations
    - Help teachers make data-driven decisions

    **Request Body:**
    ```json
    {
        "teacherId": "teacher_456",
        "classId": "class_789"
    }
    ```

    **Response:**
    ```json
    {
        "insights": [
            {
                "studentId": "student_123",
                "topic": "Recursion",
                "insightType": "weak_topic",
                "recommendation": "Student scored 45% on recursion problems. Assign tutorial videos and practice problems"
            },
            {
                "studentId": "student_456",
                "topic": "Overall Performance",
                "insightType": "at_risk",
                "recommendation": "Attendance rate 60%, avg score 52%. Schedule 1-on-1 meeting this week"
            },
            {
                "studentId": "student_789",
                "topic": "Data Structures",
                "insightType": "excelling",
                "recommendation": "Consistently high scores. Consider for peer tutoring role"
            }
        ]
    }
    ```

    **Integration with Frontend:**
    - Component: TeacherAnalytics.js or AdminAnalytics.js
    - Call: `axios.post('/api/insights', {teacherId, classId})`
    - Display insights in dashboard cards/charts

    **MongoDB Collections Used:**
    - students: Get class roster
    - grades: Analyze scores by topic
    - attendance: Check attendance patterns
    - AI_Insights: Save generated insights for future reference
    """
    logger.info(f"📊 Insights request from teacher {request.teacherId}")

    try:
        # Validate input
        if not request.teacherId or not request.classId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="teacherId and classId are required"
            )

        # Retrieve class data from MongoDB
        students = get_class_students(request.classId)

        if not students:
            logger.warning(f"No students found in class {request.classId}")
            # Return empty insights instead of 404 to prevent timeout issues
            return InsightsResponse(insights=[])

        # Get aggregated class performance
        class_summary = get_class_performance_summary(request.classId)

        # Enrich student data with attendance
        for student in students:
            attendance = get_student_attendance(student.get("_id", ""))
            student["attendance"] = attendance.get("attendanceRate", 0) * 100

        # Generate insights using AI
        insights_data = generate_class_insights(
            class_summary=class_summary,
            students_data=students,
            class_name=f"Class {request.classId}"
        )

        if not insights_data:
            # Fallback if AI fails
            logger.warning(f"No insights generated for class {request.classId}")
            insights = []
        else:
            # Convert to Pydantic models
            insights = [
                StudentInsight(
                    studentId=item.get("studentId", "unknown"),
                    topic=item.get("topic", "General"),
                    insightType=item.get("insightType", "general"),
                    recommendation=item.get("recommendation", "")
                )
                for item in insights_data
            ]

        # Try to save insights to MongoDB for reference (optional - don't fail if error)
        try:
            save_insights({
                "teacherId": request.teacherId,
                "classId": request.classId,
                "insights": [i.dict() for i in insights]
            })
        except Exception as save_err:
            logger.warning(f"Could not save insights: {save_err}")

        logger.info(f"✓ Generated {len(insights)} insights for class {request.classId}")

        return InsightsResponse(insights=insights)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in insights endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating insights: {str(e)}"
        )


# ============================
# LEGACY ENDPOINTS (Backward Compatibility)
# ============================

@app.post("/analyze-learning")
async def analyze_learning_legacy(data: LearningRequest):
    """
    DEPRECATED: Legacy endpoint for learning analytics
    Kept for backward compatibility with existing clients
    Use /insights endpoint instead
    """
    logger.warning("⚠ Legacy /analyze-learning endpoint called - consider migrating to /insights")

    # Return basic response in legacy format
    return {
        "student_id": data.profile.student_id,
        "student_name": data.profile.student_name,
        "attendance_percentage": data.profile.attendance_rate * 100,
        "average_score": data.profile.avg_score,
        "analysis": {
            "riskLevel": "MEDIUM" if data.profile.avg_score < 6 else "LOW",
            "learningBehavior": ["System detected"],
            "analysis": "Legacy endpoint - see documentation for new endpoints",
            "recommendations": ["Migrate to /insights endpoint"]
        }
    }


# ============================
# ERROR HANDLERS
# ============================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Catch-all exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": "Internal server error",
        "detail": str(exc) if logger.level == logging.DEBUG else "An error occurred"
    }


# ============================
# APPLICATION INFO
# ============================

if __name__ == "__main__":
    import uvicorn

    logger.info(f"🚀 Starting {APP_TITLE}")
    logger.info(f"📚 Documentation available at http://localhost:8000/docs")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

