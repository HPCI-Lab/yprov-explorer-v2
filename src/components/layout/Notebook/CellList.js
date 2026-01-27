import { Box } from "@chakra-ui/react";

const test = [
    { index: 0, preview: "import xarray as xr" },
    { index: 1, preview: "ds = xr.open_dataset(...)" },
    { index: 2, preview: "ds = ds.persist()" },
    { index: 3, preview: "result = ds.mean()" },
]

export default function CellList({ onSelectCell }) {
    return (
        <Box h="100%" overflow="auto">
            {test.map((cell) => (
                <Box
                    key={cell.index}
                    py="1"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.200"
                    cursor="pointer"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => onSelectCell(cell.index)}
                >
                    <Box fontSize="sm" fontWeight="semibold">
                        Cell {cell.index}
                    </Box>
                    <Box
                        fontSize="xs"
                        opacity={0.7}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {cell.preview}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}



