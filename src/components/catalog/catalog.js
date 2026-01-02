/* Catalog Component
  This component displays a catalog of documents with filtering options,
  a document list, and a detail panel. It also includes a small bubble map preview.
*/  

import React, { useState, useMemo } from "react";
import {Flex, Box} from "@chakra-ui/react";
import InfoPanel from "./InfoPanel";
import TopbarSearch from "./TopbarSearch";
import DocumentList from "./DocumentList";
import SidebarH from "./SideBarHome/SidebarH";
import Img1 from "./21.T11961_07cf7367-4e0a-427b-8d79-1c24be59e663.json"; 


//data for testing the UI
const SAMPLE_FILES = [
  {
    id: "21.T11961/a932e8d9-bb05-4398-b81f-30ec8054a8e0",
    score: null,
    version: 2,
    owner_email: "user@example.com",
    storage_url: {Img1},
    parent_document_pid: "21.T11961/65e63e7c-76ee-4799-b772-4e10a49dab02",
    description: "Research on unifying urban data sources to enhance city management and decision-making.",
    author: null,
    date: "2025-11-14T14:24:57.805476",
    name: "Smart City Data Integration 2024",
    preview: null,
    metrics: { nodes: 0, activity: 0 },
    Provistance: "0- //http://192.168.1.162:8000-",
    linked_files: 1,
    linked_documents: ["21.T11961/65e63e7c-76ee-4799-b772-4e10a49dab02"]
  },
  {
    id: "21.T11961/f1ec6ed4-9491-4512-9ab8-6678c11db239",
    score: null,
    version: 1,
    owner_email: "user@example.com",
    storage_url: {Img1},
    description: "",
    author: null,
    date: "2025-11-14T14:24:57.805476",
    name: "Carbon Footprint Analysis 2024",
    preview: null,
    metrics: { nodes: 0, activity: 0 },
    Provistance: "0- //http://192.168.1.162:8000-",
    linked_files: 0,
    linked_documents: []
  },
  {
    id: "21.T11961/9d96b1fd-2433-4abc-9e75-2d09247936f4",
    score: null,
    version: 1,
    owner_email: "user@example.com",
    storage_url: {Img1},
    parent_document_pid: null,
    description: "",
    author: null,
    date: "2025-11-14T14:24:57.805476",
    name: "Renewable Energy Transition Impact on Regional Climate Patterns",
    preview: null,
    metrics: { nodes: 0, activity: 0 },
    Provistance: "0- //http://192.168.1.162:8000-",
    linked_files: 0,
    linked_documents: []
  },
  {
    id: "21.T11961/98ff4c0c-2354-4128-b2f1-866efb7a0f37",
    score: null,
    version: 1,
    owner_email: "user@example.com",
    storage_url: {Img1},
    parent_document_pid: null,
    description: "Real time monitoring system for coastal sea level changes using distributed IoT sensors and tidal gauge networks This experimental tracks millimeter level changes in sea surface height and correlates them with local weather patterns ocean temperature and ice sheet melting rates The system provides early warning capabilities for coastal communities and supports climate adaptation planning through predictive modeling",
    author: null,
    date: "2025-11-14T14:24:57.805476",
    name: "Sea Level Rise Monitoring System Using IoT Sensors",
    preview: null,
    metrics: { nodes: 0, activity: 0 },
    Provistance: "0- //http://192.168.1.162:8000-",
    linked_files: 0,
    linked_documents: []
  },
  {
    id: "21.T11961/1e572bf1-0f89-46ca-a733-2d4311b14a53",
    score: null,
    version: 1,
    owner_email: "user@example.com",
    storage_url: {Img1},
    parent_document_pid: null,
    description: "Comprehensive study analyzing the increasing frequency and intensity of extreme weather events including hurricanes droughts floods and heatwaves This experiment combines meteorological data from the past 40 years with climate models to identify patterns and predict future extreme weather occurrences The research incorporates statistical analysis and machine learning to assess the correlation between rising global temperatures and severe weather phenomena",
    author: "Luca Bianchi",
    date: "2025-11-14T14:24:57.805476",
    name: "Extreme Weather Events Frequency Analysis and Prediction",
    preview: null,
    metrics: { nodes: 0, activity: 0 },
    Provistance: "0- //http://192.168.1.162:8000-",
    linked_files: 0,
    linked_documents: []
  }
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

    //specific filters
    if (author && !file.author?.toLowerCase().includes(author.toLowerCase())) return false;
    if (pid && !file.pid?.toLowerCase().includes(pid.toLowerCase())) return false;
    if (type && !file.type?.toLowerCase().includes(type.toLowerCase())) return false;

    // general query filter
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
            flex={selectedFile ? 2 : 1} 
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
            minW={0} 
          >
            <DocumentList
              files={filteredFiles}
              columns={5}
              onSelect={handleSelect}
              onOpen={handleOpen}
              initialSelectedId={selectedId}
              panelOpen={!!selectedFile} 
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
