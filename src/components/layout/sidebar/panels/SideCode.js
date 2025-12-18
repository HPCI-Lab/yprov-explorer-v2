import {
    Box,
    Flex,
    HStack,
    VStack,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItemOption,
    MenuOptionGroup,
    useCheckboxGroup,
} from "@chakra-ui/react";
import React from "react";
import controller from "../../../../graph/GraphController";
import { useEffect } from "react";
import {ExternalLinkIcon} from '@chakra-ui/icons';




export default function SideCode() {
    const cellGroup = useCheckboxGroup({ defaultValue: [] });
    const workerGroup = useCheckboxGroup({ defaultValue: [] });
    const chunkGroup = useCheckboxGroup({ defaultValue: [] });
    const { cells, workers, chunks } = controller.getAvailableFilters();

    useEffect(() => {
        controller.applyFilter?.({
            cells: cellGroup.value,
            workers: workerGroup.value,
            chunks: chunkGroup.value,
        });
    }, [cellGroup.value, workerGroup.value, chunkGroup.value]);

    return (
        <Flex flex="1" justify="center" gap="5">
            <VStack spacing={3} align="stretch" w="100%" flex="1">
                <Box pb="2" borderBottom="1px solid" borderColor="whiteAlpha.200">
                    <HStack spacing={2}>
                        <Box>
                            <Box fontSize="md" fontWeight="semibold">
                                Dask options
                            </Box>
                            <Box fontSize="xs" opacity={0.6}>
                                Node ·
                            </Box>
                        </Box>
                    </HStack>
                </Box>

                <Flex
                    direction="column"
                    justify="space-between"
                    flex="1"
                >
                    <VStack align="stretch" spacing={4}>
                        <Box width="100%">
                            <Box fontSize="md" fontWeight="semibold" w="100%">
                                Filter by cell
                            </Box>

                            <Menu closeOnSelect={false}>
                                <MenuButton as={Button} size="sm" w="100%">
                                    Cells
                                </MenuButton>

                                <MenuList minW="100%">
                                    <MenuOptionGroup
                                        type="checkbox"
                                        value={cellGroup.value}
                                        onChange={cellGroup.setValue}
                                        color="black"
                                    >
                                        {cells.map((value) => (
                                            <MenuItemOption key={value} value={value} color="black">
                                                {value}
                                            </MenuItemOption>
                                        ))}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </Box>
                        <Box width="100%">
                            <Box fontSize="md" fontWeight="semibold" w="100%">
                                Filter by workers
                            </Box>

                            <Menu closeOnSelect={false}>
                                <MenuButton as={Button} size="sm" w="100%">
                                    Workers
                                </MenuButton>

                                <MenuList minW="100%">
                                    <MenuOptionGroup
                                        type="checkbox"
                                        value={workerGroup.value}
                                        onChange={workerGroup.setValue}
                                        color="black"
                                    >
                                        {workers.map((value) => (
                                            <MenuItemOption key={value} value={value} color="black">
                                                {value}
                                            </MenuItemOption>
                                        ))}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </Box>
                        <Box width="100%">
                            <Box fontSize="md" fontWeight="semibold" w="100%">
                                Filter by chucks
                            </Box>

                            <Menu closeOnSelect={false}>
                                <MenuButton as={Button} size="sm" w="100%">
                                    Chunks
                                </MenuButton>

                                <MenuList minW="100%">
                                    <MenuOptionGroup
                                        type="checkbox"
                                        value={chunkGroup.value}
                                        onChange={chunkGroup.setValue}
                                        color="black"
                                    >
                                        {chunks.map((value) => (
                                            <MenuItemOption key={value} value={value} color="black">
                                                {value}
                                            </MenuItemOption>
                                        ))}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </Box>
                    </VStack>
                    <Button colorScheme="whiteAlpha" mt="auto">
                        Open Dask's Dashboard <ExternalLinkIcon />
                    </Button>
                </Flex>
            </VStack>
        </Flex>
    );
}
