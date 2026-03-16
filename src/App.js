import { Flex } from "@chakra-ui/react";
import Sidebar from "./components/layout/sidebar/Sidebar";
import SidePanelManager from "./components/layout/sidebar/SidePanelManager";
import TopBar from "./components/layout/TopBar";
import CodePanel from "./components/layout/CodePanel";
import GraphContainer from "./components/layout/GraphContainer";
import Timeline from "./components/layout/Timeline";
import React, {useEffect, useState} from "react";
import {Resizable} from "re-resizable";
import controller from "./components/graph/graphController";
import parserProvenance , {adapter} from "./components/graph/parseProvenance";

//main app function
function App() {
    //State for sidebar activation
    const [activePanel, setActivePanel] = useState(null);
    //State for closing the sidebar
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    //State for opening the code tab
    const [isCodePanelVisible, setIsCodePanelVisible] = useState(true);
    //state for graph data
    const [graphData, setGraphData] = useState(null);
    //state for dataset
    const [dataset, setDataset] = useState(null);
    //variable for checking if there is a notebook loaded
    const hasNotebook = !!dataset?.notebook;

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

    //function for managing the upload
    const handleDatasetLoaded = ({ provJson, notebook }) => {
        setDataset({ provJson, notebook });
        const parsed = parserProvenance(provJson);
        const adapt = adapter(parsed);
        setGraphData(adapt);
        controller.setGraphData(adapt);
    };

    //Main layout
    return (
        <Flex direction="column" h="100vh" w="100vw" bg="black" color="white">
            {/* Top navigation bar for search and others*/}
            <TopBar dataset={dataset} onDatasetLoaded={handleDatasetLoaded} />
            <Flex flex="1" position="relative" bg="black" minH="0">
                {/* Sidebar */}
                <Sidebar onOpenPanel={onOpenPanel}/>
                {/*Panel manager for helping the panels opening*/}
                <SidePanelManager activePanel={activePanel} isOpen={isSidePanelOpen} onClose={onClosePanel}/>

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
            <Timeline />
        </Flex>
    );
}

export default App;