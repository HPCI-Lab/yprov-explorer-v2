import {
    Box,
    Button, HStack, IconButton,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text,
    VStack,
} from "@chakra-ui/react";
import {useMemo} from "react";
import {AddIcon, MinusIcon, RepeatIcon} from "@chakra-ui/icons";

/*
* Filters.js: main component layout for dasks filters
* */

export default function FiltersPanel({available, cellGroup, workerGroup, chunkGroup,}) {
    const { cells, workers, chunks } = available;

    //main layout
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

//main function for layout filters with checkboxes
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
                <MenuList minW="100%" bg="white">
                    <MenuOptionGroup
                        type="checkbox"
                        value={group.value}
                        onChange={group.setValue}
                        color="black"
                        bg="white"
                    >
                        {values.map(value => (
                            <MenuItemOption
                                key={value}
                                value={value}
                                color="black"
                                bg="white"
                                minW="100%"
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

//main function for slider filter
function FiltersSlider({title, values, group,}) {
    //max limit of the bar
    const max = Math.max(values.length - 1, 0);
    //actual index
    const index = useMemo(() => {
        if (!group.value?.length){
            return 0;
        }else{
            const i = values.indexOf(group.value[0]);
            if(i >= 0){
                return i;
            }else{
                return 0;
            }
        }
    }, [group.value, values]);
    const setIndex = (i) => {
        const clamped = Math.max(0, Math.min(max, i));
        group.setValue([values[clamped]]);
    };

    if (values.length === 0) return null;

    return (
        <Box>
            <Text fontSize="md" fontWeight="semibold" mb="2">
                {title}
            </Text>

            <HStack spacing={3}>
                <IconButton
                    size="sm"
                    icon={<MinusIcon />}
                    aria-label="decrease"
                    onClick={() => setIndex(index - 1)}
                    isDisabled={index === 0}
                />

                <Slider
                    value={index}
                    min={0}
                    max={max}
                    step={1}
                    onChange={setIndex}
                    flex="1"
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>

                <IconButton
                    size="sm"
                    icon={<AddIcon />}
                    aria-label="increase"
                    onClick={() => setIndex(index + 1)}
                    isDisabled={index === max}
                />
                <IconButton
                    size="sm"
                    icon={<RepeatIcon />}
                    aria-label="reset"
                    variant="ghost"
                    onClick={() => group.setValue([])}
                />
            </HStack>

            <Text fontSize="xs" mt="1" opacity={0.7}>
                Selected: {values[index]}
            </Text>
        </Box>
    );
}
