import {Box, Heading, Text, VStack, HStack, Image, Spinner, IconButton, Input} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import controller from "../../../../graph/GraphController";

/*
 SidePattern.js: Patterns Panel
*/

function parseMotifs(data) {
  return Object.entries(data).map(([motifId, motifData]) => ({
    id: motifId,
    image: `/patterns/${motifData.image}`,
    occurrences: motifData.occurrences,
    instances: motifData.instances.map((inst, idx) => ({
      id: idx,
      nodes: inst
    }))
  }));
}

export default function SidePattern() {
  const [motifs, setMotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileNumber, setFileNumber] = useState(3);
  
  // useState of instances motif
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [selectedInstanceByMotif, setSelectedInstanceByMotif] = useState({});
  const [allInstancesByMotif, setAllInstancesByMotif] = useState({});


  // Load motifs when fileNumber changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/patterns/FIRES_${fileNumber}.log`)
      .then(res => {
        if (!res.ok) throw new Error("Error on loading pattern file .log");
        return res.text();
      })
      .then(text => {
        const json = JSON.parse(text);
        setMotifs(parseMotifs(json));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setMotifs([]);
        setLoading(false);
      });
  }, [fileNumber]);

  const increaseFile = () => setFileNumber(n => n + 1);
  const decreaseFile = () => setFileNumber(n => Math.max(1, n - 1));

  return (
    <Box
      color="white"
      p="4"
      height="100%"
      maxH="100vh"
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          background: "gray.500",
          borderRadius: "3px"
        }
      }}
    >
      <Heading size="md" mb="4">
        Pattern Panel
      </Heading>

      {/* File selector */}
      <HStack mb="4" spacing="2" align="center">
        <Text fontSize="sm">PATTERN</Text>

        <VStack spacing="0">
          <IconButton
            icon={<ChevronUpIcon />}
            size="xs"
            aria-label="Increase"
            onClick={increaseFile}
          />
          <IconButton
            icon={<ChevronDownIcon />}
            size="xs"
            aria-label="Decrease"
            onClick={decreaseFile}
          />
        </VStack>

        <Input
          type="number"
          value={fileNumber}
          min={1}
          width="70px"
          textAlign="center"
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v) && v >= 1) setFileNumber(v);
          }}
        />
      </HStack>

      {/* Loading */}
      {loading && (
        <HStack>
          <Spinner size="sm" />
          <Text fontSize="sm">Loading patterns...</Text>
        </HStack>
      )}

      {/* Error */}
      {error && (
        <Text color="red.300" fontSize="sm">
          {error}
        </Text>
      )}

      {!loading && !error && (
        <VStack align="stretch" spacing="6">
          {motifs.map(motif => (
            <Box
              key={motif.id}
              border="1px solid"
              borderColor="gray.600"
              borderRadius="md"
              p="3"
              cursor="pointer"
              _hover={{ borderColor: "gray.200" }}
              onClick={() => {
                setSelectedMotif(motif);

                setAllInstancesByMotif(prev => ({
                  ...prev,
                  [motif.id]: true
                }));

                const allNodeIds = motif.instances.flatMap(inst => inst.nodes);
                controller.highlightNodes(allNodeIds);
              }}
            >
              <HStack spacing="4" mb="2">
                <Image
                  src={motif.image}
                  alt={motif.id}
                  boxSize="50px"
                  objectFit="contain"
                  borderRadius="md"
                  bgColor={"whiteAlpha.800"}
                />
                <Box>
                  <Text fontWeight="bold">{motif.id}</Text>
                  <Text fontSize="sm" color="gray.300">
                    Occurrences: {motif.occurrences}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Instances: {motif.instances.length}
                  </Text>
                </Box>
              </HStack>
              
              {/* scroll instances motif */}
              {selectedMotif?.id === motif.id && (
                <Box mt="3">
                  <Text fontSize="xs" mb="1" color="gray.400">
                    Instance {(selectedInstanceByMotif[motif.id] ?? 0) + 1}
                    {" / "}
                    {motif.instances.length}
                  </Text>

                  <Input
                    type="range"
                    min={0}
                    max={motif.instances.length - 1}
                    step={1}
                    value={selectedInstanceByMotif[motif.id] ?? 0}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      
                      setSelectedInstanceByMotif(prev => ({
                        ...prev,
                        [motif.id]: idx
                      }));

                      setAllInstancesByMotif(prev => ({
                        ...prev,
                        [motif.id]: false
                      }));

                      const nodeIds = motif.instances[idx]?.nodes || [];
                      controller.highlightNodes(nodeIds);
                    }}

                  />
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
