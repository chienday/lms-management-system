"""
Database module for MongoDB operations
Handles all queries for lecture content, student data, quiz storage, and insights
"""

import logging
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from datetime import datetime
from typing import Optional, Dict, List, Any
from bson.objectid import ObjectId

from config import MONGODB_URI, MONGODB_DB_NAME

logger = logging.getLogger(__name__)

# ============================
# MONGODB CONNECTION
# ============================

class MongoDBClient:
    """Singleton MongoDB connection manager with lazy initialization"""

    _instance: Optional['MongoDBClient'] = None
    _client: Optional[MongoClient] = None
    _db = None
    _connection_tried = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize MongoDB connection - lazy load on first use"""
        # Skip re-initialization
        if self._connection_tried:
            return

        self._connection_tried = True
        self._connect()

    def _connect(self):
        """Establish MongoDB connection with error handling"""
        try:
            logger.info(f"Attempting to connect to MongoDB at {MONGODB_URI}...")
            self._client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Verify connection
            self._client.admin.command('ping')
            self._db = self._client[MONGODB_DB_NAME]
            logger.info(f"✓ Connected to MongoDB: {MONGODB_DB_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.warning(f"⚠ Could not connect to MongoDB: {e}")
            logger.warning("⚠ Database operations will fail, but service will continue running")
            self._db = None
        except Exception as e:
            logger.error(f"✗ Unexpected error connecting to MongoDB: {e}")
            self._db = None

    @property
    def db(self):
        """Get database instance"""
        if self._db is None:
            logger.warning("⚠ Database not connected")
        return self._db

    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")


def get_db():
    """Dependency injection for database access with error handling"""
    try:
        client = MongoDBClient()
        return client.db
    except Exception as e:
        logger.error(f"Database access error: {e}")
        return None


# ============================
# LECTURE CONTENT QUERIES
# ============================

def get_lecture_content(lecture_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve lecture content from MongoDB

    Args:
        lecture_id: ID of the lecture

    Returns:
        Lecture document with content, or None if not found
    """
    try:
        db = get_db()
        if not db:
            logger.warning("Database not available for lecture query")
            return None

        lecture = db.lectures.find_one(
            {"_id": ObjectId(lecture_id) if ObjectId.is_valid(lecture_id) else {"$eq": lecture_id}}
        )

        if lecture:
            logger.info(f"✓ Retrieved lecture {lecture_id}")
            return lecture
        else:
            logger.warning(f"Lecture {lecture_id} not found")
            return None
    except Exception as e:
        logger.error(f"Error retrieving lecture {lecture_id}: {e}")
        return None


