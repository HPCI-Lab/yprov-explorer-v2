import { Box } from "@chakra-ui/react";
/*
CodePanel.js: contains the code editor for viewing cells code of the graph
 */
export default function CodePanel() {
    return (
        <Box
            w="100%"
            h="100%"
            bg="gray.700"
            borderLeft="5px solid black"
            p="4"
            color="white"
            borderRadius="xl"
            borderRight="5px solid black"
        >
            <Box fontSize="lg" fontWeight="bold" mb="2">
                Cell Code
            </Box>

            <Box fontSize="sm" opacity="0.7">
                editor
            </Box>
        </Box>
    );
}
