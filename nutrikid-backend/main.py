import faiss
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
client = None

# =============================
# Lifespan Manager
# =============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedder, index, documents, client
    
    # 1. Load FAISS Index + Docs (First, to check dimension)
    index_dim = 384 # Default to small model dimension
    
    if os.path.exists("faiss_textbooks.index") and os.path.exists("rag_docs_textbooks_only.pkl"):
        print("Loading FAISS index and documents...")
        try:
            index = faiss.read_index("faiss_textbooks.index")
            with open("rag_docs_textbooks_only.pkl", "rb") as f:
                documents = pickle.load(f)
            
            # Detect dimension from index
            index_dim = index.d
            print(f"Detected FAISS index dimension: {index_dim}")
            
        except Exception as e:
            print(f"Error loading RAG data: {e}")
    else:
        print("\n" + "="*50)
        print("WARNING: 'faiss_textbooks.index' or 'rag_docs_textbooks_only.pkl' not found.")
        print("The API will run in MOCK mode (returning placeholder responses).")
        print("Please ensure these files are in the current directory.")
        print("="*50 + "\n")

    # 2. Load Embedding Model based on detected dimension
    print(f"Loading embedding model for dimension {index_dim}...")
    try:
        if index_dim == 384:
            # Small model
            embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        elif index_dim == 1024:
            # Large model (warning: slow download)
            print("Required model: BAAI/bge-large-en-v1.5 (1.34GB)")
            embedder = SentenceTransformer("BAAI/bge-large-en-v1.5")
        else:
            print(f"Warning: Unknown index dimension {index_dim}. Defaulting to all-MiniLM-L6-v2.")
            embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            
    except Exception as e:
        print(f"Warning: Failed to load embedding model: {e}")

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize LLM Client
    # Note: Ideally, use an environment variable for the token
    token = os.getenv("HF_TOKEN")
    if not token:
        print("Warning: HF_TOKEN environment variable not set. LLM features may not work.")
    
    client = InferenceClient(
        model="mistralai/Mistral-7B-Instruct-v0.2",
        token=token
    )
    
    yield
    
    # Clean up resources if needed
    print("Shutting down...")

# =============================
# FastAPI App
# =============================
app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    age: str = "5 years"
    weight: str = "Unknown"
    conditions: str = "None"
    prescription: str = "None"
    audience: str = "parent"

class MealLog(BaseModel):
    name: str
    portion: str = "1 serving"

class NutritionAnalysisRequest(BaseModel):
    age: int
    gender: str = "neutral"
    meals: list[MealLog]


def retrieve_context(query, k=4):
    if index is None or documents is None or embedder is None:
        return "No context available (Index/Documents not loaded)."
        
    query_embedding = embedder.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)
    
    # Retrieve documents based on indices
    retrieved_docs = []
    print(f"Retrieved indices: {indices[0]}") # Debugging
    
    for i in indices[0]:
        doc = documents[i]
        # Handle if doc is a dictionary (common in LangChain/RAG)
        if isinstance(doc, dict):
            # Try common keys for text content
            content = doc.get('page_content') or doc.get('text') or doc.get('content') or str(doc)
            retrieved_docs.append(content)
        # Handle if doc is an object (e.g. LangChain Document)
        elif hasattr(doc, 'page_content'):
             retrieved_docs.append(doc.page_content)
        # Handle if doc is already a string
        elif isinstance(doc, str):
            retrieved_docs.append(doc)
        else:
            retrieved_docs.append(str(doc))

    return "\n".join(retrieved_docs)

def generate_answer(query, profile):
    context = retrieve_context(query)

    # If running in mock mode because files are missing
    if index is None or documents is None:
        return ("(Mock Response) System is running in safe mode because RAG files are missing. "
                "Please place 'faiss_textbooks.index' and 'rag_docs_textbooks_only.pkl' in the project folder.")

    if profile.get("audience") == "kid":
         prompt = f"""
You are Food Buddy, a fun and friendly nutrition companion for kids! 🥦🦁

RULES:
- Start with a fun greeting!
- Use a storyteller voice.
- If asked for a story, make up a short, fun adventure about food heroes!
- Use simple words and lots of emojis.
- Explain things using superheroes (e.g., "Carrots give you X-ray vision like a hero!").
- Do NOT give medical advice.
- If asked about medicine, say "Ask a grown-up!".
- Structure your answer nicely using bullet points and short paragraphs.

Information about the kid:
Age: {profile["age"]}

Question: {query}

Context:
{context}

Answer like a best friend:
"""
    else:
        prompt = f"""
You are NutriGuide AI, an advanced pediatric nutrition assistant.

STRICT INSTRUCTIONS:
1. First, provide a **Direct, Short Answer** (2-3 sentences max). This must be practical and immediate advice.
2. Then, output exactly this separator: |||DETAILED|||
3. After the separator, provide a **Detailed Explanation**. Use Markdown formatting:
   - Use `###` for headers.
   - Use `-` for bullet points.
   - Use `**bold**` for key terms.
   - Explain *why* and give specific examples based on the Medical Context.

Profile:
Age: {profile["age"]}
Weight: {profile["weight"]}
Conditions: {profile["conditions"]}
Prescriptions: {profile["prescription"]}

Question: {query}

Context:
{context}

Format:
[Short Answer]
|||DETAILED|||
[Detailed Markdown Explanation]
"""

    try:
        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full error to terminal
        return f"Error generating response: {e}"

