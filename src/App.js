import { Flex } from "@chakra-ui/react";
import Sidebar from "./components/layout/sidebar/Sidebar";
import SidePanelManager from "./components/layout/sidebar/SidePanelManager";
import TopBar from "./components/layout/TopBar";
import CodePanel from "./components/layout/CodePanel";
import GraphContainer from "./components/layout/GraphContainer";
import Timeline from "./components/layout/Timeline";
import {useState} from "react";
import {Resizable} from "re-resizable";

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
                />
                {/*Main content area*/}
                <Flex flex="1" position="relative" overflow="hidden" minWidth={0}>
                    {/* Graph canvas */}
                    <GraphContainer />
                    {/* Code panel */}
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
            <Timeline />
        </Flex>
    );
}

export default App;