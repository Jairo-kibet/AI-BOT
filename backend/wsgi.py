import os
from django.core.wsgi import get_wsgi_application
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
# API_KEY is now safely read from .env inside your utils.py, no need to hardcode here

application = get_wsgi_application()