from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re
import traceback

# -----------------------------
# CONFIGURATION
# -----------------------------
# Clé Gemini directement dans le code
GEMINI_API_KEY = "AIzaSyBe2HuLtlraLZRZ8aFPTyQunmjqlwhSSuo"

# Initialisation Flask
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration de Gemini
if not GEMINI_API_KEY:
    print("❌ ERREUR: GEMINI_API_KEY non trouvée!")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        print("✅ Modèle Gemini configuré: gemini-1.5-flash-latest")
    except Exception as e:
        print(f"❌ Erreur configuration Gemini: {e}")

# -----------------------------
# ENDPOINTS
# -----------------------------

@app.route("/api/generate-meal-plan", methods=["POST"])
def generate_meal_plan():
    print("\n" + "="*50)
    print("🔵 NOUVELLE REQUÊTE DE GÉNÉRATION")
    print("="*50)
    
    try:
        if not GEMINI_API_KEY:
            return jsonify({"error": "Clé API Gemini non configurée"}), 500

        data = request.json
        print(f"📥 Données reçues: {data}")

        cuisine_type = data.get("cuisineType", "").strip()
        diet_type = data.get("dietType", "").strip()
        restrictions = data.get("restrictions", "").strip()

      # Validation des champs
        if not cuisine_type:
          return jsonify({"error": "Le champ 'Type de cuisine' est obligatoire"}), 400
    
        if not diet_type:
          return jsonify({"error": "Le champ 'Type alimentaire' est obligatoire"}), 400
    
        if not restrictions:
         return jsonify({"error": "Le champ 'Restrictions/Allergies' est obligatoire"}), 400

        # Prompt pour Gemini
        prompt = f"""
        Tu es un chef cuisinier. Génère un plan de repas hebdomadaire.

        Type de cuisine: {cuisine_type}
        Type alimentaire: {diet_type}
        Restrictions: {restrictions}

        Format strict JSON uniquement (sans texte avant/après):
        {{
            "mealPlan": [
                {{"day": "Lundi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Mardi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Mercredi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Jeudi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Vendredi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Samedi", "breakfast": "", "lunch": "", "dinner": ""}},
                {{"day": "Dimanche", "breakfast": "", "lunch": "", "dinner": ""}}
            ],
            "shoppingList": [
                {{"category": "Fruits & Légumes", "items": []}},
                {{"category": "Viandes & Poissons", "items": []}},
                {{"category": "Produits laitiers", "items": []}},
                {{"category": "Épicerie", "items": []}},
                {{"category": "Autres", "items": []}}
            ]
        }}
        Adapte les repas selon les préférences et restrictions.
        """

        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        }

        response = model.generate_content(prompt, generation_config=generation_config)
        response_text = response.text.strip()

        # Nettoyage markdown éventuel
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        response_text = response_text.strip()

        # Extraction du JSON
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            response_text = response_text[json_start:json_end]

        result = json.loads(response_text)

        # Validation
        if 'mealPlan' not in result or 'shoppingList' not in result:
            raise ValueError("Clés 'mealPlan' ou 'shoppingList' manquantes")

        if len(result['mealPlan']) != 7:
            raise ValueError(f"Attendu 7 jours, reçu {len(result['mealPlan'])}")

        print("✅ JSON valide généré")
        return jsonify(result), 200

    except json.JSONDecodeError as e:
        print(f"❌ ERREUR JSON: {e}")
        return jsonify({"error": "JSON mal formé", "details": str(e)}), 500

    except Exception as e:
        print(f"❌ ERREUR GÉNÉRALE: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Erreur serveur", "details": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY)
    }), 200

@app.route("/api/test-gemini", methods=["GET"])
def test_gemini():
    try:
        response = model.generate_content("Réponds juste 'OK'")
        return jsonify({"status": "ok", "response": response.text}), 200
    except Exception as e:
        return jsonify({"error": "Erreur Gemini", "details": str(e)}), 500

# -----------------------------
# LANCEMENT DU SERVEUR
# -----------------------------
if __name__ == "__main__":
    print("\n🚀 Serveur MEALPLAN AI lancé sur http://localhost:5000\n")
    app.run(debug=True, port=5000, host='0.0.0.0')
