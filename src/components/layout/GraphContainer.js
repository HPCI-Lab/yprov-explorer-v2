import {Box, IconButton} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import parseProvJSON from "../../graph/parseProvenance";
import {d3Adapter} from "../../graph/d3Adapter";
import controller from "../../graph/GraphController";
import Graph from "../../graph/Graph";
import { SettingsIcon, InfoIcon } from "@chakra-ui/icons";
import { MdZoomOutMap } from "react-icons/md";
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
            controller.setGraphData(parsed);
        } catch (err) {
            console.error("Error parsing JSON for graph:", err);
            setGraph(null);
        }
    }, [graphData]);

    return (
        <Box
            w="100%"
            h="100%"
            flex="1"
            bg="white"
            position="relative"
            overflow="hidden"
            id="graphFrame"
        >
            <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                position="absolute"
                top="2"
                left="3"
                size="sm"
                variant="ghost"
            />

            <IconButton
                aria-label="Expand"
                icon={<MdZoomOutMap />}
                position="absolute"
                top="2"
                right="3"
                size="sm"
                variant="ghost"
            />

            <IconButton
                aria-label="Info"
                icon={<InfoIcon />}
                position="absolute"
                bottom="2"
                left="3"
                size="sm"
                variant="ghost"
            />
            <Box
                position="absolute"
                top="0%"
                left="0%"
                width="100%"
                height="100%"
                color="gray.500"
                id="graphCanvas"
            >
                {graph && <Graph graph={graph} controller={controller} />}
            </Box>
        </Box>
    );
}
