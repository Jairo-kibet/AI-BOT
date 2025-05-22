from django.urls import path
from .views import home, signUp, newPage, sidebar, login, studentSignUp, homepPage, chatIndex, session_exit
from .utils import ask

urlpatterns = [
    path('', home, name='home'),
    path('sign-up/', signUp, name='register'),
    path('new/', newPage, name='newPage'),
    path('sidebar/', sidebar, name='sidebar'),
    path('sign-in/', login, name='login'),
    path('sign-out/', session_exit, name='logout'),
    path('student-sign-up/', studentSignUp, name='studentregister'),
    path('home-page/', homepPage, name='homepage'),
    path('chat-index/', chatIndex, name='chatindex'),
    path('ask/', ask, name='ask'),
]