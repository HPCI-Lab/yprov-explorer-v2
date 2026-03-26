import {Box, Flex, Heading, Input, VStack, Tooltip, Text, Divider, HStack, InputGroup, InputLeftElement} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import controller from "../../../graph/graphController"
/*
SidePattern.js
*/

export default function SideInfo() {
    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%">
                <Box pb="2" borderBottom="1px solid" borderColor="whiteAlpha.200">
                    <HStack spacing={2} align="center">
                        <HStack>
                            <Box>
                                <Box fontSize="md" fontWeight="semibold">
                                    Graph Patterns
                                </Box>
                                <Box fontSize="xs" opacity={0.6}>
                                </Box>
                            </Box>
                        </HStack>
                    </HStack>
                </Box>
                <Box overflowY="auto" maxH="70vh" pr={2}
                    sx={{
                        scrollbarWidth: "none",
                        "::-webkit-scrollbar": { display: "none" },
                    }}
                >
                </Box>
            </VStack>
        </Flex>
    );
}
