import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def ingest_url(url: str) -> dict:
    """Scrapes text from a webpage."""
    print(f"--- Scraper: Fetching {url} ---")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        text = soup.get_text(separator='\n')
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        title = soup.title.string if soup.title else url
        
        return {
            "text": clean_text,
            "source": url,
            "title": title
        }
    except Exception as e:
        print(f"!!! Error scraping URL: {e}")
        raise e

def get_youtube_id(url: str) -> str:
    """Extracts video ID from YouTube URL."""
    parsed = urlparse(url)
    if parsed.hostname == 'youtu.be':
        return parsed.path[1:]
    if parsed.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed.path == '/watch':
            p = parse_qs(parsed.query)
            return p['v'][0]
        if parsed.path[:7] == '/embed/':
            return parsed.path.split('/')[2]
        if parsed.path[:3] == '/v/':
            return parsed.path.split('/')[2]
    return ""

def ingest_youtube(url: str) -> dict:
    """Fetches transcript from YouTube video."""
    print(f"--- YouTube: Fetching {url} ---")
    try:
        video_id = get_youtube_id(url)
        if not video_id:
            raise ValueError("Invalid YouTube URL")
            
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine transcript
        full_text = ""
        for item in transcript_list:
            full_text += item['text'] + " "
            
        # Get title using oEmbed (Official/Clean way)
        try:
            oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
            response = requests.get(oembed_url)
            if response.status_code == 200:
                title = response.json()['title']
            else:
                title = f"YouTube Video ({video_id})"
        except:
            title = f"YouTube Video ({video_id})"
            
        return {
            "text": full_text,
            "source": url,
            "title": title
        }
    except Exception as e:
        print(f"!!! Error fetching YouTube transcript: {e}")
        raise e
