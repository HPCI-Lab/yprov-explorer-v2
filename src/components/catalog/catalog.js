/*        
Catalog component displaying document list and info panel with filtering 
*/  

import React, { useState, useEffect } from "react";
import { Flex, Box, Spinner, Text } from "@chakra-ui/react";

import TopbarSearch from "./TopbarSearch";
import DocumentList from "./DocumentList";
import InfoPanel from "./InfoPanel";
import SidebarH from "./SideBarHome/SidebarH";

import { getCatalog } from "./Connection/FilterConnection";

export default function Catalog() {
  // Sidebar
  const [activePanel, setActivePanel] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Data
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    query: "",
    yearRange: [2020, new Date().getFullYear()],
  });

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sidebar handlers
  const onOpenPanel = (panel) => {
    if (panel === activePanel && isSidePanelOpen) {
      onClosePanel();
      return;
    }
    setActivePanel(panel);
    setIsSidePanelOpen(true);
  };

  const onClosePanel = () => {
    setIsSidePanelOpen(false);
    setActivePanel(null);
  };

  // Search handlers
  const handleSearch = (searchFilters) => {
    setFilters((prev) => ({ ...prev, ...searchFilters }));
  };

  const handleTimeline = (range) => {
    if (Array.isArray(range)) {
      setFilters((prev) => ({ ...prev, yearRange: range }));
    }
  };

  // 🔹 Fetch catalog ONLY when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCatalog(filters);
        setFiles(response);

        // Auto-select first document
        setSelectedId(response[0]?.id ?? null);
      } catch (err) {
        console.error("Error call service", err);

        try {
          const errorDetails = JSON.parse(err.message);
          setError(errorDetails.detail || "An unknown error occurred.");
        } catch {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); 

  const selectedFile = files.find((f) => f.id === selectedId);

  return (
    <Flex direction="column" h="100vh" w="100vw" bg="black" overflow="hidden">
      <TopbarSearch onSearch={handleSearch} onTime={handleTimeline} />

      <Flex flex="1" minH={0} minW={0} overflow="hidden">
        {/* Sidebar */}
        <SidebarH onOpenPanel={onOpenPanel} />

        {/* Main content */}
        <Flex flex="1" minH={0} minW={0} overflow="hidden">
          {/* Document list */}
          <Box
            flex={selectedFile ? 2 : 1}
            borderRadius="xl"
            overflow="hidden"
            bg="gray.700"
            borderLeft="5px solid black"
            borderRight="5px solid black"
            color="white"
            display="flex"
            flexDirection="column"
            p={4}
            minW={0}
          >
            {loading && (
              <Flex flex="1" align="center" justify="center">
                <Spinner size="xl" />
              </Flex>
            )}

            {error && (
              <Flex flex="1" align="center" justify="center">
                <Text color="red.300">{error}</Text>
              </Flex>
            )}

            {!loading && !error && (
              <DocumentList
                files={files}
                columns={4}
                selectedId={selectedId}
                onSelect={setSelectedId}
                panelOpen={!!selectedFile}
              />
            )}
          </Box>

          {/* Info panel */}
          {selectedFile && (
            <Box
              flex="1"
              maxW="450px"
              overflowY="auto"
              transition="all 0.3s ease-in-out"
            >
              <InfoPanel
                file={selectedFile}
                onClose={() => setSelectedId(null)}
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
