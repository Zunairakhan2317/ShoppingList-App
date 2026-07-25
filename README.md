# 🛒 Smart Shopping & Budget AI

## 🌟 Overview & Real Problem Solved

* **App Name:** Smart Shopping & Budget AI
* **What it does:** A full-stack web application that allows users to input their grocery/shopping lists, track item prices in local currency (PKR), apply customizable store-wide discounts, evaluate budget compliance instantly, and organize items by automated categories using Pandas analytics. Additionally, it features an embedded Gemini AI optimization engine that acts as a personal financial advisor.
* **The Real Problem:** Managing daily grocery budgets, avoiding overspending at the checkout counter, and categorizing various household items can be tedious and prone to human miscalculation. This app solves this for everyday shoppers, budget-conscious students, and households who need instant, automated expense tracking and intelligent money-saving suggestions.

---

## 🔗 Live Deployed URL

* **Frontend (Vercel):** [Insert your Vercel Live URL Here]
* **Backend (Render):** [Insert your Render Backend URL Here]
* **GitHub Repository:** [Insert your Public GitHub Repo Link Here]

---

## ✨ Features List

* **Dynamic Item & Price Configuration:** Add, edit, and manage multiple products with custom names and prices on the fly.
* **Budget & Discount Calculator:** Real-time calculation of total costs, remaining balance, and custom discount integration against a defined maximum budget.
* **Pandas-Powered Analytics Dashboard:** Computes key financial metrics including minimum item price, maximum item price, average item cost, top spending category, and a breakdown of spending per category.
* **AI-Driven Optimization:** Leverages Google's Gemini AI to analyze shopping lists and output custom money-saving and optimization advice.
* **Saved Items Management:** Grouped view of saved items by category with interactive delete and clear options.
* **Instant Search API:** Search functionality to look up previously saved items and their categorized prices instantly.
* **Sleek Dark UI & Animations:** Built with Tailwind CSS and Framer Motion for buttery-smooth layout transitions and interactive hover effects.

---

## 🤖 AI Feature & System Instructions

* **What it does:** When a user submits their shopping list, the backend processes the data and sends a structured payload to **Google's Gemini AI model**. The model evaluates whether the user's spending fits within their target budget and generates personalized, actionable optimization advice (e.g., suggesting lower-cost alternatives or identifying non-essential items to cut).
* **AI Model Used:** `gemini-1.5-flash` (or your chosen Gemini model).
* **System Prompt / Instructions:**
> *"You are an expert AI budgeting and shopping assistant. Review the provided user shopping list, total cost, items, and target budget. Provide a concise, highly actionable optimization tip or alternative strategy in Markdown format to help the user save money and stay within their financial limits."*



---

## 🧰 Tools, Services, and Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion, React Markdown.
* **Backend:** FastAPI (Python), Pandas (for data analysis and aggregation).
* **AI Integration:** Google GenAI SDK (`google-genai`) powered by Gemini.
* **Deployment Services:**
* Vercel (Frontend Hosting)
* Render (Backend API Hosting)


* **Version Control:** Git & GitHub

---

## 📸 Screenshots of the App in Action

1. **Main Dashboard & Configuration Panel:** *(Add screenshot of the left configuration column and header)*
2. **Evaluation Summary & AI Optimization Tips:** *(Add screenshot showing total cost, remaining budget, and the Markdown AI tip box)*
3. **Pandas Analytics & Saved Categorized Items:** *(Add screenshot showing spending per category metrics and grouped item lists)*

---

## 🚀 How to Run the Project Locally

### Prerequisites

* Node.js (v18 or higher) installed
* Python (v3.10 or higher) installed

### 1. Clone the Repository

```bash
git clone https://github.com/Zunairakhan2317/SMARTSHOPPINGLIST.git
cd SMARTSHOPPINGLIST

```

### 2. Run the Backend (FastAPI)

```bash
cd Backend
# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pandas google-genai pydantic python-dotenv

# Set your Gemini API key environment variable
# Windows PowerShell: $env:GEMINI_API_KEY="your_api_key_here"
# Mac/Linux: export GEMINI_API_KEY="your_api_key_here"

# Start the FastAPI server
uvicorn main:app --reload --port 8000

```

### 3. Run the Frontend (Next.js)

Open a separate terminal window:

```bash
cd smart-shopping-frontend

# Install dependencies
npm install

# Create a .env.local file in the frontend root and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev

```

Open `http://localhost:3000` in your browser to use the app.
