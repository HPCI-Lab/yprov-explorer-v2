import {Box, Collapse, HStack, IconButton, useCheckboxGroup, VStack} from "@chakra-ui/react";
import {useState, useEffect} from "react";
import CodeEditor from "./Notebook/components/CodeEditor";
import controller from "../graph/graphController";
import parserNotebook from "./Notebook/parserNotebook";
import Filters from "./Notebook/components/Filters";
import {FilterIcon} from "lucide-react";
/*
CodePanel.js: contains the code editor for viewing cells code of the graph.
Including the dask filters for the notebook.
 */
/**
 *
 * @param {Object} graphData - data
 * @param {Object} notebook - notebook file
 * @returns {JSX.Element}
 * @constructor
 */

export default function CodePanel({ graphData, notebook }) {
    //filters arrays
    const cellGroup = useCheckboxGroup({ defaultValue: [] });
    const workerGroup = useCheckboxGroup({ defaultValue: [] });
    const chunkGroup = useCheckboxGroup({ defaultValue: [] });
    const availableFilters = controller.getAvailableFilters();
    //use state for filter states
    const [filtersOpen, setFiltersOpen] = useState(false);
    //cells array
    const cellsWithProvenance = [];
    //parsed lines and cells
    const {lines, cells} = parserNotebook(notebook, graphData?.nodes || []);
    //activity nodes array
    const activityNodes = (graphData?.nodes || []).filter(
        node => node.type === "activity"
    );

    //building the provenance cells
    for(let i = 0; i < cells.length; i++) {
        const cellsId = [];
        //verifieng with the attributes
        for(let j = 0; j < activityNodes.length; j++) {
            if(cells[i].cellIndex === Number(activityNodes[j].attributes["yprov4wfs:jupyter_cell_index"])){
                cellsId.push(activityNodes[j].id);
            }
        }
        //building cells with provenance
        if(cellsId.length > 0){
            cellsWithProvenance.push({
                ...cells[i],
                hasProvenance: true,
                provenanceNodeIds: cellsId
            });
        }else{
            cellsWithProvenance.push({
                ...cells[i],
                hasProvenance: false,
                provenanceNodeIds: cellsId
            });
        }
    }

    /* function for managing the click. Click the line -> finds the cell --> catch all nodes
     It's a Demo: I recommend to improve the .json metadata to
     include an attribute for pairing the notebook and the generated .json.
     */
    function handleClick(lineNumber) {
        console.log(lineNumber);
        if (!graphData){
            return;
        }
        //finds the line
        let line = null;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].count === lineNumber) {
                line = lines[i];
                console.log(line);
            }
        }
        if (!line){
            return;
        }else{
            //finds the cell from the line
            let cell = null;
            for (let i = 0; i < cellsWithProvenance.length; i++) {
                if (cellsWithProvenance[i].cellIndex === line.index) {
                    cell = cellsWithProvenance[i];
                    console.log(cell);
                }
            }
            if (cell && cell.provenanceNodeIds.length > 0) {
                console.log(cell.provenanceNodeIds);
                controller.highlightNodes(cell.provenanceNodeIds);
            }
        }
    }

    //use state fpr filters
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

    //Main layout
    return (
        <Box w="100%" h="100%" minH="0" p="4" color="white" display="flex" flexDirection="column" gap="3" overflow="hidden">
            <Box pb="2" borderBottom="1px solid" borderColor="white">
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
                <Collapse in={filtersOpen} bg="black">
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bg="black"
                        transition="width 0s linear"
                        zIndex="100"
                        borderBottom="1px solid"
                        borderColor="white"
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
                <CodeEditor lines={lines} onLineClick={handleClick}/>
            </Box>
        </Box>
    );
}
