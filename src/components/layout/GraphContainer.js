import { Box } from "@chakra-ui/react";
import {useEffect, useState} from "react";
import parseProvJSON from "../../graph/parseProvenance";
import {d3Adapter} from "../../graph/d3Adapter";
import controller from "../../graph/GraphController";
import Graph from "../../graph/Graph";

/*
GraphContainer.js: Main component that contains the graph and its
related components. Such as Graph (graph), GraphSettings (make labels visible or not),
FullscreenButton (set fullscreen) and GraphInfo (graph information). Behaves
as a container for all these components.
*/

export default function GraphContainer({ graphData }) {
    const [graph, setGraph] = useState(null);

    useEffect(() => {
        if (!graphData) return;

        try {
            const parsed = parseProvJSON(graphData);
            const d3data = d3Adapter(parsed);
            setGraph(d3data);
        } catch (err) {
            console.error("Error parsing JSON for graph:", err);
            setGraph(null);
        }
    }, [graphData]);

    return (
        <Box
            flex="1"
            bg="white"
            borderRadius="xl"
            position="relative"
            overflow="hidden"
            id="graphFrame"
        >
            <Box
                position="absolute"
                top="0%"
                left="0%"
                width="100%"
                height="100%"
                color="gray.500"
                borderRadius="xl"
                id="graphCanvas"
            >
                {graph && <Graph graph={graph} controller={controller} />}
            </Box>
        </Box>
    );
}
