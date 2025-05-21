from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'signUp.html')

def signUp(request):
    return render(request, 'signUp.html')

def newPage(request):
    return render(request, 'home.html')

def sidebar(request):
    return render(request, 'sidebar.html')

def login(request):
    return render(request, 'signIn.html')

def studentSignUp(request):
    return render(request, 'studentSignUp.html')

def homepPage(request):
    return render(request, 'homePage.html')

def chatIndex(request):
    return render(request, 'chatIndex.html')