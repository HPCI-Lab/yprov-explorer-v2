import { Box } from "@chakra-ui/react";
import SideInput from "./panels/SideInput";
import SideCode from "./panels/SideCode";
import SideTimeline from "./panels/SideTimeline";
import SideLayers from "./panels/SideLayers"
import SideInfo from "./panels/SideInfo";
import SideSettings from "./panels/SideSettings";
import NodeInfo from "./panels/SideInfo";
import React from "react";

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
                                         }) {
    const renderPanel = () => {
        switch (activePanel) {
            //case "home": return;
            case "input": return <SideInput setGraphData={setGraphData} jsonContent={jsonContent} setJsonContent={setJsonContent}/>;
            case "code": return <SideCode/>;
            case "timeline": return <SideTimeline/>;
            case "layers": return <SideLayers/>;
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

    return (
        <Box
            position="absolute"
            top="0"
            bottom="0"
            left="48px"
            w={isOpen ? "280px" : "0px"}
            overflow="hidden"
            bg="gray.800"
            transition="width 0s linear"
            zIndex={10}
            p={isOpen ? "4" : "0"}
        >
            {renderPanel()}
        </Box>
    );
}
