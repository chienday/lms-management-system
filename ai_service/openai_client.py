import os
from openai import OpenAI

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None

MODEL = "gpt-3.5-turbo"  # hoặc "gpt-4" nếu có quota


def analyze_learning(prompt: str) -> str:
    """
    Sử dụng OpenAI để phân tích học tập
    Trả về JSON string
    """
    if client is None:
        return "[OPENAI_ERROR] OPENAI_API_KEY is not set"
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Bạn là hệ thống AI Learning Analytics. Trả lời bằng JSON hợp lệ, không có markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
            timeout=30
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        return f'{{"error": "OpenAI API error: {str(e)}"}}'


def chat_tutor(message: str) -> str:
    """
    Sử dụng OpenAI để trả lời câu hỏi học tập
    Trả về plain text (không JSON)
    """
    if client is None:
        return "[OPENAI_ERROR] OPENAI_API_KEY is not set"
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Bạn là một tutor AI giúp sinh viên học tập. 
Hướng dẫn:
- Trả lời các câu hỏi một cách rõ ràng, dễ hiểu
- Giải thích chi tiết nhưng ngắn gọn
- Tập trung giúp sinh viên hiểu khái niệm, không chỉ cho đáp án
- Nếu cần, đưa ra ví dụ minh họa
- Trả lời bằng tiếng Việt nếu câu hỏi là tiếng Việt"""
                },
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=1000,
            timeout=30
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        return f"Lỗi tải phản hồi từ AI: {str(e)}"
