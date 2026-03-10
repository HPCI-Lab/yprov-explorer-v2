import {Box, IconButton} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
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
    //graph states
    const [graph, setGraph] = useState(null);
    // State for the fullscreen mode (true if active, false otherwise)
    const [isFullscreen, setIsFullscreen] = useState(false);
    //ref to container
    const frameRef = useRef(null);
    const [isInfoVisible, setIsInfoVisible] = useState(false); // State to control the visibility of the info panel

    //use effect to manage graphdata changes
    useEffect(() => {
        if (!graphData){
            return;
        }
        try {
            setGraph(graphData);
        } catch (err) {
            //console.error("Error adapting graph data:", err);
            setGraph(null);
        }
    }, [graphData]);


    // Function to toggle the fullscreen mode
    const toggleFullscreen = () => {
        const frame = frameRef.current;
        if (!frame){
            return;
        }
        if (!document.fullscreenElement) {
            frame.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    //main container layout
    return (
        <Box
            w="100%"
            h="100%"
            flex="1"
            bg="white"
            position="relative"
            overflow="hidden"
            ref={frameRef}
            zIndex={isFullscreen ? 9999 : "auto"}
        >
            {/*label settings*/}
            <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                position="absolute"
                top="2"
                left="3"
                size="sm"
                zIndex="10"
            />

            {/*fullscreen mode*/}
            <IconButton
                aria-label="Expand"
                icon={<MdZoomOutMap />}
                position="absolute"
                top="2"
                right="3"
                size="sm"
                onClick={toggleFullscreen}
                zIndex="10"
            />

            {/*Info icon*/}
            <IconButton
                aria-label="Info"
                icon={<InfoIcon />}
                position="absolute"
                bottom="2"
                left="3"
                size="sm"
                zIndex="10"
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
                {/*graph render*/}
                {graph && <Graph graph={graph} controller={controller} />}
            </Box>
        </Box>
    );
}
