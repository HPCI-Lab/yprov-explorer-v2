import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
    Divider,
    Tooltip
} from "@chakra-ui/react";
import { FaExchangeAlt, FaArrowUp, FaArrowDown, FaLink, FaClock } from "react-icons/fa";
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import controller from "../../../../graph/GraphController";

export default function SideExploration() {
    const [activeSection, setActiveSection] = useState(null);

    const [tempNodeTypes, setTempNodeTypes] = useState(["Activity", "Entity"]);
    const [tempRelationTypes, setTempRelationTypes] = useState([
        "used",
        "wasGeneratedBy",
        "wasDerivedFrom", 
        "wasAssociatedWith", 
        "wasInformedBy"
    ]);
    const [tempDepth, setTempDepth] = useState(1);
    const [tempDirection, setTempDirection] = useState(null);

    const [tempSubgraphStart, setTempSubgraphStart] = useState(null);
    const [tempSubgraphEnd, setTempSubgraphEnd] = useState(null);

    // Listen for node clicks to set subgraph start/end
    useEffect(() => {
        const callback = (node) => {
            if (activeSection === "subgraphStart") setTempSubgraphStart(node.id);
            if (activeSection === "subgraphEnd") setTempSubgraphEnd(node.id);
        };
        controller.onNodeClick(callback);
        return () => controller.onNodeClick(() => {});
    }, [activeSection]);

    return (
        <Flex justify="center" overflowY="auto">
            <VStack w="220px" spacing={4} align="stretch" p={2}>

                {/* INPUT/OUTPUT NODES */}
                <Tooltip label="Highlight input/output nodes">
                    <Button
                        size="sm"
                        fontSize="16px"
                        w="100%"
                        color="white"
                        bg="gray.700"
                        _hover={{ bg: "gray.600" }}
                        leftIcon={<FaExchangeAlt />}
                        onClick={() =>
                            controller.graphAPI?.highlightNodesAndLinks?.(
                                controller.selectedNodeId
                            )
                        }
                    >
                        Nodes
                    </Button>
                </Tooltip>

                <Divider />

                {/* NODE TYPES */}
                <Flex justify="center">
                    <HStack spacing={2}>
                        <Tooltip label="Activity Node">
                            <Button
                                size="sm"
                                colorScheme={tempNodeTypes.includes("Activity") ? "blue" : "gray"}
                                variant={tempNodeTypes.includes("Activity") ? "solid" : "outline"}
                                onClick={() => {
                                    const updated = ["Activity"];
                                    setTempNodeTypes(updated);
                                    controller.graphAPI?.setNodeTypeOpacity?.(
                                        updated.map(t => t.toLowerCase())
                                    );
                                }}
                            >
                                <Text color="white">Activity</Text>
                            </Button>
                        </Tooltip>
                        <Tooltip label="Entity Node">
                            <Button
                                size="sm"
                                colorScheme={tempNodeTypes.includes("Entity") ? "blue" : "gray"}
                                variant={tempNodeTypes.includes("Entity") ? "solid" : "outline"}
                                onClick={() => {
                                    const updated = ["Entity"];
                                    setTempNodeTypes(updated);
                                    controller.graphAPI?.setNodeTypeOpacity?.(
                                        updated.map(t => t.toLowerCase())
                                    );
                                }}
                            >
                                <Text color="white">Entity</Text>
                            </Button>
                        </Tooltip>
                    </HStack>
                </Flex>

                <Divider />

                {/* SUBGRAPH SELECTOR 
                <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontWeight="semibold" mb={2}>Subgraph</Text>
                    <VStack align="start" spacing={2}>

                
                        <Box>
                            <Text fontSize="sm">Start Node</Text>
                            <HStack mt={1} spacing={2}>
                                <Badge colorScheme={tempSubgraphStart ? "green" : "gray"}>
                                    {tempSubgraphStart || "none"}
                                </Badge>
                                <Button
                                    size="xs"
                                    onClick={() => {
                                        setActiveSection("subgraphStart")
                                        if (controller.graphAPI?.pickNodeForSubgraph) {
                                            controller.graphAPI.pickNodeForSubgraph(null, "start");
                                        }
                                    }}
                                >
                                    Pick
                                </Button>
                            </HStack>
                        </Box>

              
                        <Box>
                            <Text fontSize="sm">End Node</Text>
                            <HStack mt={1} spacing={2}>
                                <Badge colorScheme={tempSubgraphEnd ? "red" : "gray"}>
                                    {tempSubgraphEnd || "none"}
                                </Badge>
                                <Button
                                    size="xs"
                                    onClick={() => {
                                        setActiveSection("subgraphEnd");
                                        if (controller.graphAPI?.pickNodeForSubgraph) {
                                            controller.graphAPI.pickNodeForSubgraph(null, "end");
                                        }
                                    }}
                                >
                                    Pick
                                </Button>
                            </HStack>
                        </Box>
                    </VStack>
                </Box> *
                <Divider /> /}
                

           {/* DEPTH */}
                <Box>
                    <Text fontWeight="semibold" fontSize="16px" mb={1}>Depth</Text>
                    <Slider
                        min={1}
                        max={20}
                        step={1}
                        value={tempDepth}
                        onChange={(val) => {
                        setTempDepth(val);
                        controller.applyDepthFilter(controller.selectedNodeId, val);
                        }}
                    >
                        <SliderTrack >
                        <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={6}>
                        <Badge colorScheme="transparent" color = "black">{tempDepth}</Badge>
                        </SliderThumb>
                    </Slider>
                    </Box>

                <Divider />

                {/* DIRECTION */}
                <HStack justify="center" spacing={2}>
                    <Tooltip label="Outgoing Connections">
                        <Button
                            size="sm"
                            colorScheme={tempDirection === "out" ? "blue" : "gray"}
                            variant={tempDirection === "out" ? "solid" : "outline"}
                            onClick={() => {
                                const newDirection = "out";
                                setTempDirection(newDirection);
                                controller.applyDirectionFilter(controller.selectedNodeId, newDirection);
                            }}
                        >
                            <FaArrowUp color="white"/>
                        </Button>
                    </Tooltip>
                    <Tooltip label="Incoming Connections">
                        <Button
                            size="sm"
                            colorScheme={tempDirection === "in" ? "blue" : "gray"}
                            variant={tempDirection === "in" ? "solid" : "outline"}
                            onClick={() => {
                                const newDirection = "in";
                                setTempDirection(newDirection);
                                controller.applyDirectionFilter(controller.selectedNodeId, newDirection);
                            }}
                        >
                            <FaArrowDown color = "white"/>
                        </Button>
                    </Tooltip>
                </HStack>

                <Divider />

                {/* RELATION TYPES */}
                <Box width="200px" height="70px" overflowX="auto">
                    <Text fontWeight="semibold" mb={1} fontSize="16px">
                        Relations
                    </Text>
                    <Flex gap={2}>
                        {["used","wasGeneratedBy","wasDerivedFrom","wasAssociatedWith","wasInformedBy"].map(type => (
                            <Tooltip key={type} label={type}>
                                <Box
                                    px={2} py={1}
                                    borderRadius="md"
                                    cursor="pointer"
                                    bg={tempRelationTypes.includes(type) ? "blue.500" : "gray.200"}
                                    color={tempRelationTypes.includes(type) ? "white" : "black"}
                                    onClick={() => {
                                        const updated = tempRelationTypes.includes(type)
                                            ? tempRelationTypes.filter(t => t !== type)
                                            : [...tempRelationTypes, type];
                                        setTempRelationTypes(updated);
                                        controller.setRelationTypeOpacity(updated);
                                    }}
                                >
                                    <FaLink />
                                </Box>
                            </Tooltip>
                        ))}
                    </Flex>
                </Box>

                <Divider />

                {/* COLOR BY DURATION */}
                <Tooltip label="Color nodes based on duration">
                    <Button
                        fontSize="16px"
                        w="100%"
                        bg="gray.700"
                        color="white"
                        _hover={{ bg: "gray.600" }}
                        leftIcon={<FaClock />}
                        onClick={() =>
                            controller.graphAPI?.colorNodesByDuration?.()
                        }
                    >
                        Duration
                    </Button>
                </Tooltip>

                <Divider />

                {/* RESET FILTERS */}
                <Button
                    size="sm"
                    w="100%"
                    colorScheme="red"
                    onClick={() => {
                        // Reset lato D3
                        controller.resetFilters();

                        // Reset lato React per evidenziare Activity ed Entity entrambe
                        setTempNodeTypes(["Activity", "Entity"]);
                        setTempRelationTypes([
                            "used",
                            "wasGeneratedBy",
                            "wasDerivedFrom", 
                            "wasAssociatedWith", 
                            "wasInformedBy"
                        ]);

                        setTempDepth(1);
                        setTempDirection(null);
                        setTempSubgraphStart(null);
                        setTempSubgraphEnd(null);
                    }}
                >
                    Reset
                </Button>


            </VStack>
        </Flex>
    );
}
