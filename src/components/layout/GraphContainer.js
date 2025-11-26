import { Box } from "@chakra-ui/react";
/*
GraphContainer.js: Main component that contains the graph and its
related components. Such as Graph (graph), GraphSettings (make labels visible or not),
FullscreenButton (set fullscreen) and GraphInfo (graph information). Behaves
as a container for all these components.
*/
export default function GraphContainer() {
    return (
        <Box
            flex="1"
            bg="white"
            borderRadius="xl"
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="gray.500"
                borderRadius="xl"
            >
                Graph
            </Box>
        </Box>
    );
}
