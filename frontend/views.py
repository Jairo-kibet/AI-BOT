from django.shortcuts import redirect, render
from django.contrib.auth.hashers import check_password, make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
import json

from .models import User, ChatHistory, ChatMessage, starredChat

# Import your SEKU scraper
from .seku_scraper import (
    get_general_information,
    get_courses,
    get_admissions,
    get_fees,
    get_hostels,
    get_timetable,
    get_libraryas
)

# If you have a Groq AI call function
# from .groq_api import call_groq_api


# -------------------------------
# Basic pages and auth
# -------------------------------
def home(request):
    return render(request, 'index.html')

def signUp(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        if User.objects.filter(userEmail=username).exists():
            return render(request, "signUp.html", {"error": "Email already exists."})
        hashed_password = make_password(password)
        User(userEmail=username, userPassword=hashed_password).save()
        return redirect('login')
    return render(request, 'signUp.html')

def login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = User.objects.filter(userEmail=username).first()
        if user and check_password(password, user.userPassword):
            request.session['user_id'] = user.userId
            return redirect('homepage')
        return render(request, "signIn.html", {"error": "Invalid username or password."})
    return render(request, "signIn.html")

def session_exit(request):
    request.session.flush()
    return redirect('login')

def studentSignUp(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        if User.objects.filter(userEmail=username).exists():
            return render(request, "studentSignUp.html", {"error": "User already exists."})
        hashed_password = make_password(password)
        User(userEmail=username, userPassword=hashed_password, userType="student").save()
        return redirect('login')
    return render(request, 'studentSignUp.html')

def homepPage(request):
    if 'user_id' not in request.session:
        return redirect('login')

    user_id = request.session['user_id']
    user = User.objects.get(userId=user_id)

    chat_conversations = ChatHistory.objects.filter(userId=user).order_by('-date_created')
    starred_chats = ChatHistory.objects.filter(chatId__in=starredChat.objects.values('chatId')).distinct()

    if not chat_conversations.exists():
        ChatHistory.objects.create(userId=user, chat_heading="New Chat")
        chat_conversations = ChatHistory.objects.filter(userId=user).order_by('-date_created')

    if not starred_chats.exists():
        starred_chats = None

    return render(request, "homePage.html", {
        "username": user,
        "chat_conversations": chat_conversations,
        "starred_chats": starred_chats
    })


def chatIndex(request):
    return render(request, 'chatIndex.html')

def login_popup(request):
    return render(request, 'includes/loginPopUp.html')

def newPage(request):
    return render(request, 'home.html')
def sidebar(request):
    return render(request, 'sidebar.html')




# -------------------------------
# SEKU Web Scraper API Endpoint
# -------------------------------
@require_GET
def seku_data_view(request):
    """
    Fetch general SEKU website info via URL parameters:
    ?type=programmes / admissions / fees / hostels / timetable / library
    Or ?query=some+search+term for dynamic search
    """
    data_type = request.GET.get("type")
    user_query = request.GET.get("query")

    if user_query:
        # Dynamic search from scraper
        content = get_general_information(user_query)
        if not content:
            return JsonResponse({"error": "No results found on SEKU website."}, status=404)
        return JsonResponse({
            "source": "South Eastern Kenya University (SEKU)",
            "query": user_query,
            "data": content
        })

    if not data_type:
        return JsonResponse({"error": "Please provide either 'type' or 'query' parameter."}, status=400)

    # Map type to scraper functions
    scraper_map = {
        "programmes": get_courses,
        "admissions": get_admissions,
        "fees": get_fees,
        "hostels": get_hostels,
        "timetable": get_timetable,
        "library": get_libraryas
    }

    if data_type not in scraper_map:
        return JsonResponse({"error": f"Invalid type parameter: {data_type}"}, status=400)

    content = scraper_map[data_type]()

    return JsonResponse({
        "source": "South Eastern Kenya University (SEKU)",
        "type": data_type,
        "data": content
    })
