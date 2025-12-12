import {Box, Flex, Heading, Input, VStack, Tooltip, Text, Divider} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import controller from "../../../../graph/GraphController"
/*
SideInfo.js: shows detailed information about a selected node in a graph. Each section displays data as a group,
Node ID, type and relationships (e.g. "Used", "Generated", "wasDerivedFrom"), with clickable links to
Navigate between related nodes and update the graph view. Includes a search bar to find and
Highlight the corresponding text within the information shown in the NodeInfo label. Words
searches are highlighted dynamically via the highlightMatches function.
*/

export default function SideInfo() {
    const [nodeInfo, setNodeInfo] = useState(null);

    useEffect(() => {
        controller.onNodeClick((info) => {
            setNodeInfo(info);
        });
    }, []);

    if (!nodeInfo) {
        return (
            <Flex flex="1" justify="center" gap="5">
                <VStack spacing={3} align="stretch" w="100%">
                    <Box color="white">
                        <Heading size="md" mb="4">Select a Node!</Heading>
                    </Box>

                </VStack>
            </Flex>
        );
    }

    const renderLinks = (value) =>
        (value || "None").split(", ").map((link) => (
            <Box key={link} mt={1}>
                <Tooltip label={link} placement="top-start" hasArrow>
                    <Text
                        role="button"
                        color="blue.300"
                        fontSize="md"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        maxW="100%"
                        cursor="pointer"
                        // dangerouslySetInnerHTML={{ __html: highlightMatches(link, searchQuery) }}
                    >
                        {link}
                    </Text>
                </Tooltip>
            </Box>
        ));

    const infoItems = [
        { label: "Group", value: nodeInfo.group },
        { label: "ID", value: nodeInfo.id },
        { label: "Type", value: nodeInfo.type },
        { label: "Used", value: renderLinks(nodeInfo.used) },
        { label: "wasGeneratedBy", value: renderLinks(nodeInfo.wasGeneratedBy) },
        { label: "wasDerivedFrom", value: renderLinks(nodeInfo.wasDerivedFrom) },
        { label: "Generated", value: renderLinks(nodeInfo.generated) },
        { label: "wasUsedBy", value: renderLinks(nodeInfo.wasUsedBy) },
        { label: "Derives", value: renderLinks(nodeInfo.derives) },
        { label: "wasInformedBy", value: renderLinks(nodeInfo.wasInformedBy) },
        { label: "wasAssociatedWith", value: renderLinks(nodeInfo.wasAssociatedWith) },
        { label: "hadMember", value: renderLinks(nodeInfo.hadMember) },
        { label: "wasStartedBy", value: renderLinks(nodeInfo.wasStartedBy) },
    ];

    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%">
                <Box color="white">
                    <Heading size="md" mb="4">Node Information</Heading>
                </Box>
                <Input
                    placeholder="Search Node Info"
                    bg="white"
                    color="black"
                    borderRadius="xl"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px #4299e1",
                    }}
                />
                <Box
                    overflowY="auto"
                    maxH="70vh"
                    pr={2}
                    sx={{
                        scrollbarWidth: "none",
                        "::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    <VStack align="stretch" spacing={4}>
                        {infoItems.map((item) => (
                            <Box key={item.label}>
                                <Text
                                    fontWeight="bold"
                                    color="white"
                                    fontSize="sm"
                                    noOfLines={1}
                                >
                                    {item.label}
                                </Text>

                                <Tooltip
                                    label={typeof item.value === "string" ? item.value : undefined}
                                         placement="top-start" hasArrow>
                                    <Text
                                        color="gray.300"
                                        fontSize="md"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxW="100%"
                                        cursor="default"
                                    >
                                        {item.value}
                                    </Text>
                                </Tooltip>
                                <Divider borderColor="gray.600" mt={2} />
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </Flex>
    );
}
