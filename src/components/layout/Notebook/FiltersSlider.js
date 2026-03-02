import {
    Box,
    HStack,
    IconButton,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { RepeatIcon } from "@chakra-ui/icons";


export function FiltersSlider({title, values, group,}) {
    const max = Math.max(values.length - 1, 0);

    const index = useMemo(() => {
        if (!group.value?.length) return 0;
        const i = values.indexOf(group.value[0]);
        return i >= 0 ? i : 0;
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