def get_student_performance(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve student's academic performance
    Includes: marks, attendance, quiz results, enrolled classes

    Args:
        user_id: Student ID

    Returns:
        Student document with performance metrics
    """
    try:
        db = get_db()
        if not db:
            logger.warning("Database not available for student query")
            return None

        student = db.students.find_one(
            {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else {"$eq": user_id}}
        )

        if student:
            logger.info(f"✓ Retrieved student performance for {user_id}")
            return student
        else:
            logger.warning(f"Student {user_id} not found")
            return None
    except Exception as e:
        logger.error(f"Error retrieving student {user_id}: {e}")
        return None


def get_past_quizzes(student_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieve student's past quiz attempts

    Args:
        student_id: Student ID
        limit: Maximum number of quizzes to retrieve

    Returns:
        List of quiz attempts
    """
    try:
        db = get_db()
        if not db:
            return []

        quizzes = list(db.quiz_attempts.find(
            {"studentId": student_id}
        ).sort("createdAt", DESCENDING).limit(limit))

        logger.info(f"✓ Retrieved {len(quizzes)} past quizzes for student {student_id}")
        return quizzes
    except Exception as e:
        logger.error(f"Error retrieving past quizzes for {student_id}: {e}")
        return []


def get_student_scores(student_id: str, subject_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve student's scores and grades

    Args:
        student_id: Student ID
        subject_id: Optional - filter by specific subject

    Returns:
        List of score records
    """
    try:
        db = get_db()
        if not db:
            return []

        query = {"studentId": student_id}
        if subject_id:
            query["subjectId"] = subject_id

        scores = list(db.grades.find(query).sort("createdAt", DESCENDING))
        logger.info(f"✓ Retrieved {len(scores)} scores for student {student_id}")
        return scores
    except Exception as e:
        logger.error(f"Error retrieving scores for {student_id}: {e}")
        return []


# ============================
# QUIZ STORAGE
# ============================

def save_quiz_questions(quiz_data: Dict[str, Any]) -> str:
    """
    Save generated quiz questions to MongoDB

    Args:
        quiz_data: Quiz document with questions, teacher info, subject, lecture

    Returns:
        ID of saved quiz
    """
    try:
        db = get_db()
        if not db:
            logger.warning("Database not available - quiz not saved")
            return "quiz_temp_" + str(datetime.utcnow().timestamp())

        quiz_data["createdAt"] = datetime.utcnow()
        quiz_data["status"] = "active"

        result = db.AI_Questions.insert_one(quiz_data)
        quiz_id = str(result.inserted_id)

        logger.info(f"✓ Saved quiz {quiz_id} with {len(quiz_data.get('questions', []))} questions")
        return quiz_id
    except Exception as e:
        logger.error(f"Error saving quiz: {e}")
        raise


def get_quiz_by_id(quiz_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve quiz by ID

    Args:
        quiz_id: Quiz ID

    Returns:
        Quiz document
    """
    try:
        db = get_db()
        if not db:
            return None

        quiz = db.AI_Questions.find_one(
            {"_id": ObjectId(quiz_id) if ObjectId.is_valid(quiz_id) else {"$eq": quiz_id}}
        )

        if quiz:
            logger.info(f"✓ Retrieved quiz {quiz_id}")
            return quiz
        return None
    except Exception as e:
        logger.error(f"Error retrieving quiz {quiz_id}: {e}")
        return None


# ============================
# INSIGHTS STORAGE
# ============================

def save_insights(insights_data: Dict[str, Any]) -> str:
    """
    Save AI-generated insights to MongoDB

    Args:
        insights_data: Insights document with class analysis and recommendations

    Returns:
        ID of saved insights record
    """
    try:
        db = get_db()
        if not db:
            logger.warning("Database not available - insights not saved")
            return "insights_temp_" + str(datetime.utcnow().timestamp())

        insights_data["createdAt"] = datetime.utcnow()

        result = db.AI_Insights.insert_one(insights_data)
        insights_id = str(result.inserted_id)

        logger.info(f"✓ Saved insights {insights_id}")
        return insights_id
    except Exception as e:
        logger.error(f"Error saving insights: {e}")
        raise


def get_class_students(class_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all students in a class

    Args:
        class_id: Class ID

    Returns:
        List of student documents
    """
    try:
        db = get_db()
        if not db:
            return []

        students = list(db.students.find({"classId": class_id}))

        logger.info(f"✓ Retrieved {len(students)} students from class {class_id}")
        return students
    except Exception as e:
        logger.error(f"Error retrieving class students {class_id}: {e}")
        return []


def get_class_performance_summary(class_id: str) -> Dict[str, Any]:
    """
    Get aggregated performance data for entire class
    Used for generating teacher insights

    Args:
        class_id: Class ID

    Returns:
        Summary statistics (average scores, attendance, etc.)
    """
    try:
        db = get_db()
        if not db:
            return {}

        # Aggregate student grades by class
        class_stats = db.grades.aggregate([
            {"$match": {"classId": class_id}},
            {"$group": {
                "_id": "$classId",
                "avgScore": {"$avg": "$score"},
                "minScore": {"$min": "$score"},
                "maxScore": {"$max": "$score"},
                "totalAttempts": {"$sum": 1}
            }}
        ])

        result = list(class_stats)
        summary = result[0] if result else {"avgScore": 0, "minScore": 0, "maxScore": 0, "totalAttempts": 0}

        logger.info(f"✓ Retrieved performance summary for class {class_id}")
        return summary
    except Exception as e:
        logger.error(f"Error retrieving class performance summary: {e}")
        return {}


def get_student_attendance(student_id: str) -> Dict[str, Any]:
    """
    Retrieve attendance record for student

    Args:
        student_id: Student ID

    Returns:
        Attendance data
    """
    try:
        db = get_db()
        if not db:
            return {"attendanceRate": 0}

        attendance = db.attendance.find_one({"studentId": student_id})

        if attendance:
            logger.info(f"✓ Retrieved attendance for student {student_id}")
            return attendance
        return {"attendanceRate": 0}
    except Exception as e:
        logger.error(f"Error retrieving attendance: {e}")
        return {}


# ============================
# HEALTH CHECK
# ============================

def check_db_connection() -> bool:
    """
    Verify MongoDB connection is active

    Returns:
        True if connected, False otherwise
    """
    try:
        db = get_db()
        if db is None:
            return False
        db.command('ping')
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# ============================
# LECTURE CONTENT QUERIES
# ============================

def get_lecture_content(lecture_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve lecture content from MongoDB

    Args:
        lecture_id: ID of the lecture

    Returns:
        Lecture document with content, or None if not found
    """
    try:
        db = get_db()
        lecture = db.lectures.find_one(
            {"_id": ObjectId(lecture_id) if ObjectId.is_valid(lecture_id) else {"$eq": lecture_id}}
        )

        if lecture:
            logger.info(f"✓ Retrieved lecture {lecture_id}")
            return lecture
        else:
            logger.warning(f"Lecture {lecture_id} not found")
            return None
    except Exception as e:
        logger.error(f"Error retrieving lecture {lecture_id}: {e}")
        return None


def get_student_performance(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve student's academic performance
    Includes: marks, attendance, quiz results, enrolled classes

    Args:
        user_id: Student ID

    Returns:
        Student document with performance metrics
    """
    try:
        db = get_db()
        student = db.students.find_one(
            {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else {"$eq": user_id}}
        )

        if student:
            logger.info(f"✓ Retrieved student performance for {user_id}")
            return student
        else:
            logger.warning(f"Student {user_id} not found")
            return None
    except Exception as e:
        logger.error(f"Error retrieving student {user_id}: {e}")
        return None


def get_past_quizzes(student_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieve student's past quiz attempts

    Args:
        student_id: Student ID
        limit: Maximum number of quizzes to retrieve

    Returns:
        List of quiz attempts
    """
    try:
        db = get_db()
        quizzes = list(db.quiz_attempts.find(
            {"studentId": student_id}
        ).sort("createdAt", DESCENDING).limit(limit))

        logger.info(f"✓ Retrieved {len(quizzes)} past quizzes for student {student_id}")
        return quizzes
    except Exception as e:
        logger.error(f"Error retrieving past quizzes for {student_id}: {e}")
        return []


def get_student_scores(student_id: str, subject_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve student's scores and grades

    Args:
        student_id: Student ID
        subject_id: Optional - filter by specific subject

    Returns:
        List of score records
    """
    try:
        db = get_db()
        query = {"studentId": student_id}
        if subject_id:
            query["subjectId"] = subject_id

        scores = list(db.grades.find(query).sort("createdAt", DESCENDING))
        logger.info(f"✓ Retrieved {len(scores)} scores for student {student_id}")
        return scores
    except Exception as e:
        logger.error(f"Error retrieving scores for {student_id}: {e}")
        return []


# ============================
# QUIZ STORAGE
# ============================

def save_quiz_questions(quiz_data: Dict[str, Any]) -> str:
    """
    Save generated quiz questions to MongoDB

    Args:
        quiz_data: Quiz document with questions, teacher info, subject, lecture

    Returns:
        ID of saved quiz
    """
    try:
        db = get_db()
        quiz_data["createdAt"] = datetime.utcnow()
        quiz_data["status"] = "active"

        result = db.AI_Questions.insert_one(quiz_data)
        quiz_id = str(result.inserted_id)

        logger.info(f"✓ Saved quiz {quiz_id} with {len(quiz_data.get('questions', []))} questions")
        return quiz_id
    except Exception as e:
        logger.error(f"Error saving quiz: {e}")
        raise


def get_quiz_by_id(quiz_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve quiz by ID

    Args:
        quiz_id: Quiz ID

    Returns:
        Quiz document
    """
    try:
        db = get_db()
        quiz = db.AI_Questions.find_one(
            {"_id": ObjectId(quiz_id) if ObjectId.is_valid(quiz_id) else {"$eq": quiz_id}}
        )

        if quiz:
            logger.info(f"✓ Retrieved quiz {quiz_id}")
            return quiz
        return None
    except Exception as e:
        logger.error(f"Error retrieving quiz {quiz_id}: {e}")
        return None


# ============================
# INSIGHTS STORAGE
# ============================

def save_insights(insights_data: Dict[str, Any]) -> str:
    """
    Save AI-generated insights to MongoDB

    Args:
        insights_data: Insights document with class analysis and recommendations

    Returns:
        ID of saved insights record
    """
    try:
        db = get_db()
        insights_data["createdAt"] = datetime.utcnow()

        result = db.AI_Insights.insert_one(insights_data)
        insights_id = str(result.inserted_id)

        logger.info(f"✓ Saved insights {insights_id}")
        return insights_id
    except Exception as e:
        logger.error(f"Error saving insights: {e}")
        raise


def get_class_students(class_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all students in a class

    Args:
        class_id: Class ID

    Returns:
        List of student documents
    """
    try:
        db = get_db()
        students = list(db.students.find({"classId": class_id}))

        logger.info(f"✓ Retrieved {len(students)} students from class {class_id}")
        return students
    except Exception as e:
        logger.error(f"Error retrieving class students {class_id}: {e}")
        return []


def get_class_performance_summary(class_id: str) -> Dict[str, Any]:
    """
    Get aggregated performance data for entire class
    Used for generating teacher insights

    Args:
        class_id: Class ID

    Returns:
        Summary statistics (average scores, attendance, etc.)
    """
    try:
        db = get_db()

        # Aggregate student grades by class
        class_stats = db.grades.aggregate([
            {"$match": {"classId": class_id}},
            {"$group": {
                "_id": "$classId",
                "avgScore": {"$avg": "$score"},
                "minScore": {"$min": "$score"},
                "maxScore": {"$max": "$score"},
                "totalAttempts": {"$sum": 1}
            }}
        ])

        result = list(class_stats)
        summary = result[0] if result else {"avgScore": 0, "minScore": 0, "maxScore": 0, "totalAttempts": 0}

        logger.info(f"✓ Retrieved performance summary for class {class_id}")
        return summary
    except Exception as e:
        logger.error(f"Error retrieving class performance summary: {e}")
        return {}


def get_student_attendance(student_id: str) -> Dict[str, Any]:
    """
    Retrieve attendance record for student

    Args:
        student_id: Student ID

    Returns:
        Attendance data
    """
    try:
        db = get_db()
        attendance = db.attendance.find_one({"studentId": student_id})

        if attendance:
            logger.info(f"✓ Retrieved attendance for student {student_id}")
            return attendance
        return {"attendanceRate": 0}
    except Exception as e:
        logger.error(f"Error retrieving attendance: {e}")
        return {}


# ============================
# HEALTH CHECK
# ============================

def check_db_connection() -> bool:
    """
    Verify MongoDB connection is active

    Returns:
        True if connected, False otherwise
    """
    try:
        db = get_db()
        db.command('ping')
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
