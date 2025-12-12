/* Catalog Component
  This component displays a catalog of documents with filtering options,
  a document list, and a detail panel. It also includes a small bubble map preview.
*/  

import React, { useState, useMemo } from "react";
import {Flex, Box} from "@chakra-ui/react";
import InfoPanel from "./InfoPanel";
import TopbarSearch from "./TopbarSearch";
import DocumentList from "./DocumentList";
import Img from "./img.png";
import SidebarH from "./SideBarHome/SidebarH";

//data for testing the UI
const SAMPLE_FILES = [ 
  {
    id: "21. T11961/9d96blfd-2433-4abc-9e75-2d09247936f4",
    score: "7.757325",
    version: "1",
    owner_email: "user@example.com",
    storage_url: "http://yprov.disi.unitn.it:8000/documents/21.T11961/760d7a89-3eb9-4b82-ac91-85ff93783cf1/download",
    parent_document_pid: null,
    description: "At this stage, I would focus on expanding my knowledge in two areas: motor development and the game itself. I can achieve this by reading books and articles, attending courses, and engaging in dialogue with more experienced colleagues. In short, I aim to enhance the quality of my feedback by broadening my knowledge base. Having identified my areas for improvement and outlined several strategies for development, it is now time to put myself to the test and work toward these goals.",
    author: null,
    date: "2024-06-19T07:21:14.000Z",
    name: "example_file.json",
    preview: Img,
    metrics: { nodes: 825, activity: 800 },
    Provistance: "825- //172.162.13167-800-",
    linked_files: 3,
    linked_documents: [
      "19. T11961/3e2f4b7c-5f4d-4f6a-8f4e-1c2d3e4f5g6h",
      "20. T11961/4f5g6h7i-8j9k-0l1m-2n3o-4p5q6r7s8t9u",
      "22. T11961/5g6h7i8j-9k0l-1m2n-3o4p-5q6r7s8t9u0v"
    ],
  },
  {
    id: "sample-1",
    name: "network_sample_1.json",
    author: "Mario Rossi",
    pid: "012345679",
    preview: Img,
    metrics: { nodes: 312, activity: 120 },
    type: "activity",
    linked_files: 0,
  },
  {
    id: "sample-2",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 1,
    linked_documents: [
      "18. T11961/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
    ],  
  },
  {
    id: "sample-3",
    name: "network_sample_provalarrreeeeeerrrrrrrrrrrghezza_2.json",
    author: "Evelin",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 2,
  },
  {
    id: "sample-4",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 0,
  },
  {
    id: "sample-5",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 0,
  },
  {
    id: "sample-6",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 0,
    linked_documents: [],
  }, {
    id: "sample-7",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 0,
  },
  {
    id: "sample-8",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
    linked_files: 4,
    linked_documents: [
      "23. T11961/6h7i8j9k-0l1m-2n3o-4p5q-6r7s8t9u0v1w",
      "24. T11961/7i8j9k0l-1m2n-3o4p-5q6r-7s8t9u0v1w2x",
      "25. T11961/8j9k0l1m-2n3o-4p5q-6r7s-8t9u0v1w2x3y",
      "26. T11961/9k0l1m2n-3o4p-5q6r-7s8t-9u0v1w2x3y4z"
    ],
  }, {

    id: "sample-9",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-10",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, {
    id: "sample-11",
    name: "network_sample_2.json",
    author: "Evelin",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-12",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, {
    id: "sample-13",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-14",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, 
  {
    id: "sample-15",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, 
  {
    id: "sample-16",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, 
];

export default function Catalog() {

  //State for sidebar activation
  const [activePanel, setActivePanel] = useState(null);
  //State for closing the sidebar
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  //Function for opening the sidebar panel
  const onOpenPanel = (panel) => {
    if (panel === activePanel && isSidePanelOpen) {
      onClosePanel(true);
      return;
    }
    setActivePanel(panel);
    setIsSidePanelOpen(true);
  };

  //Function for closing the sidebar panel
  const onClosePanel = () => {
    setIsSidePanelOpen(false);
    setActivePanel(null);
  };

  //file list state
  const [files] = useState(SAMPLE_FILES);
  const [selectedId, setSelectedId] = useState(files[0]?.id ?? null);
  const [filters, setFilters] = useState({
    query: "",
    yearRange: [2020, new Date().getFullYear()]
  });

  const handleSelect = (id) => setSelectedId(id);

  // Callback timeline
  const handleTimeline = (range) => {
    if (Array.isArray(range)) {
    setFilters(prev => ({
      ...prev,
      yearRange: range
    }));
  }
  };
  
  //update the selected file
  const handleOpen = (id) => {
    console.log("Open file", id);
    setSelectedId(id);
  };

  // Callback searchbar
  const handleSearch = (searchFilters) => {
    setFilters(prev => ({
      ...prev,
      ...searchFilters
    }));
  };

  // Memoized filtered files based on current filters
  const filteredFiles = useMemo(() => {
  if (!files) return [];

  const { query, yearRange, author, pid, type } = filters;
  const q = (query || "").trim().toLowerCase();
  const [yearMin, yearMax] = yearRange;

  return files.filter(file => {
    const fileDate = new Date(file.date || file.created_at);
    const fileYear = fileDate.getFullYear();

    // timeline filter
    if (fileYear < yearMin || fileYear > yearMax) return false;

    // filtri specifici
    if (author && !file.author?.toLowerCase().includes(author.toLowerCase())) return false;
    if (pid && !file.pid?.toLowerCase().includes(pid.toLowerCase())) return false;
    if (type && !file.type?.toLowerCase().includes(type.toLowerCase())) return false;

    // ricerca generica se non ci sono filtri specifici
    if (!author && !pid && !type && q) {
      const haystack = [
        file.name || "",
        file.author || "",
        file.pid || "",
        file.type || "",
        file.description || "",
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}, [files, filters]);

  
  const selectedFile = files.find((f) => f.id === selectedId);

  return (
    <Flex direction="column" h="100vh" w="100vw" bg="black" overflow="hidden">
      <TopbarSearch onSearch={handleSearch} onTime={handleTimeline} />
      <Flex flex="1" minH={0} minW={0} overflow="hidden">
        {/* left sidebar */}
        <SidebarH onOpenPanel={onOpenPanel} />

        {/* main content */}
        <Flex flex="1" minH={0} minW={0} overflow="hidden">
          
          {/* document list */}
          <Box
            flex={selectedFile ? 2 : 1} // più piccolo se InfoPanel aperto
            borderRadius="xl"
            overflow="hidden"
            bg="gray.700"
            borderLeft="5px solid black"
            borderRight="5px solid black"
            color="white"
            display="flex"
            flexDirection="column"
            transition="all 0.3s ease-in-out"
            p={4}
            minW={0} // evita overflow orizzontale
          >
            <DocumentList
              files={filteredFiles}
              columns={5}
              onSelect={handleSelect}
              onOpen={handleOpen}
              initialSelectedId={selectedId}
              panelOpen={!!selectedFile} // prop per adattarsi
            />
          </Box>

          {/* InfoPanel */}
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
                onFilter={(linked) => setFilters(prev => ({ ...prev, linkedFiles: linked }))}
              />
            </Box>
          )}
          
        </Flex>
      </Flex>
    </Flex>
  );
}
