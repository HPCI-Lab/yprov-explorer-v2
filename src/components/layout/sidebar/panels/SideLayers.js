import {
    Box,
    Divider,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import React from "react";
/*
SideLayers.js: Multi level panel
 */
export default function SideLayers() {
    //Main layout
    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%">
                <Box pb="2" borderBottom="1px solid" borderColor="whiteAlpha.200">
                    <HStack spacing={2} align="center">
                        <HStack>
                            <Box>
                                <Box fontSize="md" fontWeight="semibold">
                                    Multilevel panel
                                </Box>
                            </Box>
                        </HStack>
                    </HStack>
                </Box>

                {/*Scrollable area*/}
                <Box overflowY="auto" maxH="70vh" pr={2}
                    sx={{
                        scrollbarWidth: "none",
                        "::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    <VStack align="stretch" spacing={4}>
                    </VStack>
                </Box>
            </VStack>
        </Flex>
    );
}
