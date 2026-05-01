import faiss
print("FASTAPI SERVER STARTING...")
import pickle
import numpy as np
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from huggingface_hub import InferenceClient

# Global variables for models and data
embedder = None
index = None
documents = None
hf_client = None
gemini_client = None

# =============================
# Lifespan Manager
# =============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedder, index, documents, hf_client, gemini_client
    
    # 1. Load FAISS Index + Docs
    index_dim = 384 
    
    if os.path.exists("faiss_textbooks.index") and os.path.exists("rag_docs_textbooks_only.pkl"):
        print("Loading FAISS index and documents...")
        try:
            index = faiss.read_index("faiss_textbooks.index")
            with open("rag_docs_textbooks_only.pkl", "rb") as f:
                documents = pickle.load(f)
            index_dim = index.d
            print(f"Detected FAISS index dimension: {index_dim}")
        except Exception as e:
            print(f"Error loading RAG data: {e}")
    else:
        print("\n" + "="*50)
        print("WARNING: RAG files missing. Running in MOCK mode.")
        print("="*50 + "\n")

    # 2. Load Embedding Model
    print(f"Loading embedding model...")
    try:
        embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    except Exception as e:
        print(f"Warning: Failed to load embedding model: {e}")

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize Hugging Face LLM Client
    hf_token = os.getenv("HF_TOKEN")
    hf_client = InferenceClient(
        model="HuggingFaceH4/zephyr-7b-beta",
        token=hf_token
    )

    # Initialize Gemini LLM Client Pipeline 
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        try:
            from google import genai
            gemini_client = genai.Client(api_key=gemini_api_key)
            print("Gemini API Client initialized.")
        except ImportError:
            print("google-genai library missing.")
    
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    question: str
    history: list[Message] = []
    age: str = "5 years"
    weight: str = "Unknown"
    conditions: str = "None"
    prescription: str = "None"
    audience: str = "parent"

class MealLog(BaseModel):
    name: str
    portion: str = "1 serving"
    calories: float = 0
    protein: float = 0

class NutritionAnalysisRequest(BaseModel):
    age: int
    gender: str = "neutral"
    weight: float = 0.0
    duration_months: int = 1
    meals: list[MealLog]

def retrieve_context(query, k=4):
    if index is None or documents is None or embedder is None:
        return "No context available."
    query_embedding = embedder.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)
    retrieved_docs = []
    for i in indices[0]:
        doc = documents[i]
        if isinstance(doc, dict):
            retrieved_docs.append(doc.get('page_content') or str(doc))
        elif hasattr(doc, 'page_content'):
             retrieved_docs.append(doc.page_content)
        else:
            retrieved_docs.append(str(doc))
    return "\n".join(retrieved_docs)

def generate_answer(query, history, profile):
    context = retrieve_context(query)
    # Using dynamic context for standard Q&A
    prompt = f"You are NutriGuide AI... \nAge: {profile['age']}\nWeight: {profile['weight']}\nContext: {context}"

    formatted_messages = []
    for msg in history:
        formatted_messages.append({"role": msg.role, "content": msg.content})
    final_query = f"{prompt}\n\nQuestion: {query}"
    formatted_messages.append({"role": "user", "content": final_query})

    try:
        if hf_client:
            response = hf_client.chat_completion(messages=formatted_messages, max_tokens=600, temperature=0.3)
            return response.choices[0].message.content
    except Exception:
        if gemini_client:
            gemini_contents = [{"role": "user", "parts": [{"text": final_query}]}]
            response = gemini_client.models.generate_content(model='gemini-1.5-flash', contents=gemini_contents)
            return response.text
    return "Error generating response."

@app.post("/ask")
async def ask_ai(request: QueryRequest):
    profile = {"age": request.age, "weight": request.weight, "conditions": request.conditions, "prescription": request.prescription, "audience": request.audience}
    answer = generate_answer(request.question, request.history, profile)
    return {"answer": answer}

@app.post("/analyze")
async def analyze_nutrition(request: NutritionAnalysisRequest):
    meal_descriptions = ", ".join([f"{m.name} ({m.portion}, {m.calories}kcal)" for m in request.meals])
    
    prompt = f"""
You are a Clinical Pediatric Nutritionist AI. Provide a STANDOUT, DYNAMIC clinical analysis based on current intake.

Child Profile:
- Age: {request.age} years
- Gender: {request.gender}
- Current Weight: {request.weight} kg

Logged Intake: {meal_descriptions}

Task:
1. **Dynamic Math**: Calculate average daily calories. Compare with RDA for a {request.age}yo child weighing {request.weight}kg.
2. **Predictive Weight Projection ({request.duration_months} Months)**: 
   - Based on caloric surplus/deficit, predict weight in exactly {request.duration_months} month(s).
   - Use percentages: "Weight will increase/decrease by X.X%."
   - Target goal: "In {request.duration_months} month(s), the child is forecasted to weigh [Calculated Weight] kg."
3. **Deficiency Gaps**: Identify specific micronutrient risks.
4. **Actionable Superfoods**: Suggest 3 Indian foods to fix the gap.

Format strictly as JSON:
```json
{{
  "analysis_summary": "...",
  "score": 85,
  "deficiencies": [{{ "nutrient": "...", "status": "...", "current_estimated": "...", "target": "...", "suggestion": "..." }}],
  "projections": {{
    "monthly_risk": "...",
    "weight_prediction": "Detailed sentence with % and kg forecasting for {request.duration_months} month(s).",
    "percentage_change": "X.X% change",
    "forecast_weight": "XX.X kg",
    "forecast_duration": "{request.duration_months} Month(s)",
    "warning_signs": "..."
  }},
  "top_foods_to_add": ["...", "...", "..."]
}}
```
"""
    try:
        # Prioritize Gemini for dynamic complex math if key exists
        if gemini_client:
            print(f"Generating content with Gemini for analysis...")
            response = gemini_client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            content = response.text
        elif hf_client:
             print(f"Generating content with HuggingFace for analysis...")
             response = hf_client.chat_completion(messages=[{"role": "user", "content": prompt}], max_tokens=800, temperature=0.2)
             content = response.choices[0].message.content
        else:
             raise HTTPException(status_code=503, detail="No AI client available")
    except Exception as e:
        print(f"AI error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

    import json, re
    # More robust JSON extraction
    json_match = re.search(r'(\{.*\})', content, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            pass
    
    raise HTTPException(status_code=500, detail={"error": "Failed to parse AI output", "raw": content})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
