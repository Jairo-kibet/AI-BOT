import json
import requests
import os
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

# Load intents from intents.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_PATH = os.path.join(BASE_DIR, "intents.json")
with open(INTENTS_PATH, encoding="utf-8") as file:
    data = json.load(file)

# Use environment variable for API key
API_KEY = os.getenv('GROQ_API_KEY')

# System prompt
system_prompt = """
You are SEKU AI Assistant, the official virtual assistant for South Eastern Kenya University (SEKU).

You MUST ONLY answer questions strictly related to SEKU University.
Do NOT suggest any other universities or programs outside SEKU.

Topics:
- Courses and programs offered at SEKU
- Admission requirements
- Fees and scholarships
- Hostels and student accommodation
- Exams, results, academic calendar
- Faculty, departments, and campus info
- Student services and policies

Always include "South Eastern Kenya University (SEKU)" in your response.

If the question is not about SEKU:
"I'm sorry, I can only assist with queries related to South Eastern Kenya University (SEKU). Please ask a SEKU-related question."
"""

def call_groq_api(prompt, user_type=None, chat_history=None):
    """Call the Groq API with the given prompt and optional chat history."""
    messages = [{"role": "system", "content": system_prompt}]
    
    if chat_history:
        for msg in chat_history:
            messages.append({"role": "user", "content": msg['input_query']})
            messages.append({"role": "assistant", "content": msg['bot_response']})
    
    messages.append({"role": "user", "content": prompt})
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "llama-3.3-70b-versatile", "messages": messages, "temperature": 0.2}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        result = response.json()
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        return f"Groq Error: {result}"
    except Exception as e:
        return f"API call failed: {str(e)}"

def match_intent(user_input):
    """Match user input against intents in intents.json."""
    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in user_input.lower():
                return intent["response"]
    return None

@csrf_exempt
def ask(request: HttpRequest):
    """Django view to handle chatbot requests."""
    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        user_msg = data.get('message', '')
        # Here you can implement session or DB-based chat history if needed
        response = call_groq_api(user_msg)
        return JsonResponse({"response": response, "timestamp": datetime.now().isoformat()})
    
    return JsonResponse({"error": "Invalid request"}, status=400)