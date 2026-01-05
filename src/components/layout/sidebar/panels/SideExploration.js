/* 
    SideExploration.js: Sidebar panel for graph exploration settings       
*/
import React, { useEffect, useState } from "react";
import {
    Box, Flex, VStack, HStack,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Checkbox, Text, Badge, Button,
    Input
} from "@chakra-ui/react";
import controller from "../../../../graph/GraphController";

export default function SideExploration() {
    // temporary states for exploration settings
    const [tempFocusedNode, setTempFocusedNode] = useState(null);

    const [tempNodeTypes, setTempNodeTypes] = useState(["Activity", "Entity"]);
    const [tempAttribute, setTempAttribute] = useState("duration");

    const [tempSubgraphStart, setTempSubgraphStart] = useState(null);
    const [tempSubgraphEnd, setTempSubgraphEnd] = useState(null);

    // select active section for node click handling
    const [activeSection, setActiveSection] = useState(null); // "focus", "subgraphStart", "subgraphEnd"

    const [tempDepth, setTempDepth] = useState(1);

    const items = [
        { color: "green.600", label: "Input Node " },
        { color: "red.600", label: "Output Node " },
        { color: "blue.600", label: "Selected Node" },
        { color: "gray.600", label: "Other connection" },
    ];

    const [tempRelationTypes, setTempRelationTypes] = useState([
        "used",
        "wasGeneratedBy",
        "wasDerivedFrom"
    ]);

    const [tempStartTime, setTempStartTime] = useState("");
    const [tempEndTime, setTempEndTime] = useState("");

    // manage node click based on active section
    useEffect(() => {
        const callback = (node) => {
            if (activeSection === "focus") setTempFocusedNode(node.id);
            else if (activeSection === "subgraphStart") setTempSubgraphStart(node.id);
            else if (activeSection === "subgraphEnd") setTempSubgraphEnd(node.id);
        };
        controller.onNodeClick(callback);
        return () => controller.onNodeClick(() => {}); 
    }, [activeSection]);

    return (
        <Flex 
            flex="1" 
            justify="center" 
            gap="2" 
            overflowY="auto" 
            sx={{ "::-webkit-scrollbar": { width: "8px", }, 
            "::-webkit-scrollbar-track": {  borderRadius: "4px",  }, 
            "::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px", }, 
            "::-webkit-scrollbar-thumb:hover": { background: "#555", }, 
            }}
        >
            <VStack spacing={2} align="stretch" w="220px" >
                <Box pb={2}>
                    <Text fontSize="lg" fontWeight="bold">Graph Exploration</Text>
                </Box>

                <Accordion allowMultiple defaultIndex={[0]}>
                    {/* Focus Node */}
                    <AccordionItem>
                        <AccordionButton onClick={() => setActiveSection("focus")}>
                            <Box flex="1" textAlign="left" fontWeight="semibold">Focus Node</Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <VStack align="start" spacing={2}>
                                <Button
                                    size="sm"
                                    colorScheme="gray"
                                    w="200px"
                                    onClick={() => controller.graphAPI?.highlightNodesAndLinks?.(controller.selectedNodeId)}
                                >
                                    Apply
                                </Button>
                                <Box p={2} border="1px solid #b1afafff" borderRadius="md" bg="whiteAlpha" w="200px">
                                    <Text fontWeight="bold" mb={2}>Legend</Text>
                                    {items.map((item, i) => (
                                        <HStack key={i} spacing={2} mb={1}>
                                            <Box w="20px" h="20px" bg={item.color} borderRadius="sm"></Box>
                                            <Text fontSize="sm">{item.label}</Text>
                                        </HStack>
                                    ))}
                                </Box>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Node Types */}
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex="1" textAlign="left" fontWeight="semibold">Node Types</Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <VStack align="start" spacing={2}>
                                <HStack spacing={4}>
                                    {["activity", "entity"].map((type) => (
                                        <Checkbox
                                            key={type}
                                            isChecked={tempNodeTypes.map(t => t.toLowerCase()).includes(type)}
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    setTempNodeTypes([...tempNodeTypes, type]);
                                                else
                                                    setTempNodeTypes(tempNodeTypes.filter((t) => t.toLowerCase() !== type));
                                            }}
                                        >
                                            {type}
                                        </Checkbox>
                                    ))}
                                </HStack>
                                <Button
                                    size="sm"
                                    w="200px"
                                    colorScheme="gray"
                                    onClick={() => {
                                        ["activity", "entity"].forEach(type => {
                                            const visibleTypes = tempNodeTypes.map(t => t.toLowerCase());
                                            controller.graphAPI?.setNodeTypeOpacity?.(visibleTypes);
                                        });
                                    }}
                                >
                                    Apply
                                </Button>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Subgraph */}
                    <AccordionItem>
                        <AccordionButton onClick={() => setActiveSection("subgraph")}>
                            <Box flex="1" textAlign="left" fontWeight="semibold">Subgraph</Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <VStack align="start" spacing={3} w="100%">
                                <Box w="100%">
                                    <Text fontSize="sm" fontWeight="semibold">Start Node</Text>
                                    <Badge colorScheme="whiteAlpha" fontSize="xs" p={1} textAlign="center">
                                        {tempSubgraphStart || "no node selected"}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        mt={1}
                                        onClick={() => setActiveSection("subgraphStart")}
                                    >
                                        Select Start
                                    </Button>
                                </Box>
                                <Box w="100%">
                                    <Text fontSize="sm" fontWeight="semibold">End Node</Text>
                                    <Badge colorScheme="whiteAlpha" fontSize="xs" p={1} textAlign="center">
                                        {tempSubgraphEnd || "no node selected"}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        mt={1}
                                        onClick={() => setActiveSection("subgraphEnd")}
                                    >
                                        Select End
                                    </Button>
                                </Box>
                                {tempSubgraphStart && tempSubgraphEnd && (
                                    <Button
                                        size="sm"
                                        colorScheme="gray"
                                        mt={2}
                                        w="200px"
                                        onClick={() => controller.applyFilter({
                                            subgraphStart: tempSubgraphStart,
                                            subgraphEnd: tempSubgraphEnd
                                        })}
                                    >
                                        Apply
                                    </Button>
                                )}
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                

                {/* depth */}
                    <AccordionItem>
                        <AccordionButton onClick={() => setActiveSection("focus")}>
                            <Box flex="1" textAlign="left" fontWeight="semibold">Depth</Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            
                            <VStack align="start" spacing={2}>
                                <Input
                                    size="sm"
                                    type="number"
                                    min={1}
                                    value={tempDepth}
                                    onChange={e => setTempDepth(+e.target.value)}
                                    bg="gray.800"
                                    w="200px"
                                />
                                <Button 
                                    size="sm"
                                    colorScheme="gray"
                                    w="200px"
                                    onClick={() =>
                                        controller.applyDepthFilter(
                                            controller.selectedNodeId,
                                            tempDepth
                                        )
                                    }
                                >
                                    Apply
                                </Button>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionButton onClick={() => setActiveSection("focus")}>
                            <Box flex="1" textAlign="left" fontWeight="semibold">Relationship direction</Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>      
                            <VStack align="start" spacing={2}>
                               <Button
                                    size="sm"
                                    w="200px"
                                    onClick={() =>
                                        controller.applyDirectionFilter(
                                            controller.selectedNodeId,
                                            "out"
                                        )
                                    }
                                >
                                    Outgoing
                                </Button>

                                <Button
                                    size="sm"
                                    w="200px"
                                    onClick={() =>
                                        controller.applyDirectionFilter(
                                            controller.selectedNodeId,
                                            "in"
                                        )
                                    }
                                >
                                    Incoming
                                </Button>

                                <Button
                                    size="sm"
                                    w="200px"
                                    onClick={() =>
                                        controller.applyDirectionFilter(
                                            controller.selectedNodeId,
                                            "both"
                                        )
                                    }
                                >
                                    Reset
                                </Button>
 
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                   {/* Relation Types */}
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex="1" textAlign="left" fontWeight="semibold">
                            Relationship Types
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel>
                            <VStack align="start" spacing={2}>
                            {[
                                "used",
                                "wasGeneratedBy",
                                "wasDerivedFrom",
                                "wasAssociatedWith"
                            ].map(type => (
                                <Checkbox
                                key={type}
                                isChecked={tempRelationTypes.includes(type)}
                                onChange={e => {
                                    if (e.target.checked) {
                                    setTempRelationTypes([...tempRelationTypes, type]);
                                    } else {
                                    setTempRelationTypes(
                                        tempRelationTypes.filter(t => t !== type)
                                    );
                                    }
                                }}
                                >
                                {type}
                                </Checkbox>
                            ))}

                            <Button
                                size="sm"
                                w="200px"
                                colorScheme="gray"
                                onClick={() =>
                                controller.setRelationTypeOpacity(tempRelationTypes)
                                }
                            >
                                Apply
                            </Button>

                            <Box
                                mt={3}
                                p={2}
                                border="1px solid"
                                borderColor="gray.600"
                                borderRadius="md"
                                w="200px"
                                bg="gray.800"
                                >
                                <Text fontSize="sm" fontWeight="bold" mb={2}>
                                    Relationship Legend
                                </Text>

                                <VStack align="start" spacing={1}>
                                    <HStack>
                                    <Box w="12px" h="2px" bg="#FDED00" />
                                    <Text fontSize="xs">used - consumption</Text>
                                    </HStack>

                                    <HStack>
                                    <Box w="12px" h="2px" bg="red" />
                                    <Text fontSize="xs">wasGeneratedBy - production</Text>
                                    </HStack>

                                    <HStack>
                                    <Box w="12px" h="2px" bg="#00E572" />
                                    <Text fontSize="xs">wasDerivedFrom - derivation</Text>
                                    </HStack>
                                </VStack>
                                </Box>

                            </VStack>
                        </AccordionPanel>
                        </AccordionItem>

                       {/* Time Range */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left" fontWeight="semibold">
                                    Color by Duration
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack align="start" spacing={2}>
                                    <Button
                                        size="sm"
                                        colorScheme="gray"
                                        w="200px"
                                        onClick={() => controller.graphAPI?.colorNodesByDuration?.()}
                                    >
                                        Apply
                                    </Button>
                                    <Text fontSize="sm" color="gray.500">
                                        Colora i nodi in base al tempo di esecuzione: verde veloce → rosso lento. Blu se dati mancanti.
                                    </Text>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                </Accordion>                                        

                <Button
                    size="sm"
                    colorScheme="gray"
                    w="200px"
                    onClick={() => controller.resetFilters()}
                    marginTop="auto"
                    alignSelf="center"
                >
                    RESET FILTERS
                </Button>
            </VStack>
            
        </Flex>
    );
}

