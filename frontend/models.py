from django.db import models

# Create your models here.

class User(models.Model):
    userId = models.AutoField(primary_key=True)
    userEmail = models.EmailField(max_length=150, unique=True)
    userPassword = models.CharField(max_length=150)
    userType = models.CharField(max_length=50, choices=[('admin', 'Admin'), ('student', 'Student'), ('teacher', 'Teacher'), ('not student', 'Not Student')], default='not student')

    def __str__(self):
        return self.username
    def __repr__(self):
        return f"User({self.username}, {self.email})"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Add any additional logic here if needed

    
    @property
    def custom_user_id(self):
        return f"stu{self.userId:05d}"

class ChatHistory(models.Model):
    chatId = models.AutoField(primary_key=True)
    userId = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_histories')
    chat_heading = models.CharField(max_length=150)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.chat_heading
    def __repr__(self):
        return f"ChatHistory({self.chat_heading}, {self.date_created})"         
    def save(self, *args, **kwargs):    
        super().save(*args, **kwargs)
        # Add any additional logic here if needed

class starredChat(models.Model):
    starredId = models.AutoField(primary_key=True)
    chatId = models.ForeignKey(ChatHistory, on_delete=models.CASCADE, related_name='starred_chats')
    userId = models.ForeignKey(User, on_delete=models.CASCADE, related_name='starred_chats')
    is_starred = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.is_starred)
    def __repr__(self):
        return f"StarredChat({self.is_starred})"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Add any additional logic here if needed

class ChatMessage(models.Model):
    messageId = models.AutoField(primary_key=True)
    chatId = models.ForeignKey(ChatHistory, on_delete=models.CASCADE, related_name='messages')
    input_query = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.input_query
    def __repr__(self):
        return f"ChatMessage({self.input_query}, {self.timestamp})"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Add any additional logic here if needed

class ChatFeedback(models.Model):
    feedbackId = models.AutoField(primary_key=True)
    messageId = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='feedbacks')
    messageFeed = models.CharField(max_length=8, choices=[('like', 'Like'), ('dislike', 'Dislike')], null=True, blank=True, default=None)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.messageFeed)
    def __repr__(self):
        return f"ChatFeedback({self.messageFeed}, {self.timestamp})"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Add any additional logic here if needed
