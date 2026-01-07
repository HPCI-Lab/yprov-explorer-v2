/* 
    service for fetching catalog data with filters
*/

import { apiFetch } from "./ConnectionF";

export function getCatalog(filters = {}) {

  return apiFetch("/search/all", {
    params: filters
  });
}
