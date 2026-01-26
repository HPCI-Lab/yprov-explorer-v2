import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Spinner,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from "@chakra-ui/react";

import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";

import { useEffect, useState } from "react";
import controller from "../../../../graph/GraphController";

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
  const [minOccurrences, setMinOccurrences] = useState(1);

  const [selectedMotif, setSelectedMotif] = useState(null);
  const [selectedInstanceByMotif, setSelectedInstanceByMotif] = useState({});
  const [zoomed, setZoomed] = useState(null);


  useEffect(() => {
    setLoading(true);
    setError(null);

    setSelectedMotif(null);
    setSelectedInstanceByMotif({});
    setZoomed(false);

    fetch(`/patterns/yprov4_${fileNumber}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Error loading pattern file");
        return res.text();
      })
      .then(text => {
        setMotifs(parseMotifs(JSON.parse(text)));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setMotifs([]);
        setLoading(false);
      });
  }, [fileNumber]);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      color="white"
      backdropFilter="blur(18px)"
    >
      <Box
        p="4"
        pb="1"
        pt="1"
        borderBottom="1px solid rgba(255,255,255,0.08)"
      >
        <Heading size="md" mb="3" fontWeight="600" letterSpacing="-0.02em">
          Pattern Explorer
        </Heading>

        <Text
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="wider"
          color="gray.400"
        >
          Pattern size
        </Text>

        <HStack justify="center" spacing="4" m="3">
          <IconButton
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={() => {
              setFileNumber(n => Math.max(3, n - 1))
              controller.resetHighlight();
            }}
          />

          <Text fontSize="xl" fontWeight="600" minW="40px" textAlign="center">
            {fileNumber}
          </Text>

          <IconButton
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={() => {
              setFileNumber(n => Math.min(10, n + 1));
              controller.resetHighlight();
            }}

          />
        </HStack>

        <Text
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="wider"
          color="gray.400"
        >
          Min occurrences
        </Text>

        <HStack justify="center" spacing="4" m="3">
          <IconButton
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            isDisabled={minOccurrences <= 1}
            onClick={() => {
              setMinOccurrences(n => Math.max(1, n - 1));
              controller.resetHighlight();
            }}
          />

          <Text fontSize="xl" fontWeight="600" minW="40px" textAlign="center">
            {minOccurrences}
          </Text>

          <IconButton
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            onClick={() => setMinOccurrences(n => n + 1)}
          />
        </HStack>
      </Box>

      <Box
        flex="1"
        minH="0"
        overflowY="auto"
        p="4"
        pb="calc(4 * 1rem + 70px)"
        boxSizing="border-box"
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.25)",
            borderRadius: "full"
          }
        }}
      >
        {loading && (
          <HStack spacing="3">
            <Spinner size="sm" />
            <Text fontSize="sm">Loading patterns…</Text>
          </HStack>
        )}

        {error && (
          <Text color="red.300" fontSize="sm">
            {error}
          </Text>
        )}

        {!loading && !error && (
          <VStack spacing="6" align="stretch">
            {motifs.map(motif => {
              const isSelected = selectedMotif?.id === motif.id;
              const selectedIdx = selectedInstanceByMotif[motif.id] ?? 0;

              return (
                <Box
                  key={motif.id}
                  p="4"
                  borderRadius="2xl"
                  bg="rgba(255,255,255,0.04)"
                  border="1px solid rgba(255,255,255,0.08)"
                  cursor="pointer"
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "translateY(-2px)",
                    bg: "rgba(255,255,255,0.07)"
                  }}
                  boxShadow={isSelected ? "0 10px 30px rgba(0,0,0,0.4)" : "none"}
                  onClick={() => {
                    if (!isSelected) {
                      setSelectedMotif(motif);
                      setZoomed(true); 
                    }

                    if (!(motif.id in selectedInstanceByMotif)) {
                      const allNodes = motif.instances.flatMap(i => i.nodes);

                      controller.highlightNodes(allNodes);
                      controller.zoomOnNodes(allNodes);

                      setSelectedInstanceByMotif(prev => ({
                        ...prev,
                        [motif.id]: 0
                      }));
                    }
                  }}
                >
                  <Image
                    src={motif.image}
                    boxSize={isSelected && zoomed ? "220px" : "110px"} 
                    transition="all 0.3s ease"
                    objectFit="contain"
                    mx="auto"
                    bg="white"
                    p="2"
                    borderRadius="xl"
                    boxShadow="0 8px 20px rgba(0,0,0,0.35)"
                    mb="3"
                  />

                  {isSelected && (
                    <VStack spacing="2">

                      <Text fontSize="xs" color="gray.400">
                        Instance {selectedIdx + 1} / {motif.instances.length}
                      </Text>

                      <Slider
                        min={0}
                        max={motif.instances.length - 1}
                        step={1}
                        value={selectedIdx}
                        onChange={idx => {
                          setSelectedInstanceByMotif(prev => ({
                            ...prev,
                            [motif.id]: idx
                          }));

                          const instanceNodes = motif.instances[idx].nodes;
                          controller.highlightNodes(instanceNodes);
                          controller.zoomOnNodes(instanceNodes);
                        }}
                      >
                        <SliderTrack bg="rgba(255,255,255,0.15)">
                          <SliderFilledTrack bg="white" />
                        </SliderTrack>
                        <SliderThumb
                          boxSize="4"
                          bg="white"
                          boxShadow="0 0 0 6px rgba(255,255,255,0.15)"
                        />
                      </Slider>

                    </VStack>
                  )}
                </Box>
              );
            })}

          </VStack>
        )}
      </Box>
    </Box>
  );
}
