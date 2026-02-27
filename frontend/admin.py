from django.contrib import admin

# Register your models here.

from .models import User, ChatHistory, starredChat, ChatMessage, ChatFeedback

admin.site.register(User)
admin.site.register(ChatHistory)
admin.site.register(starredChat)
admin.site.register(ChatMessage)
admin.site.register(ChatFeedback)
