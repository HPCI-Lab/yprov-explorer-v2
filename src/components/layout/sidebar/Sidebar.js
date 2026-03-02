import { Box, VStack, IconButton } from "@chakra-ui/react";
import { SettingsIcon, InfoIcon  } from "@chakra-ui/icons";
import { Home, Folder, Code2, Activity, Layers  } from "lucide-react";

export default function Sidebar({onOpenPanel}) {
    return (
        <Box
            w="48px"
            color="white"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            py="2"
            borderRight="1px solid"
            borderColor="whiteAlpha.200"
        >
            <VStack spacing="2">
                <IconButton
                    icon={<Home size={18}/>}
                    aria-label="menu"
                    size="sm"
                    onClick={() => onOpenPanel("home")}
                />
                <IconButton
                    icon={<Code2 size={18}/>}
                    aria-label="code"
                    size="sm"
                    onClick={() => onOpenPanel("code")}
                />
                <IconButton
                    icon={<Activity size={18}/>}
                    aria-label="timeline"
                    size="sm"
                    onClick={() => onOpenPanel("timeline")}
                />
                <IconButton
                    icon={<Layers size={18}/>}
                    aria-label="layers"
                    size="sm"
                    onClick={() => onOpenPanel("layers")}
                />
                <IconButton
                    aria-label="pattern"
                    size="sm"
                    onClick={() => onOpenPanel("pattern")}
                />
                <IconButton
                    icon={<InfoIcon boxSize={4}/>}
                    aria-label="settings"
                    size="sm"
                    onClick={() => onOpenPanel("info")}
                />

            </VStack>

            <IconButton icon={<SettingsIcon boxSize={4}/>} size="sm" aria-label="bottom-settings" onClick={() => onOpenPanel("settings")}/>
        </Box>
    );
}
