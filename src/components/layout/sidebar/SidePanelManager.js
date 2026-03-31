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
                                             jsonLabelRef
                                         }) {
    const renderPanel = () => {
        //switching the panel
        switch (activePanel) {
            //case "home": return;
            case "layers": return <SideLayers
                mainGraphData={graphData}
                mainFileName={currentFileName}
                setGraphData={setGraphData}
                updateJsonLabel={(json, name) =>
                    jsonLabelRef.current?.updateJson(json, name)
                }
            />;
            case "pattern": return <SidePattern/>;
            case "timeline": return <SideTimeline
                activities={activities}
                currentIndex={animationState.currentIndex}
                currentTime={animationState.currentTime}
                subset={animationState.subset}
                onHighlightNode={(nodeId) => {
                    setHighlightedNode(nodeId);
                    //const nodeDetails = findNodeDetails(nodeId, graphData);
                    //if (nodeDetails) setSelectedNode(nodeDetails);
                }}
            />;
            case "info": return <NodeInfo
                nodeInfo={selectedNode}
                searchQuery={searchQuery}
                onHighlightNode={(nodeId) => {
                    setHighlightedNode(nodeId);

                    // Fetch updated node details for the label
                    //const nodeDetails = findNodeDetails(nodeId, graphData);
                    //if (nodeDetails) setSelectedNode(nodeDetails);
                }}
                onSearch={handleSearch}
            />;
            case "settings": return <SideSettings/>;
            case "code": return <SideCode/>;
            default: return null;
        }
    };

    //main layout
    return (
        <Box
            position="absolute"
            top="0"
            bottom="0"
            left="48px"
            w={isOpen ? "325px" : "0px"}
            overflow="hidden"
            bg="gray.800"
            borderRadius="xl"
            transition="all 0.3s ease"
            zIndex={10}
            p={isOpen ? "4" : "0"}
            opacity={isOpen ? 1 : 0}
        >
            {renderPanel()}
        </Box>
    );
}
