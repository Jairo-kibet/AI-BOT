from django.shortcuts import redirect, render
from django.contrib.auth.hashers import check_password
from .models import User, ChatHistory, ChatMessage, starredChat
from django.contrib.auth.hashers import make_password

# Create your views here.
def home(request):
    return render(request, 'index.html')



def signUp(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        if User.objects.filter(userEmail=username).exists():
            return render(request, "signUp.html", {"error": "Email already exists."})
        hashed_password = make_password(password)
        user = User(userEmail=username, userPassword=hashed_password)
        user.save()
        return redirect('login')
    return render(request, 'signUp.html')

def newPage(request):
    return render(request, 'home.html')

def sidebar(request):
    return render(request, 'sidebar.html')

def login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = User.objects.filter(userEmail=username).first()
        if user and check_password(password, user.userPassword):
            request.session['user_id'] = user.userId
            return redirect('homepage')
        else:
            return render(request, "signIn.html", {"error": "Invalid username or password."})
    return render(request, "signIn.html")

def session_exit(request):
    request.session.flush()
    return redirect('login')

def studentSignUp(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        student = True
        if User.objects.filter(userEmail=username).exists():
            return render(request, "studentSignUp.html", {"error": "User already exists."})
        hashed_password = make_password(password)
        user = User(userEmail=username, userPassword=hashed_password, userType="student")
        user.save()
        return redirect('login')
    return render(request, 'studentSignUp.html')

def homepPage(request):
    if 'user_id' in request.session:
        user_id = request.session['user_id']
        user = User.objects.get(userId=user_id)
        chat_conversations = ChatHistory.objects.filter(userId=user).order_by('-date_created')
        # starred_chats = starredChat.objects.filter(userId=user).order_by('-date_created')

        starred_chats = ChatHistory.objects.filter(chatId__in=starredChat.objects.values('chatId')).distinct()

        # for chat_conversation in chat_conversations
        # If there is no chat hconversations for the perticular logged in user
        if not chat_conversations.exists():
            new_chat = ChatHistory.objects.create(userId=user, chat_heading="New Chat")
            chat_conversations = ChatHistory.objects.filter(userId=user).order_by('-date_created')
        if not starred_chats.exists():
            starred_chats = None
        return render(request, "homePage.html", {"username": user, "chat_conversations": chat_conversations, "starred_chats": starred_chats})
    else:
        return redirect('login')
    
def chatIndex(request):
    return render(request, 'chatIndex.html')