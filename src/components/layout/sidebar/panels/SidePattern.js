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
  Input,
  Button
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

export default function SidePattern() {
  const [motifs, setMotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [knumber, setKnumber] = useState(3);
  const [minOccurrences, setMinOccurrences] = useState(1);

  const [selectedMotif, setSelectedMotif] = useState(null);
  const [selectedInstanceByMotif, setSelectedInstanceByMotif] = useState({});
  const [zoomed, setZoomed] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [lastCalcKey, setLastCalcKey] = useState(null);
  const [cleaning, setCleaning] = useState(false); // stato pulizia

  const API_BASE = process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8000";

  // quando si sceglie un file: non calcoliamo subito, solo memorizziamo
  const handleFileChange = (file) => {
    setError(null);
    setMotifs([]);
    setSelectedMotif(null);
    setSelectedInstanceByMotif({});
    setZoomed(false);
    setUploadedFile(file || null);
    // resettiamo lastCalcKey così Calculate sarà disponibile anche se lo stesso nome file
    setLastCalcKey(null);
  };

  // Remove / reset + chiamata al backend per pulire file
  const handleRemove = async () => {
    // disabilita bottoni
    setCleaning(true);
    setError(null);

    try {
      // chiamiamo endpoint di cleanup sul backend
      const res = await fetch(`${API_BASE}/motif/cleanup`, {
        method: "DELETE"
      });

      if (!res.ok) {
        let errText = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          errText = errJson.error || JSON.stringify(errJson);
        } catch (_) {}
        throw new Error(errText);
      }

      // risposta ok -> reset frontend state
      setUploadedFile(null);
      setMotifs([]);
      setSelectedMotif(null);
      setSelectedInstanceByMotif({});
      setZoomed(false);
      setLastCalcKey(null);
    } catch (err) {
      console.error("Cleanup failed:", err);
      setError(err.message || "Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  // Calcola / debounce / previeni doppio click identico
  const handleCalculate = () => {
    if (!uploadedFile || loading || cleaning) return;

    const calcKey = `${uploadedFile.name}_${knumber}_${minOccurrences}`;
    if (calcKey === lastCalcKey) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setMotifs([]);
      setSelectedMotif(null);
      setSelectedInstanceByMotif({});
      setZoomed(false);

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("k", knumber);
      formData.append("min_occurrences", minOccurrences);

      try {
        const res = await fetch(`${API_BASE}/motif/extract`, {
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
        setMotifs(parseMotifs(data, API_BASE));
        setLastCalcKey(calcKey);
      } catch (err) {
        console.error("Error fetching motif data:", err);
        setError(err.message || "Error fetching motif data");
      } finally {
        setLoading(false);
      }
    }, 350);

    setDebounceTimer(timer);
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

        <Input
          type="file"
          accept=".json"
          mb="3"
          onChange={(e) => handleFileChange(e.target.files && e.target.files[0])}
          bg="rgba(255,255,255,0.06)"
        />

        <HStack spacing="3" mb="3">
          <Button
            size="sm"
            fontSize="sm"
            px="3"
            onClick={handleCalculate}
            isLoading={loading}
            isDisabled={loading || !uploadedFile || cleaning}
            colorScheme="teal"
            fontWeight="600"
          >
            Calculate
          </Button>

          <Button
            size="sm"
            fontSize="sm"
            px="3"
            onClick={handleRemove}
            variant="ghost"
            colorScheme="red"
            isDisabled={loading || cleaning}
          >
            Remove
          </Button>

          {uploadedFile && (
            <Text fontSize="sm" color="gray.300" ml="2">
              {uploadedFile.name}
            </Text>
          )}
        </HStack>

        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.400">
          Pattern size (k)
        </Text>

        <HStack justify="center" spacing="4" m="3">
          <IconButton
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={() => setKnumber((n) => Math.max(2, n - 1))}
          />
          <Text fontSize="xl" fontWeight="600" minW="40px" textAlign="center">
            {knumber}
          </Text>
          <IconButton
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            borderRadius="full"
            bg="rgba(255,255,255,0.06)"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={() => setKnumber((n) => n + 1)}
          />
        </HStack>

        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.400">
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
            onClick={() => setMinOccurrences((n) => Math.max(1, n - 1))}
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
            onClick={() => setMinOccurrences((n) => n + 1)}
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
            <Text fontSize="sm">Calculating patterns…</Text>
          </HStack>
        )}

        {error && (
          <Text color="red.300" fontSize="sm">
            {error}
          </Text>
        )}

        {!loading && !error && (
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
                    if (!isSelected) {
                      setSelectedMotif(motif);
                      setZoomed(true);
                    }

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
