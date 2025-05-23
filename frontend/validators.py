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


# Create your views here.python manage.py makemigrations frontendpython manage.py makemigrations frontend


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
        user = User.objects.filter(userId=user_id).first() if user_id else None
        if not user_id or not user:
            return redirect('login')

        # Get the most recent chat for this user
        last_chat = ChatHistory.objects.filter(userId=user.userId).order_by('-date_created').first()
        if last_chat:
            has_messages = ChatMessage.objects.filter(chatId=last_chat.chatId).exists()
            if not has_messages:
                # Don't create a new chat if the last chat is empty, just activate it
                return JsonResponse({'chat_id': last_chat.chatId, 'created': False})
        # Otherwise, create a new chat
        new_chat = ChatHistory.objects.create(userId=user.userId, chat_heading="New Chat")
        return JsonResponse({'chat_id': new_chat.chatId, 'created': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)
    
@require_GET
def get_chat_messages(request):
    chat_id = request.GET.get('chat_id')
    if not chat_id:
        return JsonResponse({'error': 'No chat_id provided'}, status=400)
    try:
        chat = ChatHistory.objects.get(chatId=chat_id)
    except ChatHistory.DoesNotExist:
        return JsonResponse({'error': 'Chat not found'}, status=404)
    messages = ChatMessage.objects.filter(chatId=chat).order_by('timestamp')
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