/* 
    service for making API requests 
*/

const BASE_URL = "";

function buildQuery(params) {
  const queryParts = [];
  for (const key in params) {
    // Support array parameters
    if (Array.isArray(params[key])) {
      // Multiple values for the same key
      params[key].forEach((val) => queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`));
    } else if (params[key] !== undefined && params[key] !== null) {
     // Single value
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  return queryParts.join("&");
}

export async function apiFetch(endpoint, { params } = {}) {
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = buildQuery(params);
    if (query) url += `?${query}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}
