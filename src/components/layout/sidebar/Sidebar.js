import { Box, VStack, IconButton } from "@chakra-ui/react";
import { SettingsIcon, InfoIcon  } from "@chakra-ui/icons";
import { Home, Folder, Code2, Activity, Layers  } from "lucide-react";

export default function Sidebar({onOpenPanel}) {
    return (
        <Box
            w="48px"
            bg="gray.900"
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
                    bg="gray.700"
                    onClick={() => onOpenPanel("home")}
                />
                <IconButton
                    icon={<Folder size={18}/>}
                    aria-label="input"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("input")}
                />
                <IconButton
                    icon={<Code2 size={18}/>}
                    aria-label="code"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("code")}
                />
                <IconButton
                    icon={<Activity size={18}/>}
                    aria-label="timeline"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("timeline")}
                />
                <IconButton
                    icon={<Layers size={18}/>}
                    aria-label="layers"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("layers")}
                />
                <IconButton
                    aria-label="pattern"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("pattern")}
                />
                <IconButton
                    icon={<InfoIcon boxSize={4}/>}
                    aria-label="settings"
                    size="sm"
                    bg="gray.700"
                    onClick={() => onOpenPanel("info")}
                />

            </VStack>

            <IconButton icon={<SettingsIcon boxSize={4}/>} size="sm" aria-label="bottom-settings" bg="gray.700" onClick={() => onOpenPanel("settings")}/>
        </Box>
    );
}
