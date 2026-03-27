import { Flex } from "@chakra-ui/react";
import Sidebar from "./components/layout/sidebar/Sidebar";
import SidePanelManager from "./components/layout/sidebar/SidePanelManager";
import TopBar from "./components/layout/TopBar";
import CodePanel from "./components/layout/CodePanel";
import GraphContainer from "./components/layout/GraphContainer";
import Timeline from "./components/layout/Timeline";
import { useEffect, useState, useRef, useMemo } from "react";
import {Resizable} from "re-resizable";
import { unifiedFileLoader } from "./server/unified-loader";
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
    //State for sidebar activation
    const [activePanel, setActivePanel] = useState(null);
    //State for closing the sidebar
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    //Function for ovening the sidebar panel
    const onOpenPanel = (panel) => {
        if(panel === activePanel && isSidePanelOpen) {
            onClosePanel(true);
            return;
        }
        setActivePanel(panel);
        setIsSidePanelOpen(true);
    };

    //Function for closing the sidebar panel
    const onClosePanel = () => {
        setIsSidePanelOpen(false);
        setActivePanel(null);
    };

//------------------------------------------------------------------------------------------
// State for the selected node
    const [selectedNode, setSelectedNode] = useState(null);
    // State for the highlighted node
    const [highlightedNode, setHighlightedNode] = useState(null);
    // State for the search query
    const [searchQuery, setSearchQuery] = useState("");
    // State for the graph data
    const [graphData, setGraphData] = useState(null);
    // State for the file URL
    const [fileUrl, setFileUrl] = useState(null);
    //Json content state
    // JSON text content (string or formatted array)
    const [jsonContent, setJsonContent] = useState(null);

    const [animationState, setAnimationState] = useState({ currentIndex: 0, currentTime: 0 });
    const linksByActivityRef = useRef({});
    const jsonLabelRef = useRef(null);
    const [currentFileName, setCurrentFileName] = useState("main.json");

    // Function to handle node click
    const handleNodeClick = (nodeInfo) => {
        setSelectedNode(nodeInfo); // Set the selected node
        setHighlightedNode(nodeInfo.id); // Highlight the selected node

        // Update the browser history with the node ID
        const currentUrl = fileUrl
            ? `?file=${encodeURIComponent(fileUrl)}#${nodeInfo.id}`
            : `#${nodeInfo.id}`;

        const currentState = window.history.state || {};
        if (currentState.idNodo !== nodeInfo.id) {
            window.history.pushState({ idNodo: nodeInfo.id }, "", currentUrl);
        }
    };

    // Function to handle search
    const handleSearch = (query) => {
        setSearchQuery(query); // Set the search query
    };

    // Function to find node details in the graph data
    useEffect(() => {
        const loadFromUrl = async () => {
            const params = new URLSearchParams(window.location.search);
            const fileParam = params.get("file");
            const nodeId = window.location.hash.substring(1);

            if (fileParam) {
                try {
                    const result = await unifiedFileLoader(fileParam);

                    setFileUrl(fileParam);
                    setGraphData(result.data);

                    if (nodeId) {
                        const nodeDetails = findNodeDetails(nodeId, result.data);
                        if (nodeDetails) {
                            setSelectedNode(nodeDetails);
                            setHighlightedNode(nodeId);
                        }
                    }
                } catch (error) {
                    console.error("Error loading file:", error);
                }
            }
        };

        loadFromUrl();
    }, []); // Effect runs only on mount


    // Function to synchronize the node with the browser history
    useEffect(() => {
        // Function to sync node with history
        const syncNodeWithHistory = (event) => {
            const nodeId = event?.state?.idNodo || window.location.hash.substring(1); // Get the node ID from the URL

            // If the node ID and graph data are available
            if (nodeId && graphData) {
                const nodeDetails = findNodeDetails(nodeId, graphData); // Find the node details
                if (nodeDetails) {
                    setSelectedNode(nodeDetails); // Set the selected node
                    setHighlightedNode(nodeId); // Highlight the selected node
                }
            }
        };

        // Function to sync initial node
        const syncInitialNode = () => {
            const initialNodeId = window.location.hash.substring(1); // Get the initial node ID from the URL
            if (initialNodeId && graphData) {
                const initialNodeDetails = findNodeDetails(initialNodeId, graphData); // Find the initial node details
                if (initialNodeDetails) {
                    setSelectedNode(initialNodeDetails); // Set the selected node
                    setHighlightedNode(initialNodeId); // Highlight the selected node
                    // Update the browser history with the initial node ID
                    window.history.replaceState(
                        { idNodo: initialNodeId },
                        "",
                        `#${initialNodeId}`
                    );
                }
            }
        };

        // Add listener to sync node with history
        window.addEventListener("popstate", syncNodeWithHistory);

        // Sync initial node
        syncInitialNode();

        // Cleanup function to remove the listener when the component is unmounted
        return () => {
            window.removeEventListener("popstate", syncNodeWithHistory);
        };
    }, [graphData]); // Effect runs when the graph data changes

    // Function to find node details in the graph data
    const findNodeDetails = (nodeId, graphData) => {
        if (!graphData) return null;

        // Obtain the node details from the graph data
        const entityNode = graphData.entity[nodeId];
        const activityNode = graphData.activity[nodeId];
        const agentNode = graphData.agent ? graphData.agent[nodeId] : null;

        // Create a map of nodes for easy access
        const nodes = [
            ...Object.keys(graphData.entity).map((key) => ({
                id: key,
                group: "entity",
            })),
            ...Object.keys(graphData.activity).map((key) => ({
                id: key,
                group: "activity",
            })),
            ...Object.keys(graphData.agent || {}).map((key) => ({
                id: key,
                group: "agent",
            })),
        ];
        const nodeMap = new Map(nodes.map((node) => [node.id, node]));

        // Create an array of links based on the graph data
        const links = [
            /**
             * The wasDerivedFrom relationship can be splitted into three: wasDerivedFrom, wasGeneratedBy and used
             * "wasDerivedFrom": {
             *  "": {
             *    "prov:generatedEntity": "",
             *    "prov:usedEntity": "",
             *    "prov:activity": ""
             * },
             */


            ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:generatedEntity"]),
                target: nodeMap.get(rel["prov:usedEntity"]),
                type: "wasDerivedFrom",
            })),
            ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:generatedEntity"]),
                target: nodeMap.get(rel["prov:activity"]),
                type: "wasGeneratedBy",
            })),
            ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:usedEntity"]),
                type: "used",
            })),
            ...Object.values(graphData.wasGeneratedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:entity"]),
                target: nodeMap.get(rel["prov:activity"]),
                type: "wasGeneratedBy",
            })),
            ...Object.values(graphData.used || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:entity"]),
                type: "used",
            })),
            ...Object.values(graphData.wasInformedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:informed"]),
                target: nodeMap.get(rel["prov:informant"]),
                type: "wasInformedBy",
            })),
            ...Object.values(graphData.hadMember || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:collection"]),
                target: nodeMap.get(rel["prov:entity"]),
                type: "hadMember",
            })),
            ...Object.values(graphData.wasStartedBy || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:trigger"]),
                type: "wasStartedBy",
            })),
            ...Object.values(graphData.wasAssociatedWith || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:activity"]),
                target: nodeMap.get(rel["prov:agent"]),
                type: "wasAssociatedWith",
            })),
            ...Object.values(graphData.wasAttributedTo || {}).map((rel) => ({
                source: nodeMap.get(rel["prov:entity"]),
                target: nodeMap.get(rel["prov:agent"]),
                type: "wasAttributedTo",
            })),
        ].filter((link) => link.source && link.target);

        // Filter the links based on the selected node

        const wasGeneratedBy = links.filter(
            (link) => link.type === "wasGeneratedBy" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const used = links.filter(
            (link) => link.type === "used" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const wasDerivedFrom = links.filter(
            (link) => link.type === "wasDerivedFrom" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const wasInformedBy = links.filter(
            (link) => link.type === "wasInformedBy" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const wasAssociatedWith = links.filter(
            (link) => link.type === "wasAssociatedWith" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const wasStartedBy = links.filter(
            (link) => link.type === "wasStartedBy" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const hadMember = links.filter(
            (link) => link.type === "hadMember" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        const wasAttributedTo = links.filter(
            (link) => link.type === "wasAttributedTo" && link.source?.id === nodeId
        ).map(
            (link) => link.target.id
        ).join(", ") || "None";

        // Inverse relationships links
        const generated = links.filter(
            (link) => link.type === "wasGeneratedBy" && link.target?.id === nodeId
        ).map(
            (link) => link.source.id
        ).join(", ") || "None";

        const wasUsedBy = links.filter(
            (link) => link.type === "used" && link.target?.id === nodeId
        ).map(
            (link) => link.source.id
        ).join(", ") || "None";

        const derives = links.filter(
            (link) => link.type === "wasDerivedFrom" && link.target?.id === nodeId
        ).map(
            (link) => link.source.id
        ).join(", ") || "None";

        // Return the node details based on the node type (Entity, Activity, Agent)
        if (entityNode) {
            return {
                id: nodeId,
                group: "Entity",
                type: entityNode[0]?.["prov:type"] || "Unknown",
                used,
                wasGeneratedBy,
                wasDerivedFrom,
                wasInformedBy,
                wasAssociatedWith,
                wasStartedBy,
                hadMember,
                wasAttributedTo,
                generated,
                wasUsedBy,
                derives,
            };
        }

        if (activityNode) {
            return {
                id: nodeId,
                group: "Activity",
                type: activityNode["prov:type"] || "Unknown",
                used,
                wasGeneratedBy,
                wasDerivedFrom,
                wasInformedBy,
                wasAssociatedWith,
                wasStartedBy,
                hadMember,
                wasAttributedTo,
                generated,
                wasUsedBy,
                derives,
            };
        }

        if (agentNode) {
            return {
                id: nodeId,
                group: "Agent",
                type: agentNode["prov:type"] || "Unknown",
                used,
                wasGeneratedBy,
                wasDerivedFrom,
                wasInformedBy,
                wasAssociatedWith,
                wasStartedBy,
                hadMember,
                wasAttributedTo,
                generated,
                wasUsedBy,
                derives,
            };
        }
        return null; // Return null if the node details are not found
    };

    // Build activities array once graphData loaded
    const activities = useMemo(() => {
      if (!graphData || !graphData.activity) return [];

      const arr = Object.entries(graphData.activity).map(([id, a], index) => ({
        id,
        start: a["prov:startTime"] ? new Date(a["prov:startTime"]).getTime() : null,
        end: a["prov:endTime"] ? new Date(a["prov:endTime"]).getTime() : null,
        originalIndex: index
      }));

      // Handle missing / invalid timestamps
      // Sequentially fill missing times so untimed activities still animate correctly.

      let lastValidTime = Date.now();
      //let lastValidTime = 0;

      for (const a of arr) {
        if (isNaN(a.start) || a.start == null) {
          a.start = lastValidTime + 1;
        }
        if (isNaN(a.end) || a.end == null || a.end < a.start) {
          a.end = a.start + 1;
        }
        lastValidTime = a.end;
      }

      // Sort by start time (null/undefined → end). Stable sort by original index if same start
      arr.sort((A, B) => {
        if (A.start == null && B.start == null) return A.originalIndex - B.originalIndex;
        if (A.start == null) return 1;
        if (B.start == null) return -1;
        if (A.start === B.start) return A.originalIndex - B.originalIndex;
        return A.start - B.start;
      });

      // Assign sorted order index (0..n-1)
      return arr.map((a, i) => ({ ...a, index: i }));
    }, [graphData]);

    // Build linksByActivityRef whenever graphData changes
    useEffect(() => {
      if (!graphData) return;

      const mkLinkId = (type, relKey) => `link-${type}-${relKey}`;
      const list = [];

      // wasDerivedFrom produced three link entries per relKey
      Object.entries(graphData.wasDerivedFrom || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasDerivedFrom", relKey), actId: rel["prov:activity"], entId: rel["prov:usedEntity"] });
        list.push({ id: mkLinkId("wasGeneratedBy-fromWDF", relKey), actId: rel["prov:activity"], entId: rel["prov:generatedEntity"] });
        list.push({ id: mkLinkId("used-fromWDF", relKey), actId: rel["prov:activity"], entId: rel["prov:usedEntity"] });
      });

      Object.entries(graphData.wasGeneratedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasGeneratedBy", relKey), actId: rel["prov:activity"], entId: rel["prov:entity"] });
      });

      Object.entries(graphData.used || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("used", relKey), actId: rel["prov:activity"], entId: rel["prov:entity"] });
      });

      Object.entries(graphData.wasInformedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasInformedBy", relKey), actId: rel["prov:informed"], entId: rel["prov:informant"] });
      });

      Object.entries(graphData.hadMember || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("hadMember", relKey), actId: rel["prov:collection"], entId: rel["prov:entity"] });
      });

      Object.entries(graphData.wasStartedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasStartedBy", relKey), actId: rel["prov:activity"], entId: rel["prov:trigger"] });
      });

      Object.entries(graphData.wasAssociatedWith || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasAssociatedWith", relKey), actId: rel["prov:activity"], entId: rel["prov:agent"] });
        if (rel["prov:plan"]) list.push({ id: mkLinkId("plan", relKey), actId: rel["prov:activity"], entId: rel["prov:plan"] });
      });

      Object.entries(graphData.wasAttributedTo || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasAttributedTo", relKey), actId: rel["prov:entity"], entId: rel["prov:agent"] });
      });

      // pack into the map by activity id
      const newLinksByActivity = {};
      list.forEach(l => {
        if (!l.actId) return;
        if (!newLinksByActivity[l.actId]) newLinksByActivity[l.actId] = [];
        newLinksByActivity[l.actId].push({ id: l.id, entId: l.entId });
      });

      linksByActivityRef.current = newLinksByActivity;
    }, [graphData]);

    return (
        <Flex direction="column" h="100vh" w="100vw" bg="black" color="white">
            {/* Top navigation bar for search and others*/}
            <TopBar />

            <Flex flex="1" position="relative" bg="black">
                {/* Sidebar */}
                <Sidebar onOpenPanel={onOpenPanel}/>
                {/*Panel manager for helping the panels opening*/}
                <SidePanelManager
                    activePanel={activePanel}
                    isOpen={isSidePanelOpen}
                    onClose={onClosePanel}
                    setGraphData={setGraphData}
                    jsonContent={jsonContent}
                    setJsonContent={setJsonContent}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    setHighlightedNode={setHighlightedNode}
                    graphData={graphData}
                    searchQuery={searchQuery}
                    handleSearch={handleSearch}
                    findNodeDetails={findNodeDetails}
                    activities={activities}
                    animationState={animationState}
                    currentFileName={currentFileName}
                    setCurrentFileName={setCurrentFileName}
                    jsonLabelRef={jsonLabelRef}
                />
                {/*Main content area*/}
                <Flex flex="1" position="relative" overflow="hidden" minWidth={0}>
                    {/* Graph canvas */}
                    <GraphContainer
                        onNodeClick={handleNodeClick}
                        highlightedNode={highlightedNode}
                        graphData={graphData}
                    />
                    <Resizable
                        defaultSize={{
                            width: 300,
                        }}
                        minWidth={300}
                        maxWidth={500}
                        enable={{
                            left: true,
                        }}
                        handleStyles={{
                            left: {
                                width: "6px",
                                left: "-3px",
                                background: "transparent",
                                cursor: "col-resize",
                            }
                        }}
                        style={{
                            height: "100%",
                            maxHeight: "100%",
                            display: "flex",
                        }}
                    >
                        {/*Code panel for viewing the code*/}
                        <CodePanel />
                    </Resizable>
                </Flex>
            </Flex>
            {/*Timeline bar*/}
            <Timeline
            	activities={activities}
             	linksByActivityRef={linksByActivityRef}
             	onIndexChange={(update) =>
              	setAnimationState(prev => ({ ...prev, ...update }))
            	}
            />
        </Flex>
    );
}

export default App;