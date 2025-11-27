import { Box } from "@chakra-ui/react";
import {useState} from "react";
import Graph from "../old/Graph/Graph";
/*
GraphContainer.js: Main component that contains the graph and its
related components. Such as Graph (graph), GraphSettings (make labels visible or not),
FullscreenButton (set fullscreen) and GraphInfo (graph information). Behaves
as a container for all these components.
*/
export default function GraphContainer({ onNodeClick, highlightedNode, graphData }) {
        // State to control the visibility of node labels, initially not visible (false).
        const [showNodeLabelsState, setShowNodeLabelsState] = useState(true);
        // State to control the visibility of link labels, initially not visible (false).
        const [showLinkLabels, setShowLinkLabels] = useState(true);
        // State to control the visibility of "used" links, initially not visible (false).
        const [showUsedLinks, setShowUsedLinks] = useState(false);
        // State to control the visibility of "wasDerivedFrom" links, initially not visible (false).
        const [showWasDerivedFromLinks, setShowWasDerivedFromLinks] = useState(false);
        // State to control the visibility of "wasGeneratedBy" links, initially not visible (false).
        const [showWasGeneratedByLinks, setShowWasGeneratedByLinks] = useState(false);
        // State to control the visibility of "wasInformedBy" links, initially not visible (false).
        const [showWasInformedByLinks, setShowWasInformedByLinks] = useState(false);
        // State to control the visibility of "wasAssociatedWith" links, initially not visible (false).
        const [showWasAssociatedWithLinks, setShowWasAssociatedWithLinks] =
            useState(false);
        // State to control the visibility of "wasStartedBy" links, initially not visible (false).
        const [showWasStartedByLinks, setShowWasStartedByLinks] = useState(false);
        // State to control the visibility of "hadMember" links, initially not visible (false).
        const [showHadMemberLinks, setShowHadMemberLinks] = useState(false);
        // State to control the visibility of "wasAttributedTo" links, initially not visible (false).
        const [showWasAttributedToLinks, setShowWasAttributedToLinks] =
            useState(false);
        // State for the distance between nodes
        const [nodeDistance, setNodeDistance] = useState(180);
        // State for the repulsion between nodes
        const [nodeRepulsion, setNodeRepulsion] = useState(-300);
        // State for the node collision
        const [nodeCollision, setNodeCollision] = useState(40);
        // State for the alpha decay
        const [alphaDecay, setAlphaDecay] = useState(0.005);

        // State to store the graph statistics (total nodes, activity count, entity count).
        const [graphStats, setGraphStats] = useState({
            totalNodes: 0,
            activityCount: 0,
            entityCount: 0,
        });

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
                transform="translate(-50%, -50%)"
                color="gray.500"
                borderRadius="xl"
                id="graphCanvas"

            >
                <Graph
                    onNodeClick={onNodeClick}
                    highlightedNode={highlightedNode}
                    showNodeLabels={showNodeLabelsState}
                    showLinkLabels={showLinkLabels}
                    graphData={graphData}
                    onGraphStats={setGraphStats}
                    showUsedLinks={showUsedLinks}
                    showWasDerivedFromLinks={showWasDerivedFromLinks}
                    showWasGeneratedByLinks={showWasGeneratedByLinks}
                    showWasInformedByLinks={showWasInformedByLinks}
                    showWasAssociatedWithLinks={showWasAssociatedWithLinks}
                    showWasStartedByLinks={showWasStartedByLinks}
                    showHadMemberLinks={showHadMemberLinks}
                    showWasAttributedToLinks={showWasAttributedToLinks}
                    nodeDistance={nodeDistance}
                    nodeRepulsion={nodeRepulsion}
                    nodeCollision={nodeCollision}
                    alphaDecay={alphaDecay}
                />
            </Box>
        </Box>
    );
}
