import React, { useState, useEffect } from "react";
import { Flex, Box, Spinner, Text } from "@chakra-ui/react";

import TopbarSearch from "./TopbarSearch";
import DocumentList from "./DocumentList";
import InfoPanel from "./InfoPanel";
import SidebarH from "./SideBarHome/SidebarH";

import { getCatalog } from "./Connection/FilterConnection";

export default function Catalog() {
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sidebar
  const [activePanel, setActivePanel] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const onOpenPanel = (panel) => {
    if (panel === activePanel && isSidePanelOpen) {
      setIsSidePanelOpen(false);
      setActivePanel(null);
      return;
    }
    setActivePanel(panel);
    setIsSidePanelOpen(true);
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCatalog(query); 
        setFiles(response);
        setSelectedId(response[0]?.id ?? null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Errore nel caricamento dei documenti");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const selectedFile = files.find((f) => f.id === selectedId);

  return (
    <Flex direction="column" h="100vh" w="100vw" bg="black" overflow="hidden">
      <TopbarSearch onSearch={handleSearch} />

      <Flex flex="1" minH={0} minW={0} overflow="hidden">
        <SidebarH onOpenPanel={onOpenPanel} />

        <Flex flex="1" minH={0} minW={0} overflow="hidden">
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

          {selectedFile && (
            <Box flex="1" maxW="450px" overflowY="auto" transition="all 0.3s ease-in-out">
              <InfoPanel file={selectedFile} onClose={() => setSelectedId(null)} />
            </Box>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
