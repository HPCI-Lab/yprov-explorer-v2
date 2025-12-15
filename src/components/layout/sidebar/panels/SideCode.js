import {
    Box,
    Divider,
    Flex,
    Heading,
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
SideCode.js: Code settings panel
 */
export default function SideCode() {
    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%">
                <Box
                    pb="2"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.200"
                >
                    <HStack spacing={2} align="center">
                        <HStack>
                            <Box>
                                <Box fontSize="md" fontWeight="semibold">
                                    Dask options
                                </Box>
                                <Box fontSize="xs" opacity={0.6}>
                                    Node ·
                                </Box>
                            </Box>
                        </HStack>
                    </HStack>
                </Box>
                <Box
                    overflowY="auto"
                    maxH="70vh"
                    pr={2}
                >
                </Box>
            </VStack>
        </Flex>
    );
}
