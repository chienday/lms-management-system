"""
AI service module for LLM integration
Handles all calls to OpenAI API for generating answers, quizzes, and insights
"""

import logging
import json
from typing import Optional, Dict, Any, List
from openai import OpenAI

from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_TIMEOUT,
    OPENAI_MAX_TOKENS,
    OPENAI_TEMPERATURE
)

logger = logging.getLogger(__name__)

# ============================
# OPENAI CLIENT INITIALIZATION
# ============================

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def check_ai_availability() -> bool:
    """Check if OpenAI API is configured"""
    if client is None:
        logger.warning("⚠ OpenAI API key not configured")
        return False
    return True


# ============================
# CHATBOT RESPONSES
# ============================

def generate_chat_response(
    question: str,
    lecture_content: Optional[str] = None,
    student_performance: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[str]] = None,
    context_with_sources: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate contextual chatbot response for student question
    Enhanced to return dict with answer + sources for RAG

    Args:
        question: Student's question
        lecture_content: Relevant lecture material for context (legacy)
        student_performance: Student's performance metrics
        chat_history: Previous conversation messages
        context_with_sources: Formatted context with lecture references (new)

    Returns:
        Dict with: { answer, sources, confidence, reasoning }
    """
    if not check_ai_availability():
        return {
            "answer": "⚠️ AI service is not configured. Please contact administrator.",
            "sources": [],
            "confidence": 0.0,
            "reasoning": "AI service unavailable"
        }

    try:
        # Build enhanced context with RAG
        context_str = ""
        if context_with_sources:
            context_str = context_with_sources
        else:
            # Fallback: build context without sources
            context_str = "Based on course material and your learning:"
            if lecture_content:
                context_str += f"\n\n📚 Relevant content:\n{lecture_content[:500]}..."
            if student_performance:
                context_str += f"\n📊 Your current performance:\n- Average score: {student_performance.get('avgScore', 'N/A')}"

        # Build enhanced system prompt for RAG
        system_prompt = """You are an AI tutor helping students learn based on course materials and personalized learning data.

Your role:
- Answer questions clearly and step-by-step based on PROVIDED MATERIALS
- Provide educational explanations without just giving away answers
- Give relevant examples when helpful
- Detect learning gaps and suggest review topics
- Be encouraging and supportive
- IMPORTANT: Only answer based on provided course content, not general knowledge alone

Citation Format:
- When referencing course material, mention the source like: "According to [Lecture Title]..." or "Based on the material from [Date]..."
- If you use specific information from materials, be specific about the source

Respond in the same language as the student's question.
Keep responses concise but thorough (200-500 words max)."""

        # Build user message
        user_message = f"{context_str}\n\nStudent Question: {question}"

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=OPENAI_TEMPERATURE,
            max_tokens=OPENAI_MAX_TOKENS,
            timeout=OPENAI_TIMEOUT
        )

        answer = response.choices[0].message.content
        
        # Extract sources from context_with_sources if available
        sources = []
        if context_with_sources and "Lecture:" in context_with_sources:
            # Simple source extraction - look for lecture references
            import re
            matches = re.findall(r'\[.*?\]', context_with_sources)
            sources = [m.strip('[]') for m in matches[:3]]  # Limit to 3 sources

        logger.info(f"✓ Generated chat response for question: {question[:50]}...")
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence": 0.85,  # Placeholder - could be dynamic
            "reasoning": "Generated from RAG context with student performance data"
        }

    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        return {
            "answer": f"I apologize, I encountered an error: {str(e)}",
            "sources": [],
            "confidence": 0.0,
            "reasoning": f"Error: {str(e)}"
        }


def generate_learning_insights(
    question: str,
    student_performance: Dict[str, Any],
    quiz_history: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generate personalized learning insights based on student data

    Args:
        question: Student's original question (indicates area of interest)
        student_performance: Student's performance metrics
        quiz_history: History of quiz attempts

    Returns:
        List of insights with topic, suggestion, and severity
    """
    if not check_ai_availability():
        return []

    try:
        # Build performance summary
        weak_topics = identify_weak_topics(quiz_history)
        avg_score = student_performance.get('avgScore', 0)
        
        performance_summary = f"""
Student Performance Summary:
- Average Score: {avg_score}/100
- Weak Topics: {', '.join(weak_topics) if weak_topics else 'None identified'}
- Question Asked: {question}
"""

        prompt = f"""Based on this student's performance data, provide 2-3 specific learning recommendations
in JSON format. Prioritize based on severity.

{performance_summary}

Return ONLY valid JSON (no markdown) with this structure:
[
  {{"topic": "Topic Name", "suggestion": "Specific actionable recommendation", "severity": "high|medium|low"}},
  {{"topic": "Topic Name", "suggestion": "Specific actionable recommendation", "severity": "high|medium|low"}}
]

Severity guidelines:
- "high": Score < 50% or missing concepts
- "medium": Score 50-75% or moderate gaps
- "low": Score > 75% or advanced topics
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an educational advisor. Provide JSON-formatted insights only with severity levels."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=600,
            timeout=OPENAI_TIMEOUT
        )

        insights_text = response.choices[0].message.content

        # Parse JSON response
        insights = json.loads(insights_text)
        
        # Ensure severity field exists
        for insight in insights:
            if 'severity' not in insight:
                insight['severity'] = 'medium'
        
        logger.info(f"✓ Generated {len(insights)} learning insights with severity levels")
        return insights

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse insights JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"Error generating learning insights: {e}")
        return []


# ============================
# QUIZ GENERATION
# ============================

def generate_quiz_questions(
    lecture_content: str,
    subject_name: str = "the subject",
    question_count: int = 5
) -> List[Dict[str, Any]]:
    """
    Generate multiple choice quiz questions from lecture content

    Args:
        lecture_content: Text content of lecture
        subject_name: Name of subject for context
        question_count: Number of questions to generate (5-10)

    Returns:
        List of generated questions with options and correct answers
    """
    if not check_ai_availability():
        return []

    question_count = max(5, min(10, question_count))  # Clamp between 5-10

    try:
        prompt = f"""Generate exactly {question_count} multiple choice questions based on this lecture content.

