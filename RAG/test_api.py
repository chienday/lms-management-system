#!/usr/bin/env python3
"""
Test script for Political Theory RAG Chatbot API
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_chat():
    """Test the chat endpoint"""
    print("🧪 Testing chat endpoint...")

    test_questions = [
        "Giải thích khái niệm dân chủ theo Aristotle?",
        "Chủ nghĩa xã hội khác gì chủ nghĩa tư bản?",
        "Quyền con người gồm những thế hệ nào?",
        "Tư tưởng chính trị của Plato về lý tưởng quốc?"
    ]

    for question in test_questions:
        print(f"\n❓ Question: {question}")

        payload = {
            "message": question,
            "session_id": "test_session"
        }

        try:
            response = requests.post(f"{API_BASE_URL}/chat", json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                print("✅ Response received")
                print(f"📝 Answer preview: {data['response'][:200]}...")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")

        time.sleep(2)  # Wait between requests

def test_history():
    """Test the history endpoint"""
    print("\n📚 Testing history endpoint...")

    try:
        response = requests.get(f"{API_BASE_URL}/history/test_session")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ History retrieved: {len(history.get('history', []))} messages")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def test_health():
    """Test the health endpoint"""
    print("\n❤️  Testing health endpoint...")

    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Service is {health.get('status', 'unknown')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def main():
    """Main test function"""
    print("🚀 Starting Political Theory RAG API Tests")
    print("=" * 50)

    # Test health first
    test_health()

    # Test chat functionality
    test_chat()

    # Test history
    test_history()

    print("\n" + "=" * 50)
    print("✅ All tests completed!")

if __name__ == "__main__":
    main()