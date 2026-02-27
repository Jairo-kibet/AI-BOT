import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://www.seku.ac.ke"

HEADERS = {
    "User-Agent": "SEKU-AI-Assistant/1.0 (Educational Research Bot)"
}

# -------------------------------
# 1. Fetch page and clean text
# -------------------------------
def fetch_clean_text(url):
    """
    Fetch a webpage and return cleaned text without headers, nav, scripts, etc.
    """
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        return text
    except Exception:
        return ""
    
def extract_timetables(page_text):
    """
    Look for tables or sections with keywords like "semester", "timetable"
    Returns structured text
    """
    lines = page_text.split("\n")
    timetable_lines = []
    capture = False

    for line in lines:
        l_lower = line.lower()
        if "semester" in l_lower or "timetable" in l_lower:
            capture = True
        if capture:
            timetable_lines.append(line)
            # Stop capturing if section seems done (empty line)
            if line.strip() == "":
                capture = False

    return "\n".join(timetable_lines[:1000])

# -------------------------------
# 2. Search SEKU site for relevant pages
# -------------------------------
def search_seku_website(query):
    """
    Search SEKU website and return top links related to query
    """
    try:
        search_url = f"{BASE_URL}/?s={query}"
        response = requests.get(search_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        links = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            # Full URL handling
            if href.startswith("/"):
                full_url = urljoin(BASE_URL, href)
            elif BASE_URL in href:
                full_url = href
            else:
                continue

            # Only include links whose text contains the query
            if query.lower() in a.get_text().lower():
                links.add(full_url)

        return list(links)[:5]  # top 5 links
    except Exception:
        return []


# -------------------------------
# 3. Extract relevant information from pages
# -------------------------------
def extract_relevant_info(page_text, keywords):
    """
    Filter page text and only include paragraphs with keywords
    """
    collected_text = ""
    paragraphs = page_text.split("\n")
    for p in paragraphs:
        if any(word.lower() in p.lower() for word in keywords):
            collected_text += p + "\n"
    return collected_text


# -------------------------------
# 4. General-purpose SEKU info
# -------------------------------
def get_general_information(user_query):
    """
    Main function to scrape SEKU website for any user query.
    Dynamically detects courses, timetable, fees, admissions, etc.
    """
    keywords = user_query.lower().split()
    links = search_seku_website(user_query)

    if not links:
        return None

    collected_text = ""

    for link in links:
        page_text = fetch_clean_text(link)
        collected_text += extract_relevant_info(page_text, keywords)

    return collected_text[:6000] if collected_text else None


# -------------------------------
# 5. Specific info shortcuts
# -------------------------------
def get_courses():
    return fetch_clean_text(urljoin(BASE_URL, "/programmes"))

def get_admissions():
    return fetch_clean_text(urljoin(BASE_URL, "/admissions"))

def get_fees():
    return fetch_clean_text(urljoin(BASE_URL, "/fees"))

def get_hostels():
    return fetch_clean_text(urljoin(BASE_URL, "/hostels"))

def get_timetable():
    return fetch_clean_text(urljoin(BASE_URL, "/timetable"))

def get_libraryas():
    return fetch_clean_text(urljoin(BASE_URL, "/library"))
