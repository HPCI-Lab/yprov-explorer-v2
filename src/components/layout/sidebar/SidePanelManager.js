import { Box } from "@chakra-ui/react";
import SideInput from "./panels/SideInput";
import SideCode from "./panels/SideCode";
import SideTimeline from "./panels/SideTimeline";
import SideLayers from "./panels/SideLayers"
import SideInfo from "./panels/SideInfo";
import SidePattern from "./panels/SidePattern";
import SideSettings from "./panels/SideSettings";
import NodeInfo from "./panels/SideInfo";

/*
SidePanelManager.js: panel manager for managing all the feature panels
 */

export default function SidePanelManager({
                                             activePanel,
                                             isOpen,
                                             setGraphData,
                                             jsonContent,
                                             setJsonContent,
                                             selectedNode,
                                             setSelectedNode,
                                             setHighlightedNode,
                                             graphData,
                                             searchQuery,
                                             handleSearch,
                                             findNodeDetails,
                                             activities,
                                             animationState,
                                             currentFileName,
                                             setCurrentFileName,
                                             jsonLabelRef
                                         }) {
    const renderPanel = () => {
        //switching the panel
        switch (activePanel) {
            //case "home": return;
            case "layers": return <SideLayers/>;
            case "pattern": return <SidePattern/>;
            case "info": return <NodeInfo
                nodeInfo={selectedNode}
                searchQuery={searchQuery}
                onHighlightNode={(nodeId) => {
                    setHighlightedNode(nodeId);

                    // Fetch updated node details for the label
                    const nodeDetails = findNodeDetails(nodeId, graphData);
                    if (nodeDetails) setSelectedNode(nodeDetails);
                }}
                onSearch={handleSearch}
            />;
            case "settings": return <SideSettings/>;
            default: return null;
        }
    };

    //main layout
    return (
        <Box
            position="absolute"
            top="0"
            bottom="0"
            left="70px"
            w={isOpen ? "325px" : "0px"}
            overflow="hidden"
            bg="gray.800"
            borderRadius="xl"
            transition="none"
            zIndex={10}
            p={isOpen ? "4" : "0"}
        >
            {/* {renderPanel()} */}
            
            {/* INPUT PANEL */}
            <Box display={activePanel === "input" ? "block" : "none"} h="100%">
                <SideInput
                    ref={jsonLabelRef}
                    setGraphData={setGraphData}
                    setCurrentFileName={setCurrentFileName}
                />
            </Box>

            {/* CODE PANEL */}
            <Box display={activePanel === "code" ? "block" : "none"} h="100%">
                <SideCode />
            </Box>

            {/* TIMELINE PANEL */}
            <Box display={activePanel === "timeline" ? "block" : "none"} h="100%">
                <SideTimeline
                    activities={activities}
                    currentIndex={animationState.currentIndex}
                    currentTime={animationState.currentTime}
                    subset={animationState.subset}
                    onHighlightNode={(nodeId) => {
                        setHighlightedNode(nodeId);
                        const nodeDetails = findNodeDetails(nodeId, graphData);
                        if (nodeDetails) setSelectedNode(nodeDetails);
                    }}
                />
            </Box>

            {/* LAYERS PANEL */}
            <Box display={activePanel === "layers" ? "block" : "none"} h="100%">
                <SideLayers
                    mainGraphData={graphData}
                    mainFileName={currentFileName}
                    setGraphData={setGraphData}
                    updateJsonLabel={(json, name) =>
                        jsonLabelRef.current?.updateJson(json, name)
                    }
                />
            </Box>

            {/* INFO PANEL */}
            <Box display={activePanel === "info" ? "block" : "none"} h="100%">
                <SideInfo
                    nodeInfo={selectedNode}
                    searchQuery={searchQuery}
                    onHighlightNode={(nodeId) => {
                        setHighlightedNode(nodeId);
                        const nodeDetails = findNodeDetails(nodeId, graphData);
                        if (nodeDetails) setSelectedNode(nodeDetails);
                    }}
                    onSearch={handleSearch}
                />
            </Box>

            {/* SETTINGS PANEL */}
            <Box display={activePanel === "settings" ? "block" : "none"} h="100%">
                <SideSettings />
            </Box>

        </Box>
    );
}
