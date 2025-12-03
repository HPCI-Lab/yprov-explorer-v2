import React from "react";
import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BubbleMap from "./Map/BubbleMap";
import { sampleData } from "./Map/MapPage";

const MapView = () => {
   const navigate = useNavigate();
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      overflow="hidden"
      position="relative"
      onClick={() => navigate("/map")} 
      _hover={{ borderColor: "blue.400" }}
    >
     <BubbleMap data={sampleData} />
    </Box>
  );
};

export default MapView;
