/* Catalog Component
  This component displays a catalog of documents with filtering options,
  a document list, and a detail panel. It also includes a small bubble map preview.
*/  

import React, { useState, useMemo } from "react";
import {Flex, Box} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import InfoPanel from "./InfoPanel";
import Filter from "./Filter";
import DocumentList from "./DocumentList";
import Img from "./img.png";
import TopBar from "../layout/TopBar"
import SidebarH from "./SideBarHome/SidebarH";
import BubbleMap from "./Map/BubbleMap";
import { sampleData } from "./Map/MapPage";

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

  const navigate = useNavigate();

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
  const [filters, setFilters] = useState({ author: "", dateFrom: null, dateTo: null, node: "" });

  const handleApplyFilters = (f) => setFilters(f);
  const handleSelect = (id) => setSelectedId(id);
  
  //update the selected file
  const handleOpen = (id) => {
    console.log("Open file", id);
    setSelectedId(id);
  };

  //filtering logic execution for performance
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
    <Flex direction="column" h="100vh" w="100vw" bg="black" overflowY="hidden" >
      {/* top navigation bar */}
      <TopBar />
      <Flex flex="1" position="relative" minWidth={0} minH={0}>
        {/* left sidebar */}
        <SidebarH onOpenPanel={onOpenPanel} />
        <Flex flex="1" direction="column" minWidth={0} minH={0}>
          <Filter onApplyFilters={handleApplyFilters} />
          <Flex flex="1" position="relative"  minH={0} px={0} pt={2} pb={0} >
            {/*left column: document list */}
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
              mb = {0}
            >
              <DocumentList
                files={filteredFiles}
                columns={5} 
                onSelect={handleSelect}
                onOpen={handleOpen}
                initialSelectedId={selectedId}
              />
            </Box>

            {/* right column: file details and map */}
            <Flex
              overflowY="hidden" 
              display="flex" 
              flexDirection="column" 
              pr = "1.5"
            >
              <Box
                flex="3" 
                width="450px" 
                overflowY="auto" 
              >
                <InfoPanel file={selectedFile} onClose={() => setSelectedId(null)} />
              </Box>

              <Flex p = "1" justify="center" >
              <Flex  
                borderRadius="md" 
                boxShadow="md" 
                w = "400px"
                h= "170px" 
                p = "2"
                onClick={() => navigate("/map")} 
              >
                <BubbleMap data={sampleData} variant="small"/>
              </Flex>
              </Flex>     
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
