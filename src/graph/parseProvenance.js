/*
Provenance Model: it's used to represent the provenance and, from it, will be generated the graph.
Structure:
parseProvenance(json):
    initialize nodes []
    initialize edges []
    parse entity
    parse activity
    parse agent
    parse relations
    return { nodes, edges }
 */

export default function parseProvJSON(json) {
    //Check the validity of the file
    if (!json || typeof json !== "object") {
        throw new Error("Invalid provenance JSON");
    }

    //Initialization
    const nodes = [];
    const edges = [];
    const lookup = {}; // reverse lookup for doing queries
    const getInfo = id => lookup[id] || { outgoing: [], incoming: [] };

    //function for relations parsing
    const registerEdge = (src, tgt, type) => {
        edges.push({ source: src, target: tgt, type });

        if (!lookup[src]) lookup[src] = { outgoing: [], incoming: [] };
        if (!lookup[tgt]) lookup[tgt] = { outgoing: [], incoming: [] };
        //updating the reverse lookup
        lookup[src].outgoing.push({ type, target: tgt });
        lookup[tgt].incoming.push({ type, source: src });
    };

    //node types
    const nodeTypes = {
        entity: "entity",
        activity: "activity",
        agent: "agent"
    };

    //Node parsing
    for (const [key, type] of Object.entries(nodeTypes)) {
        if (!json[key]) continue;

        //retrieve id and metadata(raw) from the note
        Object.entries(json[key]).forEach(([id, raw]) => {
            nodes.push({
                id, //node id
                type,   //node type
                label: raw["prov:label"]?.trim() || id, //node label or id
                attributes: { ...raw }  //other node metadata
            });
            //creating the lookup if not existing
            if (!lookup[id]) lookup[id] = { outgoing: [], incoming: [] };
        });
    }

    //node id set for checking
    const nodeIds = new Set(nodes.map(n => n.id));

    //Links map
    const relationMap = {
        used: { src: "prov:activity", tgt: "prov:entity" },
        wasGeneratedBy: { src: "prov:entity", tgt: "prov:activity" },
        wasInformedBy: { src: "prov:informant", tgt: "prov:informed" },
        hadMember: { src: "prov:collection", tgt: "prov:entity" },
        wasStartedBy: { src: "prov:activity", tgt: "prov:trigger" },
        wasAssociatedWith: { src: "prov:activity", tgt: "prov:agent" },
        wasAttributedTo: { src: "prov:entity", tgt: "prov:agent" },
    };

    //Generic relations parsing
    for (const [rel, map] of Object.entries(relationMap)) {
        if (!json[rel]) continue; //check

        //extracts source and target nodes using the map
        Object.values(json[rel]).forEach(r => {
            const src = r[map.src];
            const tgt = r[map.tgt];
            //checking if id exist in nodeIds
            if (nodeIds.has(src) && nodeIds.has(tgt)) {
                //add the link in oter edges
                registerEdge(src, tgt, rel);
            }
        });
    }

    //Wasderived special case with 3 links
    if (json.wasDerivedFrom) {
        Object.values(json.wasDerivedFrom).forEach(rel => {
            const generatedEntity = rel["prov:generatedEntity"];
            const usedEntity = rel["prov:usedEntity"];
            const activity = rel["prov:activity"];

            if (nodeIds.has(generatedEntity) && nodeIds.has(usedEntity)) registerEdge(generatedEntity, usedEntity, "wasDerivedFrom");
            if (nodeIds.has(generatedEntity) && nodeIds.has(activity)) registerEdge(generatedEntity, activity, "wasGeneratedBy");
            if (nodeIds.has(activity) && nodeIds.has(usedEntity)) registerEdge(activity, usedEntity, "used");
        });
    }

    return { nodes, edges, lookup };
}
