// Base URL for the backend API
const BASE_URL = "http://localhost:8002/docs";

// Function to get all documents from the backend
export async function getAlldocuments() {
  const res = await fetch(`${BASE_URL}/search/all`);
  if (!res.ok) {
    throw new Error("Error");
  }
  return res.json();
}

// Function to generate demo documents
export async function generateDemodocuments() {
  const res = await fetch(`${BASE_URL}/demo/start`, {
    method: "GET"
  });
  if (!res.ok) {
    throw new Error("Errore nella generazione demo");
  }
  return res.json();
}

// Map a document from the backend to the catalog format
function mapdocumentToCatalog(file) {
  const s = file.source;

  return {
    //base data
    id: file.id,
    score: file.score,

    name: s.title,
    author: s.author,
    description: s.description,
    version: s.version,
    date: s.created_at,
    storage_url: s.storage_url,
    pid: s.pid,

    owner_email: s.owner_email,
    keywords: s.keywords,
    lineage: s.lineage,
    parent_document_pid: s.parent_document_pid,
    yProvIstance: s.yProvIstance,

    other_versions: file.other_versions,

    preview: null,
  };
}


export async function getCatalogdocuments() {
  const Files = await getAlldocuments();
  return Files.map(mapdocumentToCatalog);
}

