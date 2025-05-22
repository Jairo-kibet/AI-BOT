from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from datetime import datetime
from django.contrib.auth.hashers import check_password
from .models import User, ChatHistory, ChatMessage  # Ensure this model exists in your app

from .models import ChatHistory, ChatMessage  # Ensure these models exist in your app
from .utils import match_intent, call_groq_api  # Ensure these utility functions exist
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
import json


# Create your views here.
def home(request):
    return render(request, "index.html")

def new_chat(request):
    return render(request, "new_chat.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = User.objects.filter(username=username).first()
        if user and check_password(password, user.password):
            request.session['user_id'] = user.id
            return redirect('user_chat')
        else:
            return render(request, "login.html", {"error": "Invalid username or password."})
    return render(request, "login.html")

def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        # Check for duplicate username or email
        if User.objects.filter(username=username).exists():
            return render(request, "register.html", {"error": "Username already exists."})
        if User.objects.filter(email=email).exists():
            return render(request, "register.html", {"error": "Email already exists."})
        hashed_password = make_password(password)
        user = User(username=username, email=email, password=hashed_password)
        user.save()
        request.session['user_id'] = user.id
        return redirect('user_chat')
    return render(request, "register.html")

def user_chat(request):
    if 'user_id' in request.session:
        user_id = request.session['user_id']
        user = User.objects.get(id=user_id)
        chat_histories = ChatHistory.objects.filter(user=user).order_by('-date_created')
        # If no chat history exists, create a new chat for this user
        if not chat_histories.exists():
            new_chat = ChatHistory.objects.create(user=user, chat_heading="New Chat")
            chat_histories = ChatHistory.objects.filter(user=user).order_by('-date_created')
        return render(request, "user_chat.html", {"username": user.username, "chat_histories": chat_histories})
    else:
        return redirect('login')

@csrf_exempt
def create_new_chat(request):
    if request.method == "POST":
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'User not logged in'}, status=401)
        user = User.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Get the most recent chat for this user
        last_chat = ChatHistory.objects.filter(user=user).order_by('-date_created').first()
        if last_chat:
            has_messages = ChatMessage.objects.filter(chat=last_chat).exists()
            if not has_messages:
                # Don't create a new chat if the last chat is empty, just activate it
                return JsonResponse({'chat_id': last_chat.id, 'created': False})
        # Otherwise, create a new chat
        new_chat = ChatHistory.objects.create(user=user, chat_heading="New Chat")
        return JsonResponse({'chat_id': new_chat.id, 'created': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)
    
@require_GET
def get_chat_messages(request):
    chat_id = request.GET.get('chat_id')
    if not chat_id:
        return JsonResponse({'error': 'No chat_id provided'}, status=400)
    try:
        chat = ChatHistory.objects.get(id=chat_id)
    except ChatHistory.DoesNotExist:
        return JsonResponse({'error': 'Chat not found'}, status=404)
    messages = ChatMessage.objects.filter(chat=chat).order_by('timestamp')
    messages_data = [
        {
            'input_query': m.input_query,
            'bot_response': m.bot_response,
            'timestamp': m.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for m in messages
    ]
    return JsonResponse({'messages': messages_data})

def logout(request):
    request.session.flush()
    return redirect('login')

@csrf_exempt
@require_POST
def delete_chat(request):
    data = json.loads(request.body.decode('utf-8'))
    chat_id = data.get('chat_id')
    if not chat_id:
        return JsonResponse({'error': 'No chat_id provided'}, status=400)
    try:
        chat = ChatHistory.objects.get(id=chat_id)
        # Explicitly delete all messages for this chat
        ChatMessage.objects.filter(chat=chat).delete()
        chat.delete()
        return JsonResponse({'success': True})
    except ChatHistory.DoesNotExist:
        return JsonResponse({'error': 'Chat not found'}, status=404)