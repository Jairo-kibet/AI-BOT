
from pathlib import Path
import os
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Groq API key (for your chatbot)
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")


# Application definition

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'frontend',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "development":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME_DEV", "smartcampus"),
            "USER": os.getenv("DB_USER_DEV", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD_DEV", ""),  # XAMPP = empty password
            "HOST": os.getenv("DB_HOST_DEV", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT_DEV", "3306"),  # XAMPP MySQL port
            "OPTIONS": {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME_DEV", "smartcampus"),
            "USER": os.getenv("DB_USER_DEV", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD_DEV", "jktech"),
            "HOST": os.getenv("DB_HOST_DEV", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT_DEV", "3306"),
            "OPTIONS": {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

# Optional SQLite backup
DATABASES["backup"] = {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": BASE_DIR / "db.sqlite3",
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
import os
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend', 'static'),]

from dotenv import load_dotenv
load_dotenv()

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

JAZZMIN_SETTINGS = {
    "site_title": "Sekusmartcampus Admin",  # Browser tab title
    "site_header": "Swekusmartcampus ai-bot",    # Top-left header
    "site_brand": "sekusmartcampus",          # Branding text in sidebar
    "site_logo": "assets/logo3.png",  # Path to your logo
    "welcome_sign": "Welcome to SEKUSMARTCAMPUS",
    "copyright": "Sekusmartcampus",
    "search_model": ["auth.User", "auth.Group"],
    "user_avatar": None,
    "show_sidebar": True,
    "navigation_expanded": True,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "body_small_text": True,
    "brand_colour": "#007F3E",               # SEKU green
    "accent": "#FFD700",                     # Gold/arid accent
    "navbar": "FFD700",  # Dark navbar with green
    "sidebar": "sidebar-light-success",      # Light sidebar with green highlights
    "sidebar_nav_compact_style": True,
    "theme": "litera",                       # Keep Bootstrap theme or customize later
}


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
