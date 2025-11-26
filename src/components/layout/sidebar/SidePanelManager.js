import { Box } from "@chakra-ui/react";
import SideInput from "./panels/SideInput";
import SideCode from "./panels/SideCode";
import SideTimeline from "./panels/SideTimeline";
import SideLayers from "./panels/SideLayers"
import SideInfo from "./panels/SideInfo";
import SideSettings from "./panels/SideSettings";

/*
SidePanelManager.js: panel manager for managing all the feature panels
 */

export default function SidePanelManager({ activePanel, isOpen}) {
    const renderPanel = () => {
        switch (activePanel) {
            //case "home": return;
            case "input": return <SideInput/>;
            case "code": return <SideCode/>;
            case "timeline": return <SideTimeline/>;
            case "layers": return <SideLayers/>;
            case "info": return <SideInfo/>;
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
            transition="width 0.1s linear"
            zIndex={10}
            p={isOpen ? "4" : "0"}
        >
            {renderPanel()}
        </Box>
    );
}
