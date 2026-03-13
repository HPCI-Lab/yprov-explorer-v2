import {Box, Flex, Heading, HStack, VStack} from "@chakra-ui/react";
import React from "react";
/*
SideSetting.js: Other settings panel
 */
export default function SideSettings() {
    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%">
                <Box pb="2" borderBottom="1px solid" borderColor="whiteAlpha.200">
                    <HStack spacing={2} align="center">
                        <HStack>
                            <Box>
                                <Box fontSize="md" fontWeight="semibold">
                                    Settings
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
