from django.urls import path
from .views import home, signUp, newPage, sidebar, login, studentSignUp, homepPage, chatIndex, session_exit, login_popup
from .utils import ask
from .validators import create_new_chat, chat_rename, chat_star, chat_delete, get_chat_messages

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
    path('login-popup/', login_popup, name='login_popup'),
    path('ask/', ask, name='ask'),
    path('create-new-chat/', create_new_chat, name='create_new_chat'),
    path('chat-rename/', chat_rename, name='chat_rename'),
    path('chat-star/', chat_star, name='chat_star'),
    path('chat-delete/', chat_delete, name='chat_delete'),
    path('get-chat-messages/', get_chat_messages, name='get_chat_messages'),
]