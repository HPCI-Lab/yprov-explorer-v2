import React, { useState, useMemo } from "react";
import {Flex, Box} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import Filter from "./Filter";
import DocumentList from "./DocumentList";
import Img from "./img.png";
import TopBar from "../layout/TopBar"
import SidebarR from "../layout/sidebar/Sidebar";
import BubbleMap from "./Map/BubbleMap";
import { sampleData } from "./Map/MapPage";

const SAMPLE_FILES = [ 
  {
    id: "21. T11961/9d96blfd-2433-4abc-9e75-2d09247936f4",
    score: "7.757325",
    version: "1",
    owner_email: "user@example.com",
    storage_uri: "http://127.0.0.1:8080/documents/21.T11961/996b1fd-2433-4abc-9e75-2d092479364/download",
    parent_document_pid: null,
    description: "At this stage, I would focus on expanding my knowledge in two areas: motor development and the game itself. I can achieve this by reading books and articles, attending courses, and engaging in dialogue with more experienced colleagues. In short, I aim to enhance the quality of my feedback by broadening my knowledge base. Having identified my areas for improvement and outlined several strategies for development, it is now time to put myself to the test and work toward these goals.",
    author: null,
    date: "2024-06-19T07:21:14.000Z",
    name: "example_file.json",
    preview: Img,
    metrics: { nodes: 825, activity: 800 },
    Provistance: "825- //172.162.13167-800-",
  },
  {
    id: "sample-1",
    name: "network_sample_1.json",
    author: "Mario Rossi",
    pid: "012345679",
    preview: Img,
    metrics: { nodes: 312, activity: 120 },
    type: "activity",
  },
  {
    id: "sample-2",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-3",
    name: "network_sample_provalarrreeeeeerrrrrrrrrrrghezza_2.json",
    author: "Evelin",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-4",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-5",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-6",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  }, {
    id: "sample-7",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
  },
  {
    id: "sample-8",
    name: "network_sample_2.json",
    author: "Mario Rossi",
    pid: "012345680",
    preview: Img,
    metrics: { nodes: 128, activity: 60 },
    type: "entity",
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

  const navigate = useNavigate()

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

  const [files] = useState(SAMPLE_FILES);
  const [selectedId, setSelectedId] = useState(files[0]?.id ?? null);
  const [filters, setFilters] = useState({ author: "", dateFrom: null, dateTo: null, node: "" });

  const handleApplyFilters = (f) => setFilters(f);
  const handleSelect = (id) => setSelectedId(id);
  const handleOpen = (id) => {
    console.log("Open file", id);
    setSelectedId(id);
  };

  const filteredFiles = useMemo(() => {
    const qAuthor = (filters.author || "").trim().toLowerCase();
    const node = filters.node || "";
    return files.filter((file) => {
      if (qAuthor && !(file.author?.toLowerCase().includes(qAuthor))) return false;
      if (node && node !== "" && file.type !== node) return false;
      return true;
    });
  }, [files, filters]);

  const selectedFile = files.find((f) => f.id === selectedId) || null;

  return (
    <Flex direction="column" h="100vh" w="100vw" bg="black" overflowY="hidden">
      <TopBar />
      <Flex flex="1" position="relative" minWidth={0} minH={0}>
        <SidebarR onOpenPanel={onOpenPanel} />
        <Flex flex="1" direction="column" minWidth={0} minH={0}>
          <Filter onApplyFilters={handleApplyFilters} />
          <Flex flex="1" position="relative" minWidth={0} p="1" minH={0}>
            {/*left column: document list and detail panel */}
            <Box
              flex="1" 
              borderRadius="xl" 
              position="relative" 
              overflowY="hidden" 
              bg="gray.700" 
              borderRight="5px solid black" 
              color="white" 
              display="flex" 
              justifyContent="space-between" 
              alignItems="stretch" 
              p="4" 
              borderLeft="5px solid black"
            >
              <DocumentList
                files={filteredFiles}
                columns={5} 
                onSelect={handleSelect}
                onOpen={handleOpen}
                initialSelectedId={selectedId}
              />
            </Box>

              <Box
                overflowY="hidden" 
                display="flex" 
                flexDirection="column" 
                minH={0} 
                alignItems="stretch"
              >
                <Box
                  Box flex="3" 
                  width="450px" 
                  minWidth="450px" 
                  maxWidth="450px" 
                  overflowY="auto" 
                  borderRight="1px solid black" 
                  p= "1"
                >
                  <Sidebar file={selectedFile} onClose={() => setSelectedId(null)} />
                </Box>
              

            <Box
              flex="1"
              minW={0}
              borderRadius="xl"
              overflow="hidden"
              bg="gray.900"
              borderLeft={{ base: "none", md: "5px solid black" }}
              borderRight="5px solid black"
              p="0"
              display="flex"
              flexDirection="column"
            >
      
              <Flex 
                flex = "1" 
                bg="white" 
                borderRadius="md" 
                boxShadow="md" 
                overflow="hidden" 
                position="relative" 
                onClick={() => navigate("/map")} 
              >
                <Box position="absolute" inset="0">
                  <BubbleMap data={sampleData}/>
                </Box>
              </Flex>
              </Box>
            
            </Box>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
  );
}
