import { Box } from "@chakra-ui/react";


export default function CellList({ cells, onSelectCell }) {
    return (
        <Box h="100%" overflow="auto">
            {cells.map((cell) => (
                <Box
                    key={cell.cellIndex}
                    py="1"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.200"
                    cursor="pointer"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => onSelectCell(cell.cellIndex)}
                >
                    <Box fontSize="sm" fontWeight="semibold">
                        Cell {cell.cellIndex}
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



