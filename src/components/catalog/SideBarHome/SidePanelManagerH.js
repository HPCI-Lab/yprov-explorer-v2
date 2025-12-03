import { Box } from "@chakra-ui/react";
import SideHome from "./panels/SideHome";
import SideInput from "./panels/SideInput";
import SideCode from "./panels/SideCode";
import SideTimeline from "./panels/SideTimeline";
import SideLayers from "./panels/SideLayers"
import SideInfo from "./panels/SideInfo";
import SideSettings from "./panels/SideSettings";

/*
SidePanelManager.js: panel manager for managing all the feature panels
 */

export default function SidePanelManager({ activePanel, isOpen, setGraphData, jsonContent, setJsonContent}) {
    const renderPanel = () => {
        switch (activePanel) {
            case "home": return <SideHome/>;
            case "input": return <SideInput setGraphData={setGraphData} jsonContent={jsonContent} setJsonContent={setJsonContent}/>;
            case "settings": return <SideSettings/>;
            default: return null;
        }
    };

    return (
        <Box
            position="absolute"
            top="0"
            bottom="0"
            left="70px"
            w={isOpen ? "280px" : "0px"}
            overflow="hidden"
            bg="gray.800"
            borderRadius="xl"
            transition="none"
            zIndex={10}
            p={isOpen ? "4" : "0"}
        >
            {renderPanel()}
        </Box>
    );
}
