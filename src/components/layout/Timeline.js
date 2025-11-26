import { Box } from "@chakra-ui/react";
/*
Timeline.js: Timeline contains the main elements for graph animations:
- contains the multi-level player for playing animations
- contains cells player
 */
export default function Timeline() {
    return (
        <Box
            h="70px"
            bg="gray.800"
            borderTop="5px solid black"
            color="white"
            display="flex"
            alignItems="center"
            p="4"
            borderRadius="xl"
            borderLeft="5px solid black"
            borderRight="5px solid black"
            borderBottom="5px solid black"
        >
            Timeline
        </Box>
    );
}
