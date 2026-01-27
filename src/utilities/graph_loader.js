/* utilities/graph_loader.js 
Function to load graph data from a given URL */

export const loadGraphFromURL = async (url) => {
  // Fetch the graph JSON from the URL
    try {
    // fetch graph data 
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    const nodes = [
        // prepare nodes
      ...Object.keys(data.activity).map(id => ({ id, type: "activity" })),
      ...Object.keys(data.entity).map(id => ({ id, type: "entity" })),
    ];

    const links = [
        // prepare links
      ...Object.values(data.used).map(d => ({
        source: d["prov:activity"],
        target: d["prov:entity"],
      })),
      ...Object.values(data.wasGeneratedBy).map(d => ({
        source: d["prov:activity"],
        target: d["prov:entity"],
      })),
    ];

    return { json: data, nodes, links };
  } catch (error) {
    // handle errors
    console.error("Error loading graph:", error);
    return null;
  }
};
