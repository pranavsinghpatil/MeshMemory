from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv('../../.env')  # Adjust the path to point to your .env file

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("Available environment variables:", dict(os.environ))  # Debug: Show all env vars
    raise ValueError("Missing Supabase configuration")
else:
    print("Supabase configuration found")
    print("Supabase URL:", supabase_url)
    print("Supabase Key exists:", bool(supabase_key))