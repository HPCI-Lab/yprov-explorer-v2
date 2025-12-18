import {Box, HStack, IconButton} from "@chakra-ui/react";
import {useState, useEffect, useRef} from "react";
import {ChevronLeftIcon} from "@chakra-ui/icons";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { lineNumbers } from "@codemirror/view";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import CellList from "./Notebook/CellList";
import CodeEditor from "./Notebook/CodeEditor";


/*
CodePanel.js: contains the code editor for viewing cells code of the graph
 */
export default function CodePanel() {
    const value = "test";
    const selectedCodeIndex = useState(null);
    const [selectedCellIndex, setSelectedCellIndex] = useState(null);

    //-----Parsing Notebook------------
    /*
    const {
        code,
        loading,
        error,
    } = useNotebookProvenance(
        "/dataset_mean.ipynb",
        "/dataset_mean_jt.json"
    );


    if (loading) return <div>Loading notebook…</div>;
    if (error) return <div>Error loading notebook</div>;
    */
    return (
        <Box
            w="100%"
            h="100%"
            minH="0"
            bg="gray.700"
            p="4"
            color="white"
            display="flex"
            flexDirection="column"
            gap="3"
            overflow="hidden"
        >
            <Box
                pb="2"
                borderBottom="1px solid"
                borderColor="whiteAlpha.200"
            >
                <HStack spacing={2} align="center">
                    <HStack>
                        {selectedCellIndex !== null && (
                            <IconButton
                                aria-label="back"
                                size="sm"
                                icon={<ChevronLeftIcon />}
                                variant="outline"
                                borderColor="gray.500"
                                color="white"
                                _hover={{ bg: "gray.600" }}
                                onClick={() => setSelectedCellIndex(null)}
                            />
                        )}
                        <Box>
                            <Box fontSize="md" fontWeight="semibold">
                                Notebook Code
                            </Box>
                            <Box fontSize="xs" opacity={0.6}>
                                {selectedCellIndex === null
                                    ? "Cells overview"
                                    : `Cell ${selectedCellIndex}`}
                            </Box>
                        </Box>
                    </HStack>
                    <Box
                        fontSize="xs"
                        px="2"
                        py="1"
                        bg="yellow.500"
                        color="black"
                    >
                        Unlinked
                    </Box>
                </HStack>
            </Box>
            <Box flex="1" minH="0" overflow="hidden">
                {selectedCellIndex === null ? (
                    <CellList
                        onSelectCell={setSelectedCellIndex}
                    />
                ) : (
                    <CodeEditor
                        cellIndex={selectedCellIndex}
                    />
                )}
            </Box>
        </Box>
    );
}
