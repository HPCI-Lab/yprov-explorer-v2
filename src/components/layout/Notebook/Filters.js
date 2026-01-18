import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    VStack,
} from "@chakra-ui/react";
import {FiltersSlider} from "./FiltersSlider";

export default function FiltersPanel({available, cellGroup, workerGroup, chunkGroup,}) {
    const { cells, workers, chunks } = available;

    return (
        <VStack align="stretch" spacing={4}>
            <FiltersSlider
                title="Filter by cell"
                values={cells}
                group={cellGroup}
            />

            <Filters
                title="Filter by workers"
                label="Workers"
                values={workers}
                group={workerGroup}
            />

            <FiltersSlider
                title="Filter by chunks"
                values={chunks}
                group={chunkGroup}
            />
        </VStack>

        /* MENU FILTER
        <VStack align="stretch" spacing={4}>
            <Filters
                title="Filter by cell"
                label="Cells"
                values={cells}
                group={cellGroup}
            />
            <Filters
                title="Filter by workers"
                label="Workers"
                values={workers}
                group={workerGroup}
            />
            <Filters
                title="Filter by chunks"
                label="Chunks"
                values={chunks}
                group={chunkGroup}
            />
        </VStack>
         */

    );
}

function Filters({ title, label, values, group }) {
    return (
        <Box>
            <Box fontSize="md" fontWeight="semibold" mb="1">
                {title}
            </Box>
            <Menu closeOnSelect={false}>
                <MenuButton as={Button} size="sm" w="100%">
                    {label}
                </MenuButton>
                <MenuList minW="100%">
                    <MenuOptionGroup
                        type="checkbox"
                        value={group.value}
                        onChange={group.setValue}
                        color="black"
                    >
                        {values.map(value => (
                            <MenuItemOption
                                key={value}
                                value={value}
                                color="black"
                            >
                                {value}
                            </MenuItemOption>
                        ))}
                    </MenuOptionGroup>
                </MenuList>
            </Menu>
        </Box>
    );
}
