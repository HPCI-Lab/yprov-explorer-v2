import { Flex } from "@chakra-ui/react";
import Sidebar from "./components/layout/sidebar/Sidebar";
import SidePanelManager from "./components/layout/sidebar/SidePanelManager";
import TopBar from "./components/layout/TopBar";
import CodePanel from "./components/layout/CodePanel";
import GraphContainer from "./components/layout/GraphContainer";
import Timeline from "./components/layout/Timeline";
import {useState, useMemo, useRef, useEffect} from "react";
import {Resizable} from "re-resizable";
import 'bootstrap-icons/font/bootstrap-icons.css';
import controller from "./components/graph/graphController";
import parserProvenance , {adapter} from "./components/graph/parseProvenance";


function App() {
   //State for sidebar activation
    const [activePanel, setActivePanel] = useState(null);
    //State for closing the sidebar
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    //State for opening the code tab
    const [isCodePanelVisible, setIsCodePanelVisible] = useState(true);
    //String for managing the timeline filename
    const [currentFileName, setCurrentFileName] = useState("main.json");


    const [animationState, setAnimationState] = useState({ currentIndex: 0, currentTime: 0 });
    const linksByActivityRef = useRef({});

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

    //state for the raw graph data
    const [rawGraphData, setRawGraphData] = useState(null);
    //state for graph data
    const [graphData, setGraphData] = useState(null);
    //state for dataset
    const [dataset, setDataset] = useState(null);

    //function for managing the upload
    const handleDatasetLoaded = ({ provJson, notebook, filename }) => {
        setDataset({ provJson, notebook });
        const parsed = parserProvenance(provJson);
        const adapt = adapter(parsed);
        if (filename != null) setCurrentFileName(filename);
        setGraphData(adapt);
        setRawGraphData(provJson);
        controller.setGraphData(adapt);
    };

    // Build activities array once graphData loaded
    const activities = useMemo(() => {
      if (!rawGraphData || !rawGraphData.activity) return [];

      const arr = Object.entries(rawGraphData.activity).map(([id, a], index) => ({
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
    }, [rawGraphData]);

    // Build linksByActivityRef whenever graphData changes
    useEffect(() => {
      if (!rawGraphData) return;

      const mkLinkId = (type, relKey) => `link-${type}-${relKey}`;
      const list = [];

      // wasDerivedFrom produced three link entries per relKey
      Object.entries(rawGraphData.wasDerivedFrom || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasDerivedFrom", relKey), actId: rel["prov:activity"], entId: rel["prov:usedEntity"] });
        list.push({ id: mkLinkId("wasGeneratedBy-fromWDF", relKey), actId: rel["prov:activity"], entId: rel["prov:generatedEntity"] });
        list.push({ id: mkLinkId("used-fromWDF", relKey), actId: rel["prov:activity"], entId: rel["prov:usedEntity"] });
      });

      Object.entries(rawGraphData.wasGeneratedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasGeneratedBy", relKey), actId: rel["prov:activity"], entId: rel["prov:entity"] });
      });

      Object.entries(rawGraphData.used || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("used", relKey), actId: rel["prov:activity"], entId: rel["prov:entity"] });
      });

      Object.entries(rawGraphData.wasInformedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasInformedBy", relKey), actId: rel["prov:informed"], entId: rel["prov:informant"] });
      });

      Object.entries(rawGraphData.hadMember || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("hadMember", relKey), actId: rel["prov:collection"], entId: rel["prov:entity"] });
      });

      Object.entries(rawGraphData.wasStartedBy || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasStartedBy", relKey), actId: rel["prov:activity"], entId: rel["prov:trigger"] });
      });

      Object.entries(rawGraphData.wasAssociatedWith || {}).forEach(([relKey, rel]) => {
        list.push({ id: mkLinkId("wasAssociatedWith", relKey), actId: rel["prov:activity"], entId: rel["prov:agent"] });
        if (rel["prov:plan"]) list.push({ id: mkLinkId("plan", relKey), actId: rel["prov:activity"], entId: rel["prov:plan"] });
      });

      Object.entries(rawGraphData.wasAttributedTo || {}).forEach(([relKey, rel]) => {
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
    }, [rawGraphData]);

    //variable for checking if there is a notebook loaded
    const hasNotebook = !!dataset?.notebook;

    return (
        <Flex direction="column" h="100vh" w="100vw" bg="black" color="white">
            {/* Top navigation bar for search and others*/}
            <TopBar dataset={dataset} onDatasetLoaded={handleDatasetLoaded} />

            <Flex flex="1" position="relative" bg="black" minH="0">
                {/* Sidebar */}
                <Sidebar onOpenPanel={onOpenPanel}/>
                {/*Panel manager for helping the panels opening*/}
                <SidePanelManager graphData={graphData} setGraphData={setGraphData} activePanel={activePanel} 
                  isOpen={isSidePanelOpen} onClose={onClosePanel} currentFileName={currentFileName} 
                  animationState={animationState} activities={activities} setHighlightedNode={(id) => controller.selectNode(id)}/>

                {/*Main content area*/}
                <Flex flex="1" position="relative" overflow="hidden" minWidth={0} minH="0">
                    {/* Graph canvas */}
                    <GraphContainer graphData={graphData}/>
                    {isCodePanelVisible && hasNotebook &&(
                            <Resizable
                                defaultSize={{width: 400,}}
                                minWidth={400}
                                maxWidth={600}
                                enable={{left: true,}}
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
                                {hasNotebook && (
                                    <CodePanel graphData={graphData} notebook={dataset?.notebook}/>
                                )}
                            </Resizable>
                        )
                    }
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