LECTURE CONTENT:
{lecture_content[:2000]}

REQUIREMENTS:
- Each question must test understanding, not just memorization
- 4 options per question (labeled A, B, C, D)
- Exactly 1 correct answer per question
- Mix difficulty levels (some easy, some challenging)
- Return ONLY valid JSON (no markdown, no explanations)

Return this JSON structure:
[
  {{
    "questionText": "What is...?",
    "options": [
      {{"label": "A", "text": "Option A"}},
      {{"label": "B", "text": "Option B"}},
      {{"label": "C", "text": "Option C"}},
      {{"label": "D", "text": "Option D"}}
    ],
    "correctOption": "B"
  }}
]"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"You are an educational expert creating quiz questions for {subject_name}. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            timeout=OPENAI_TIMEOUT
        )

        questions_text = response.choices[0].message.content
        questions = json.loads(questions_text)

        logger.info(f"✓ Generated {len(questions)} quiz questions")
        return questions

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse quiz questions JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"Error generating quiz questions: {e}")
        return []


# ============================
# INSIGHTS GENERATION FOR TEACHERS
# ============================

def generate_class_insights(
    class_summary: Dict[str, Any],
    students_data: List[Dict[str, Any]],
    class_name: str = "Class"
) -> List[Dict[str, str]]:
    """
    Generate AI insights about class performance for teachers

    Args:
        class_summary: Aggregated class statistics
        students_data: Individual student performance data
        class_name: Name of the class

    Returns:
        List of insights with student IDs, topics, and recommendations
    """
    # Return empty list if no data available (fallback)
    if not students_data or not class_summary.get('avgScore'):
        logger.warning("⚠ No class data available for insights generation")
        return []

    if not check_ai_availability():
        logger.warning("⚠ OpenAI API not available, returning empty insights")
        return []

    try:
        # Prepare student performance summary
        students_summary = ""
        for student in students_data[:10]:  # Limit to first 10 for token efficiency
            students_summary += f"\n- {student.get('name', 'Unknown')}: Score {student.get('avgScore', 'N/A')}"

        prompt = f"""Analyze this class performance data and generate 3-5 actionable insights for the teacher.

CLASS: {class_name}
Average Score: {class_summary.get('avgScore', 'N/A')}/10
Score Range: {class_summary.get('minScore', 'N/A')} - {class_summary.get('maxScore', 'N/A')}
Total Assessments: {class_summary.get('totalAttempts', 'N/A')}

TOP STUDENTS & AT-RISK STUDENTS:
{students_summary}

Identify:
1. Students at risk of failing
2. Common weak topics in the class
3. High-performing students who could help peers
4. Recommended interventions/remediation

Return ONLY valid JSON (no markdown):
[
  {{
    "studentId": "student_id",
    "topic": "topic name",
    "insightType": "at_risk|weak_topic|excelling|suggested_intervention",
    "recommendation": "specific action recommendation"
  }}
]"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert educational analyst. Provide actionable insights in JSON format only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=1500,
            timeout=OPENAI_TIMEOUT
        )

        insights_text = response.choices[0].message.content
        insights = json.loads(insights_text)

        logger.info(f"✓ Generated {len(insights)} class insights")
        return insights

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse insights JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"Error generating class insights: {e}")
        return []


# ============================
# HELPER FUNCTIONS
# ============================

def identify_weak_topics(quiz_history: List[Dict[str, Any]]) -> List[str]:
    """
    Identify weak topics from quiz history

    Args:
        quiz_history: List of quiz attempt records

    Returns:
        List of topics where student performed poorly
    """
    weak_topics = []
    try:
        for quiz in quiz_history[:5]:  # Check last 5 quizzes
            score = quiz.get('score', 100)
            if score < 70:  # Low score threshold
                topic = quiz.get('topic', quiz.get('subject', 'Unknown'))
                if topic not in weak_topics:
                    weak_topics.append(topic)
    except Exception as e:
        logger.error(f"Error identifying weak topics: {e}")

    return weak_topics
