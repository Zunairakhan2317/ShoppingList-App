import json
import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)
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
# --- File Handling Helpers ---
def save_to_file(data, filename="shopping_list.json"):
    # Load existing data first
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    # Add new data to the list
    existing_data.extend(data)

    # Save back to file
    with open(filename, "w") as f:
        json.dump(existing_data, f, indent=4)


def load_from_file(filename="shopping_list.json"):
    if os.path.exists(filename):
        try:
            with open(filename, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            # File exists but is corrupted
            return []
        except Exception as e:
            # Catch any other unexpected error
            print(f"Error loading file: {e}")
            return []
    return []
# --- Unknown Item Logger ---
def log_unknown_item(item, filename="unknown_items.json"):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing = json.load(f)
    else:
        existing = []
    existing.append(item)
    with open(filename, "w") as f:
        json.dump(existing, f, indent=4)
# clear the shopping list file
def clear_file(filename="shopping_list.json"):
    if os.path.exists(filename):
        with open(filename, "w") as f:
            json.dump([], f)   # overwrite with empty list

class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def apply_discount(self, percent):
        discount_amount = self.price * (percent / 100)
        self.price -= discount_amount
        return self.price

    def suggest_alternative(self):
        if self.name.lower() == "bread":
            return "brown bread instead of white"
        elif self.name.lower() == "milk":
            return "low-fat milk instead of whole"
        else:
            return f"No alternative for {self.name}"

    def is_within_budget(self, budget):
        return self.price <= budget

    def get_category(self):
     category = CATEGORIES.get(self.name.lower(), "Other")
     if category == "Other":
        log_unknown_item({"name": self.name, "price": self.price})
     return category



@app.route("/")
def home():
    return "Smart Shopping List Backend with OOP + Budget is running!"

@app.route("/products", methods=["POST"])
def products_route():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({"error": f"Invalid JSON input: {str(e)}"}), 400

    items = data.get("items", [])
    discount = data.get("discount", 0)
    budget = data.get("budget", 0)

    products = []
    errors = []

    for item in items:
        name = item.get("name")
        price = item.get("price")

        # Validation checks
        if not name:
            errors.append({"error": "Missing product name", "item": item})
            continue
        if price is None:
            errors.append({"error": f"Missing price for {name}", "item": item})
            continue
        if not isinstance(price, (int, float)):
            errors.append({"error": f"Invalid price type for {name}", "item": item})
            continue

        products.append(Product(name, price))

    if errors:
        return jsonify({"errors": errors}), 400

    # Process valid products
    response = []
    final_prices = []

    for p in products:
        final_price = p.apply_discount(discount)
        final_prices.append(final_price)
        response.append({
            "name": p.name,
            "final_price": final_price,
            "alternative": p.suggest_alternative(),
            "within_budget": p.is_within_budget(budget),
            "category": p.get_category()
        })

    # NumPy analytics
    np_prices = np.array(final_prices)
    summary = {
        "total_cost": float(np_prices.sum()),
        "budget": budget,
        "fits_budget": bool(np_prices.sum() <= budget),
        "average_price": float(np_prices.mean()),
        "min_price": float(np_prices.min()),
        "max_price": float(np_prices.max())
    }

    save_to_file(response)
    return jsonify({"products": response, "summary": summary})


@app.route("/saved", methods=["GET"])
def get_saved_list():
    saved_list = load_from_file()

    if not saved_list:
        return jsonify({"message": "No saved items found."})

    # Convert saved list into a Pandas DataFrame
    df = pd.DataFrame(saved_list)

    # Analytics using Pandas
    analytics = {
        "total_items": len(df),
        "average_price": float(df["final_price"].mean()),
        "min_price": float(df["final_price"].min()),
        "max_price": float(df["final_price"].max()),
        "spending_per_category": df.groupby("category")["final_price"].sum().to_dict(),
        "items_per_category": df["category"].value_counts().to_dict()
    }

    # Group items by category for display
    grouped = df.groupby("category").apply(lambda x: x.to_dict(orient="records")).to_dict()

    return jsonify({"grouped": grouped, "analytics": analytics})




@app.route("/clear", methods=["POST"])
def clear_saved_list():
    clear_file()
    return jsonify({"message": "Shopping list cleared successfully!"})



if __name__ == "__main__":
    app.run(debug=True)
