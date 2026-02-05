// src/components/layout/sidebar/panels/SidePattern.js
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
  SliderThumb,
  Button,
  Input,
  Collapse
} from "@chakra-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { useState } from "react";
import controller from "../../../../graph/GraphController";

function parseMotifs(data, apiBase) {
  return Object.entries(data).map(([motifId, motifData]) => {
    let image = motifData.image || "";
    if (typeof image === "string" && image.startsWith("/")) {
      const base = apiBase ? apiBase.replace(/\/$/, "") : "";
      image = `${base}${image}`;
    }
    return {
      id: motifId,
      image,
      occurrences: motifData.occurrences,
      instances: motifData.instances.map((inst, idx) => ({
        id: idx,
        nodes: inst
      }))
    };
  });
}

export default function SidePattern({ graphData, savedGraphFilename }) {
  const [allMotifs, setAllMotifs] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);

  const [knumber, setKnumber] = useState(3);
  const [minOccurrences, setMinOccurrences] = useState(1);

  const [selectedMotif, setSelectedMotif] = useState(null);
  const [selectedInstanceByMotif, setSelectedInstanceByMotif] = useState({});
  const [zoomed, setZoomed] = useState(false);

  const [calculationDone, setCalculationDone] = useState(false);

  const [showFilterControls, setShowFilterControls] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  const API_BASE = process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8000";

  const clampK = (v) => Math.min(10, Math.max(3, v));
  const clampMin = (v) => Math.max(1, v);

  const handleCalculate = async () => {
    setError(null);

    if (loading) return;

    if (!savedGraphFilename) {
      setError("No graphics file has been uploaded to the server. Please upload a file from the Input panel");
      return;
    }

    setLoading(true);
    setMotifs([]);
    setAllMotifs([]);
    setSelectedMotif(null);
    setSelectedInstanceByMotif({});
    setZoomed(false);
    setCalculationDone(false);
    setShowFilterControls(false);
    setFilterApplied(false);

    try {
      const formData = new FormData();
      formData.append("stored_filename", savedGraphFilename);
      formData.append("k", Number(knumber));

      const res = await fetch(`${API_BASE}/motif/extract_saved`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        let errText = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          errText = errJson.error || JSON.stringify(errJson);
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      const parsed = parseMotifs(data, API_BASE);
      setAllMotifs(parsed);
      setMotifs(parsed);
    } catch (err) {
      console.error("Error fetching motif data:", err);
      setError(err.message || "Error fetching motif data");
    } finally {
      setLoading(false);
      setCalculationDone(true);
    }
  };

  const handleFilter = async () => {
    setError(null);
    if (!calculationDone) return;

    setFilterLoading(true);
    try {
      const minN = clampMin(Number(minOccurrences));
      const filtered = allMotifs.filter((m) => m.occurrences >= minN);
      setMotifs(filtered);
      setFilterApplied(true);
    } catch (err) {
      console.error("Error applying filter:", err);
      setError(err.message || "Error applying filter");
    } finally {
      setFilterLoading(false);
    }
  };

  const handleRemoveFilter = () => {
    setMotifs(allMotifs);
    setFilterApplied(false);
  };

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      color="white"
      backdropFilter="blur(18px)"
    >
      <Box p="4" pb="1" pt="1" borderBottom="1px solid rgba(255,255,255,0.08)">
        <Heading size="md" mb="3" fontWeight="600" letterSpacing="-0.02em">
          Pattern Explorer
        </Heading>

        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.400">
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
            onClick={() => setKnumber((n) => clampK(n - 1))}
          />

          <Input
            type="number"
            value={knumber}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setKnumber(v);
            }}
            onBlur={() => setKnumber((n) => clampK(Number(n)))}
            fontSize="xl"
            fontWeight="600"
            minW="40px"
            textAlign="center"
            bg="transparent"
            variant="unstyled"
            p={0}
            _focus={{ boxShadow: "none" }}
            aria-label="k value"
          />

          <IconButton
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={() => setKnumber((n) => clampK(n + 1))}
          />
        </HStack>

        <VStack spacing="3" mb="3">
          <Button
            size="sm"
            fontSize="sm"
            px="3"
            w="100%"
            onClick={handleCalculate}
            isLoading={loading}
            isDisabled={loading || !savedGraphFilename}
            fontWeight="600"
            color="white"
            borderRadius="xl"
            bg="rgba(26, 144, 248, 0.73)"         
            backdropFilter="blur(10px)"
            border="1px solid rgba(255,255,255,0.22)"
            boxShadow="0 4px 14px rgba(0,0,0,0.18)"
            transition="all 0.2s ease"
            _hover={{
              bg: "rgba(51,153,242,0.7)",
            }}
            _active={{
              bg: "rgba(51,153,242,0.55)",
            }}
            _disabled={{
              opacity: 0.45,
              cursor: "not-allowed",
            }}
          >
            Calculate
          </Button>

          <Box
            mt="2"
            display="flex"
            justifyContent="center"
            onClick={() => setShowFilterControls((prev) => !prev)}
            cursor="pointer"
          >
            <Box
              w="44px"
              h="5px"
              borderRadius="full"
              bg="whiteAlpha.400"
            />
          </Box>

          <Collapse in={showFilterControls} animateOpacity>
            <VStack mt="3" spacing="2">
              <HStack w="100%" spacing="3">
                <Text fontSize="xs" color="gray.300">Min occurrences</Text>
                <Input
                  type="number"
                  value={minOccurrences}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setMinOccurrences(v);
                  }}
                  onBlur={() => setMinOccurrences((n) => clampMin(Number(n)))}
                  fontSize="md"
                  fontWeight="600"
                  minW="80px"
                  textAlign="center"
                  bg="transparent"
                  variant="unstyled"
                  p={0}
                  _focus={{ boxShadow: "none" }}
                  aria-label="min occurrences"
                />
              </HStack>
              
              <HStack w="100%" spacing="3">
                <Button
                  size="sm"
                  fontSize="sm"
                  px="3"
                  flex="1"
                  onClick={handleFilter}
                  isLoading={filterLoading}
                  isDisabled={filterLoading || loading || !calculationDone || allMotifs.length === 0}
                  fontWeight="600"
                  color="white"
                  borderRadius="xl"
                  bg="rgba(26, 144, 248, 0.73)"         
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.22)"
                  boxShadow="0 4px 14px rgba(0,0,0,0.18)"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "rgba(51,153,242,0.7)",
                  }}
                  _active={{
                    bg: "rgba(51,153,242,0.55)",
                  }}
                >
                  Filter
                </Button>

                <Button
                  size="sm"
                  fontSize="sm"
                  px="3"
                  flex="1"
                  onClick={handleRemoveFilter}
                  isDisabled={!filterApplied}
                  fontWeight="600"
                  color="white"
                  borderRadius="xl"
                  bg="rgba(220, 53, 69, 0.75)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.22)"
                  boxShadow="0 4px 14px rgba(0,0,0,0.18)"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "rgba(220, 53, 69, 0.9)",
                  }}
                  _active={{
                    bg: "rgba(220, 53, 69, 0.6)",
                  }}
                >
                  Remove
                </Button>
              </HStack>
            </VStack>
          </Collapse>
        </VStack>
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
        tabIndex={0}
        onKeyDown={(e) => {
          if (!selectedMotif) return;
          let idx = selectedInstanceByMotif[selectedMotif.id] ?? 0;
          if (e.key === "ArrowLeft") {
            idx = Math.max(0, idx - 1);
          } else if (e.key === "ArrowRight") {
            idx = Math.min(selectedMotif.instances.length - 1, idx + 1);
          } else return;
          setSelectedInstanceByMotif((prev) => ({
            ...prev,
            [selectedMotif.id]: idx
          }));
          const instanceNodes = selectedMotif.instances[idx].nodes;
          controller.highlightNodes(instanceNodes);
          controller.zoomOnNodes(instanceNodes);
        }}
      >
        {loading && (
          <HStack spacing="3">
            <Spinner size="sm" />
            <Text fontSize="sm">Calculating patterns…</Text>
          </HStack>
        )}

        {error && (
          <Text color="red.300" fontSize="sm">
            {error}
          </Text>
        )}

        {!loading && !error && !savedGraphFilename && (
          <Box
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            color="whiteAlpha.700"
            py="10"
          >
            <VStack spacing="3">
              <Text fontSize="sm" fontWeight="500">
                Before load file
              </Text>
              <Text fontSize="xs">
                Upload a graph file from the Input panel to start.
              </Text>
            </VStack>
          </Box>
        )}

        {!loading && !error && savedGraphFilename && calculationDone && motifs.length === 0 && (
          <Box
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            color="whiteAlpha.700"
            py="10"
          >
            <VStack spacing="3">
              <Text fontSize="sm" fontWeight="500">
                No patterns found
              </Text>
              <Text fontSize="xs">
                Try changing the parameters (e.g. <b>k</b> or graph type)
              </Text>
            </VStack>
          </Box>
        )}

        {!loading && !error && motifs.length > 0 && (
          <VStack spacing="6" align="stretch">
            {motifs.map((motif) => {
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
                    setSelectedMotif(motif);
                    setZoomed(true);
                    setShowFilterControls(true);
                    if (!(motif.id in selectedInstanceByMotif)) {
                      const allNodes = motif.instances.flatMap((i) => i.nodes);
                      controller.highlightNodes(allNodes);
                      controller.zoomOnNodes(allNodes);
                      setSelectedInstanceByMotif((prev) => ({
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
                        onChange={(idx) => {
                          setSelectedInstanceByMotif((prev) => ({
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
