import {Box, Collapse, HStack, IconButton, useCheckboxGroup, VStack} from "@chakra-ui/react";
import {useState, useEffect, useRef} from "react";
import {ChevronLeftIcon} from "@chakra-ui/icons";
import CodeEditor from "./Notebook/CodeEditor";
import controller from "../../graph/GraphController";
import Filters from "./Notebook/components/Filters";
import {FilterIcon} from "lucide-react";
/*
CodePanel.js: contains the code editor for viewing cells code of the graph.
Including the dask filters for the notebook.
 */

export default function CodePanel({ graphData, notebook }) {
    const cellGroup = useCheckboxGroup({ defaultValue: [] });
    const workerGroup = useCheckboxGroup({ defaultValue: [] });
    const chunkGroup = useCheckboxGroup({ defaultValue: [] });
    const availableFilters = controller.getAvailableFilters();
    const [noProvenanceLine, setNoProvenanceLine] = useState(null);
    const provenanceLines = useRef(new Set());
    const [filtersOpen, setFiltersOpen] = useState(false);

    //use state for filters
    useEffect(() => {
        if (!graphData || !notebook){

        }else{
            controller.applyFilter?.({
                cells: cellGroup.value,
                workers: workerGroup.value,
                chunks: chunkGroup.value,
            });
        }
    }, [cellGroup.value, workerGroup.value, chunkGroup.value, graphData]);

    //notebook upload
    const {lines, cells} = parseNotebook(notebook, graphData?.nodes || []);


    useEffect(() => {
        if (!graphData || !lines) return;
        const set = new Set();

        graphData.nodes.forEach(n => {
            const a = n.attributes || {};
            const start = Number(a["yprov4wfs:jupyter_cell_line_start"]);
            const end   = Number(a["yprov4wfs:jupyter_cell_line_end"]);

            if (!Number.isNaN(start) && !Number.isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    set.add(i);
                }
            }
        });

        provenanceLines.current = set;
    }, [graphData, lines]);

    //DEMO
    function handleLineClick(_, lineNumber) {
        console.log("CLICKED LINE:", lineNumber);
        if (!graphData) return;
        const line = lines.find(l => l.lineNumber === lineNumber);
        if (!line) return;
        const cellIndex = line.cellIndex;
        let matched = graphData.nodes.filter(n => {
            const a = n.attributes || {};
            const nodeCell = Number(a["yprov4wfs:jupyter_cell_index"]);
            const start = Number(a["yprov4wfs:jupyter_cell_line_start"]);
            const end   = Number(a["yprov4wfs:jupyter_cell_line_end"]);
            return (
                nodeCell === cellIndex &&
                !Number.isNaN(start) &&
                !Number.isNaN(end) &&
                lineNumber >= start &&
                lineNumber <= end
            );
        });
        if (matched.length === 0) {
            matched = graphData.nodes.filter(n =>
                Number(n.attributes?.["yprov4wfs:jupyter_cell_index"]) === cellIndex
            );
        }
        const ids = matched.map(n => n.id);
        controller.highlightNodes(ids);
        setNoProvenanceLine(
            ids.length === 0 ? lineNumber : null
        );
        console.log("Highlight nodes:", ids);
    }

    //Main layout
    return (
        <Box
            w="100%"
            h="100%"
            minH="0"
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
                        <Box>
                            <Box fontSize="md" fontWeight="semibold">
                                Notebook Code
                            </Box>
                        </Box>
                    </HStack>
                    <IconButton
                        aria-label="Toggle filters"
                        size="xs"
                        icon={<FilterIcon size={20}/>}
                        onClick={() => setFiltersOpen(v => !v)}
                    />
                </HStack>
            </Box>
            <Box flex="1" minH="0" position="relative" overflow="hidden">
                <Collapse in={filtersOpen}>
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bg="black"
                        transition="width 0s linear"
                        zIndex="100"
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.300"
                        p="3"
                        boxShadow="lg"
                    >
                        <Filters
                            available={availableFilters}
                            cellGroup={cellGroup}
                            workerGroup={workerGroup}
                            chunkGroup={chunkGroup}
                        />
                    </Box>
                </Collapse>
                <CodeEditor
                    lines={lines}
                    provenanceLines={provenanceLines.current}
                    onLineClick={(lineNumber) => handleLineClick(null, lineNumber)}
                />
                {noProvenanceLine !== null && (
                    <Box
                        mt="2"
                        px="2"
                        py="1"
                        fontSize="xs"
                        bg="yellow.500"
                        color="black"
                        borderRadius="md"
                    >
                        No provenance information for line {noProvenanceLine}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
