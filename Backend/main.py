import json
import os
import requests
import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")



app = FastAPI()

# --- Enable CORS for frontend integration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Category Mapping ---
CATEGORIES = {
    "milk": "Dairy",
    "cheese": "Dairy",
    "bread": "Bakery",
    "cake": "Bakery",
    "chicken": "Meat",
    "beef": "Meat",
    "apple": "Fruits",
    "banana": "Fruits"
}

# --- File Helpers ---
def save_to_file(data, filename="shopping_list.json"):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing_data = json.load(f)
    else:
        existing_data = []
    existing_data.extend(data)
    with open(filename, "w") as f:
        json.dump(existing_data, f, indent=4)

def load_from_file(filename="shopping_list.json"):
    if os.path.exists(filename):
        try:
            with open(filename, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def clear_file(filename="shopping_list.json"):
    if os.path.exists(filename):
        with open(filename, "w") as f:
            json.dump([], f)

def log_unknown_item(item, filename="unknown_items.json"):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing = json.load(f)
    else:
        existing = []
    existing.append(item)
    with open(filename, "w") as f:
        json.dump(existing, f, indent=4)

# --- Gemini Helpers ---
def ai_suggest_alternative(name, price, budget_exceeded=False):
    prompt = f"Suggest 3 alternatives for {name} around {price} PKR. For each, explain briefly why it is healthier (e.g., more vitamins, less sugar)."
    if budget_exceeded:
        prompt += " The user is overspending, suggest a cheaper substitution."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=data)
        print("Gemini response:", response.text)  # Debug
        if response.status_code == 200:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            return f"No AI suggestion available for {name}"
    except Exception as e:
        return f"Error contacting Gemini API: {str(e)}"

def ai_optimize_list(items, budget):
    prompt = f"Here is a shopping list: {items}. Optimize it to fit within {budget} PKR. Suggest substitutions or removals to stay under budget, while keeping it healthy."
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=data)
        print("Gemini optimization response:", response.text)
        if response.status_code == 200:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            return "No optimization suggestion available."
    except Exception as e:
        return f"Error contacting Gemini API: {str(e)}"

# --- Product Class ---
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def apply_discount(self, percent):
        discount_amount = self.price * (percent / 100)
        self.price -= discount_amount
        return self.price

    def suggest_alternative(self, budget_exceeded=False):
        return ai_suggest_alternative(self.name, self.price, budget_exceeded)

    def get_category(self):
        category = CATEGORIES.get(self.name.lower(), "Other")
        if category == "Other":
            log_unknown_item({"name": self.name, "price": self.price})
        return category

# --- Request Models ---
class Item(BaseModel):
    name: str
    price: float

class ShoppingRequest(BaseModel):
    items: list[Item]
    discount: float = 0
    budget: float = 0

# --- Routes ---
@app.get("/")
def home():
    return {"message": "Smart Shopping List Backend with FastAPI + NumPy + Pandas + Gemini AI is running!"}

@app.post("/products")
def products_route(request: ShoppingRequest):
    products = []
    final_prices = []

    for item in request.items:
        p = Product(item.name, item.price)
        final_price = p.apply_discount(request.discount)
        final_prices.append(final_price)

        products.append({
            "name": p.name,
            "final_price": final_price,
            "alternative": p.suggest_alternative(),
            "category": p.get_category()
        })

    np_prices = np.array(final_prices)
    total_cost = float(np_prices.sum())
    fits_budget = bool(total_cost <= request.budget)

    budget_alert = None
    if not fits_budget:
        overspend = total_cost - request.budget
        budget_alert = f"You are overspending by {overspend} PKR"
        for product in products:
            product["alternative"] = Product(product["name"], product["final_price"]).suggest_alternative(True)

    summary = {
        "total_cost": total_cost,
        "budget": request.budget,
        "remaining_budget": float(request.budget - total_cost),
        "fits_budget": fits_budget,
        "average_price": float(np_prices.mean()),
        "min_price": float(np_prices.min()),
        "max_price": float(np_prices.max()),
        "budget_alert": budget_alert,
        "optimization": ai_optimize_list([p.name for p in request.items], request.budget)
    }

    save_to_file(products)
    return {"products": products, "summary": summary}

@app.get("/saved")
def get_saved_list():
    saved_list = load_from_file()
    if not saved_list:
        return {"message": "No saved items found."}

    df = pd.DataFrame(saved_list)
    analytics = {
        "total_items": int(len(df)),
        "average_price": float(df["final_price"].mean()),
        "min_price": float(df["final_price"].min()),
        "max_price": float(df["final_price"].max()),
        "spending_per_category": {k: float(v) for k, v in df.groupby("category")["final_price"].sum().to_dict().items()},
        "items_per_category": {k: int(v) for k, v in df["category"].value_counts().to_dict().items()},
        "top_category": df.groupby("category")["final_price"].sum().idxmax(),
        "ai_savings_tip": ai_optimize_list([item["name"] for item in saved_list], sum(item["final_price"] for item in saved_list))
    }

    grouped = df.groupby("category").apply(lambda x: x.to_dict(orient="records")).to_dict()
    return {"grouped": grouped, "analytics": analytics}

@app.get("/search")
def search_item(name: str = Query(..., description="Item name to search")):
    saved_list = load_from_file()
    results = [item for item in saved_list if item["name"].lower() == name.lower()]
    if results:
        return {"results": results}
    return {"message": f"No item named {name} found."}

@app.post("/delete")
def delete_item(name: str):
    saved_list = load_from_file()
    updated_list = [item for item in saved_list if item["name"].lower() != name.lower()]
    if len(updated_list) == len(saved_list):
        return {"message": f"No item named {name} found to delete."}
    with open("shopping_list.json", "w") as f:
        json.dump(updated_list, f, indent=4)
    return {"message": f"Item {name} deleted successfully.", "remaining_items": updated_list}

@app.post("/clear")
def clear_saved_list():
    clear_file()
    return {"message": "Shopping list cleared successfully!"}

