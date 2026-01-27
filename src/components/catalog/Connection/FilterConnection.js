// FilterConnection.js
import { apiFetch } from "./ConnectionF";

// Function to search the catalog based on a query
export function searchCatalog(query) {
  const q = query != null ? String(query) : "";

  if (q !== "") {
    return apiFetch("/search/fulltext", { params: { query: q } });
  } else {
    return apiFetch("/search/all");
  }
}

export function getCatalog(query) {
  return searchCatalog(query);
}
