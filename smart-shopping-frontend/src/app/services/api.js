// src/services/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function submitShoppingList(payload) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to process shopping list");
  return response.json();
}

export async function fetchSavedList() {
  const response = await fetch(`${API_URL}/saved`);
  if (!response.ok) throw new Error("Failed to fetch saved items");
  return response.json();
}

export async function searchItemApi(name) {
  const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error("Failed to search item");
  return response.json();
}

export async function deleteItem(name) {
  const response = await fetch(`${API_URL}/delete?name=${encodeURIComponent(name)}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to delete item");
  return response.json();
}

export async function clearList() {
  const response = await fetch(`${API_URL}/clear`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to clear list");
  return response.json();
}