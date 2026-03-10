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
        throw new Error("Invalid provenance JSON file!");
    }else{
        //Initialization
        const nodes = [];
        const links = [];
        const nodeRelations = {}; // reverse lookup for doing queries
        const getInfo = id => nodeRelations[id] || { outgoing: [], incoming: [] };

        //function for relations parsing
        const registerEdge = (src, tgt, type) => {
            links.push({ source: src, target: tgt, type });

            if (!nodeRelations[src]) {
                nodeRelations[src] = { outgoing: [], incoming: [] };
            }
            if (!nodeRelations[tgt]){
                nodeRelations[tgt] = { outgoing: [], incoming: [] };
            }
            //updating the reverse lookup
            nodeRelations[src].outgoing.push({ type, target: tgt });
            nodeRelations[tgt].incoming.push({ type, source: src });
        };

        //node types
        const nodeTypes = {
            entity: "entity",
            activity: "activity",
            agent: "agent"
        };

        //Node parsing
        const nodeTypeKeys = Object.keys(nodeTypes);

        for (let i = 0; i < nodeTypeKeys.length; i++) {
            const key = nodeTypeKeys[i];
            const type = nodeTypes[key];
            if (!json[key]) {
                continue;
            }else{
                const nodeKeys = Object.keys(json[key]);
                for (let j = 0; j < nodeKeys.length; j++) {
                    const id = nodeKeys[j];
                    const raw = json[key][id];
                    nodes.push({
                        id, //node id
                        type,   //node type
                        label: raw["prov:label"]?.trim() || id, //node label or id
                        attributes: { ...raw }  //other node metadata
                    });
                    //creating the lookup if not existing
                    if (!nodeRelations[id]) {
                        nodeRelations[id] = { outgoing: [], incoming: [] };
                    }
                }
            }
        }

        //node id set for checking
        const nodeIds = new Set();
        for (let i = 0; i < nodes.length; i++) {
            nodeIds.add(nodes[i].id);
        }

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

        const relations = Object.keys(relationMap);
        //Generic relations parsing
        for (let i = 0; i < relations.length; i++) {
            const rel = relations[i];
            const map = relationMap[rel];
            if (!json[rel]) {
                continue;
            }else{
                const relationKeys = Object.keys(json[rel]);
                //extracts source and target nodes using the map
                for (let j = 0; j < relationKeys.length; j++) {
                    const relationId = relationKeys[j];
                    const r = json[rel][relationId];
                    const src = r[map.src];
                    const tgt = r[map.tgt];
                    //checking if id exist in nodeIds
                    if (nodeIds.has(src) && nodeIds.has(tgt)) {
                        registerEdge(src, tgt, rel);
                    }
                }
            }
        }
        //Wasderived special case with 3 links
        if (json.wasDerivedFrom) {
            const keys = Object.keys(json.wasDerivedFrom);
            for (let i = 0; i < keys.length; i++) {
                const relationId = keys[i];
                const rel = json.wasDerivedFrom[relationId];
                const generatedEntity = rel["prov:generatedEntity"];
                const usedEntity = rel["prov:usedEntity"];
                const activity = rel["prov:activity"];

                if (nodeIds.has(generatedEntity) && nodeIds.has(usedEntity)) {
                    registerEdge(generatedEntity, usedEntity, "wasDerivedFrom");
                }
                if (nodeIds.has(generatedEntity) && nodeIds.has(activity)) {
                    registerEdge(generatedEntity, activity, "wasGeneratedBy");
                }
                if (nodeIds.has(activity) && nodeIds.has(usedEntity)) {
                    registerEdge(activity, usedEntity, "used");
                }
            }
        }

        return { nodes, links, nodeRelations };
    }
}






