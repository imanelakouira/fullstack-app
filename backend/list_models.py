import google.generativeai as genai

# Mets ici ta clé Gemini
GEMINI_API_KEY = "AIzaSyBe2HuLtlraLZRZ8aFPTyQunmjqlwhSSuo"
genai.configure(api_key=GEMINI_API_KEY)

# Liste les modèles disponibles
models = genai.list_models()
for m in models:
    print(m)
