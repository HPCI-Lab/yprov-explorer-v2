/*
* Provenance Model: it's used to represent the provenance and, from it, will be generated the graph.
* Structure:
 parseProvenance(json):
    initialize nodes []
    initialize edges []
    parse entity
    parse activity
    parse agent
    parse relations
    return { nodes, edges }
 */
 /**
 * @param {*} data - json file
 * @returns {{nodes:Object[],links:Object[],nodeRelations:Object}} - provenance objects
 */
export default function parseProvenance(data) {
    //Initialization
    //node initiazilatzion
    let nodes = [];
    //link initialization
    let links = [];
    const nodeRelations = {}; // reverse lookup for doing queries
    const getInfo = id => nodeRelations[id] || { outgoing: [], incoming: [] };

    //Check the validity of the file
    if (!data || typeof data !== "object") {
        throw new Error("Invalid provenance JSON file!");
    }else{
        //function for converting the input into object
        function convertObject(value){
            if (Array.isArray(value)) {
                return value[0] || {};
            }
            if (value && typeof value === "object") {
                return value;
            }
            return {};
        }

        const nodeTypes = ["entity", "activity", "agent"];
        //node parsing
        for (let i = 0; i < nodeTypes.length; i++) {
            const type = nodeTypes[i];
            const group = data[type];
            if (!group) {
                continue;
            }else{
                const keys = Object.keys(group);
                //builds the nodes
                for (let j = 0; j < keys.length; j++) {
                    const id = keys[j];
                    const raw = convertObject(group[id]);
                    nodes.push({
                        id: id, //node id
                        type: type, //node type
                        label: raw["prov:label"]?.trim() || id,//node label or id
                        attributes: { ...raw }//other node metadata
                    });
                }
            }
        }

        // Create a map of nodes for easy access by ID
        const nodeMap = new Map(nodes.map((node) => [node.id, node]));

        //links relations
        links = [
            /**
             * The wasDerivedFrom relationship can be splitted into three: wasDerivedFrom, wasGeneratedBy and used
             * "wasDerivedFrom": {
             *  "": {
             *    "prov:generatedEntity": "",
             *    "prov:usedEntity": "",
             *    "prov:activity": ""
             * },
             */
            ...Object.values(data.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:generatedEntity"]),
                target: nodeMap.get(rel["prov:usedEntity"]),
                type: "wasDerivedFrom",
            })),
            ...Object.values(data.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:generatedEntity"]),
                target: nodeMap.get(rel["prov:activity"]),
                type: "wasGeneratedBy",
            })),
            ...Object.values(data.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:usedEntity"]),
                type: "used",
            })),
            ...Object.values(data.wasGeneratedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:entity"]),
                target: nodeMap.get(rel["prov:activity"]),
                type: "wasGeneratedBy",
            })),
            ...Object.values(data.used || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:entity"]),
                type: "used",
            })),
            ...Object.values(data.wasInformedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:informed"]),
                target: nodeMap.get(rel["prov:informant"]),
                type: "wasInformedBy",
            })),
            ...Object.values(data.hadMember || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:collection"]),
                target: nodeMap.get(rel["prov:entity"]),
                type: "hadMember",
            })),
            ...Object.values(data.wasStartedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:trigger"]),
                type: "wasStartedBy",
            })),
            ...Object.values(data.wasAssociatedWith || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:agent"]),
                type: "wasAssociatedWith",
            })),
            ...Object.values(data.wasAssociatedWith || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:plan"]),
                type: "plan",
            })),
            ...Object.values(data.wasAttributedTo || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:entity"]),
                target: nodeMap.get(rel["prov:agent"]),
                type: "wasAttributedTo",
            })),
        ].filter((link) => link.source && link.target);

        //builds nodeRelations
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            nodeRelations[node.id] = { incoming: [], outgoing: [] };
        }

        //builds the link relation
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            nodeRelations[link.source.id].outgoing.push({
                type: link.type,
                nodeId: link.target.id,
                index: i
            });
            nodeRelations[link.target.id].incoming.push({
                type: link.type,
                nodeId: link.source.id,
                index: i
            });
        }
    }
    return { nodes, links, nodeRelations };

}

//Graph Adapter, to prepare the object for the graph render
export function adapter(graph) {
    const nodes = graph.nodes.map(node => ({...node}));
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    const links = graph.links.map(link => ({
        source: nodeMap.get(link.source.id),
        target: nodeMap.get(link.target.id),
        type: link.type
    }));

    return { nodes, links, nodeRelations: graph.nodeRelations};
}