@app.post("/ask")
async def ask_ai(request: QueryRequest):
    profile = {
        "age": request.age,
        "weight": request.weight,
        "conditions": request.conditions,
        "prescription": request.prescription,
        "audience": request.audience
    }

    answer = generate_answer(request.question, profile)

    return {"answer": answer}

@app.post("/analyze")
async def analyze_nutrition(request: NutritionAnalysisRequest):
    # 1. Construct prompt for LLM to analyze nutrition
    meal_descriptions = ", ".join([f"{m.name} ({m.portion})" for m in request.meals])
    
    prompt = f"""
You are a Clinical Pediatric Nutritionist AI. 
Explain the micronutrient gaps based on the child's intake today vs Recommended Dietary Allowance (RDA) for a {request.age} year old.

Intake Today: {meal_descriptions}

Task:
1. Estimate the micronutrient content (Iron, Calcium, Vit A, Vit C, Vit D, Zinc, Magnesium).
2. Compare against RDA for age {request.age}.
3. Identify SUBSTANTIAL deficiencies (Gaps).
4. For each gap, suggest 1 specific food to add.

Format the output strictly as JSON:
```json
{{
  "analysis_summary": "Short clinical summary (max 2 sentences).",
  "deficiencies": [
    {{
      "nutrient": "Iron",
      "status": "Low" | "Very Low",
      "current_estimated": "3mg",
      "target": "10mg",
      "suggestion": "Add spinach or lentils"
    }}
  ],
  "score": 85
}}
```
Do not include any text outside the JSON block.
"""

    try:
        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.2
        )
        content = response.choices[0].message.content
        
        # Extract JSON from potential markdown code blocks
        import json
        import re
        
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find just braces if no code block
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            json_str = json_match.group(0) if json_match else "{}"
            
        return json.loads(json_str)

    except Exception as e:
        print(f"Error analyzing nutrition: {e}")
        return perform_rule_based_analysis(request.meals, request.age)

def perform_rule_based_analysis(meals, age):
    """Fallback analysis when LLM is unavailable."""
    meal_names = " ".join([m.name.lower() for m in meals])
    gaps = []
    
    # 1. Iron Check (Spinach, lentils, meat, dates, pomegranate)
    if not any(x in meal_names for x in ['palak', 'spinach', 'lentil', 'dal', 'meat', 'chicken', 'fish', 'egg', 'poha', 'dates', 'pomegranate']):
        gaps.append({
            "nutrient": "Iron",
            "status": "Low",
            "current_estimated": "Low",
            "target": "10mg",
            "suggestion": "Add spinach, dal, or eggs"
        })

    # 2. Calcium Check (Milk, curd, yogurt, cheese, paneer, ragi)
    if not any(x in meal_names for x in ['milk', 'curd', 'yogurt', 'cheese', 'paneer', 'ragi']):
        gaps.append({
            "nutrient": "Calcium",
            "status": "Low",
            "current_estimated": "Low",
            "target": "600mg",
            "suggestion": "Add a glass of milk or curd"
        })
        
    # 3. Vitamin C Check (Citrus, lemon, orange, guava, tomato, amla)
    if not any(x in meal_names for x in ['orange', 'lemon', 'guava', 'tomato', 'amla', 'capsicum', 'fruit']):
        gaps.append({
            "nutrient": "Vitamin C",
            "status": "Moderate",
            "current_estimated": "Low",
            "target": "40mg",
            "suggestion": "Add orange or guava"
        })
        
    # 4. Protein Check (Dal, eggs, meat, paneer, soya, nuts)
    if not any(x in meal_names for x in ['dal', 'egg', 'chicken', 'fish', 'paneer', 'soya', 'nut', 'sprout']):
        gaps.append({
            "nutrient": "Protein",
            "status": "Low",
            "current_estimated": "Low",
            "target": "20g",
            "suggestion": "Add lentils/dal or eggs"
        })

    score = 100 - (len(gaps) * 15)
    summary = "Basic analysis based on food groups (AI unavailable)." if gaps else "Diet looks balanced based on food groups."

    return {
        "analysis_summary": summary,
        "deficiencies": gaps,
        "score": max(score, 40)
    }


