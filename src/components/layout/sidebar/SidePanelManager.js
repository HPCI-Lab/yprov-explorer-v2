import { Box } from "@chakra-ui/react";
import SideLayers from "./panels/SideLayers"
import SidePattern from "./panels/SidePattern";
import SideSettings from "./panels/SideSettings";
import NodeInfo from "./panels/SideInfo";
import React from "react";

/*
SidePanelManager.js: panel manager for managing all the feature panels
 */

export default function SidePanelManager({
                                             activePanel,
                                             isOpen,
                                             selectedNode,
                                             setSelectedNode,
                                             setHighlightedNode,
                                             graphData,
                                             searchQuery,
                                             handleSearch,
                                             findNodeDetails,
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
            left="48px"
            w={isOpen ? "280px" : "0px"}
            overflow="hidden"
            bg="black"
            transition="width 0s linear"
            zIndex={11}
            p={isOpen ? "4" : "0"}
            display="flex"
            flexDirection="column"
        >
            {renderPanel()}
        </Box>
    );
}
