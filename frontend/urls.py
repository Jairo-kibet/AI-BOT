from django.urls import path
from .views import home, signUp, newPage, sidebar, login, studentSignUp, homepPage

urlpatterns = [
    path('', home, name='home'),
    path('sign-up/', signUp, name='register'),
    path('new/', newPage, name='newPage'),
    path('sidebar/', sidebar, name='sidebar'),
    path('sign-in/', login, name='login'),
    path('student-sign-up/', studentSignUp, name='studentregister'),
    path('home-page/', homepPage, name='homepage'),
]