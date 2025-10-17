import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key loaded: {api_key is not None}")

if api_key:
    genai.configure(api_key=api_key)
    try:
        import pprint
        models = genai.list_models()
        print("Available models:")
        for model in models:
            print(model.name)
        # Now try to use one
        model = genai.GenerativeModel('models/gemini-flash-latest')
        response = model.generate_content("Summarize the following learning notes in one concise sentence: I learned about using Flask to build APIs.")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No API key")
