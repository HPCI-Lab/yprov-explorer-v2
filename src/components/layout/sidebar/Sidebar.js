import { Box, VStack, IconButton } from "@chakra-ui/react";
import { SettingsIcon, InfoIcon  } from "@chakra-ui/icons";
import { Home, Layers  } from "lucide-react";

/*
Sidebar.js: represent the sidebar with the icons
 */
/**
 *
 * @param {Object} onOpenPanel
 * @returns {JSX.Element}
 * @constructor
 */

export default function Sidebar({onOpenPanel}) {
    //main layout
    return (
        <Box w="48px" color="white" display="flex" flexDirection="column"
             justifyContent="space-between" alignItems="center" py="2" borderRight="1px solid" borderColor="black">
            <VStack spacing="2">
                <IconButton icon={<Home size={18}/>} aria-label="menu" size="sm" onClick={() => onOpenPanel("home")}/>
                <IconButton icon={<Layers size={18}/>} aria-label="layers" size="sm" onClick={() => onOpenPanel("layers")}/>
                <IconButton aria-label="pattern" size="sm" onClick={() => onOpenPanel("pattern")}/>
                <IconButton icon={<InfoIcon boxSize={4}/>} aria-label="settings" size="sm" onClick={() => onOpenPanel("info")}/>
            </VStack>
            <IconButton icon={<SettingsIcon boxSize={4}/>} size="sm" aria-label="bottom-settings" onClick={() => onOpenPanel("settings")}/>
        </Box>
    );
}
