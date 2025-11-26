import { Box, VStack, IconButton } from "@chakra-ui/react";
import { SettingsIcon, InfoIcon  } from "@chakra-ui/icons";
import { Home, Folder, Code2, Activity, Layers  } from "lucide-react";
/*
Sidebar.js: Sidebar component for representing all the panels feature
 */
export default function Sidebar({onOpenPanel}) {
    return (
        <Box
            w="70px"
            bg="gray.900"
            borderRight="5px solid black"
            color="white"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            p="4"
            borderRadius="xl"
            borderLeft="5px solid black"
        >
            <VStack spacing="4">
                <IconButton
                    icon={<Home/>}
                    aria-label="menu"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("home")}
                />
                <IconButton
                    icon={<Folder/>}
                    aria-label="input"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("input")}
                />
                <IconButton
                    icon={<Code2 />}
                    aria-label="code"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("code")}
                />
                <IconButton
                    icon={<Activity />}
                    aria-label="timeline"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("timeline")}
                />
                <IconButton
                    icon={<Layers />}
                    aria-label="layers"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("layers")}
                />
                <IconButton
                    icon={<InfoIcon />}
                    aria-label="settings"
                    bg="gray.700"
                    borderRadius="xl"
                    onClick={() => onOpenPanel("info")}
                />
            </VStack>
            <IconButton icon={<SettingsIcon />} aria-label="bottom-settings" bg="gray.700" borderRadius="xl" onClick={() => onOpenPanel("settings")}/>
        </Box>
    );
}
