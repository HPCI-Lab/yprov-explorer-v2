import React, { useState } from "react";
import { Box, Grid, GridItem, Button } from "@chakra-ui/react";
import BubbleMap from "./BubbleMap";
import { useNavigate } from "react-router-dom";
import ZoomableCirclePacking from "./ZoomableCirclePacking";

export const sampleData = [
  {
    id: "africa",
    name: "Africa",
    value: 20,
    lat: -35,
    lon: 21,
    color: "#e53e3e",
    children: [
      { name: "A", value: 10 },
      { name: "B", value: 5 },
      { name: "C", value: 20 },
    ],
  },
  {
    id: "europa",
    name: "Europa",
    value: 70,
    lat: 48.85,
    lon: 2.35,
    color: "#3182ce",
    children: [
      { name: "A", value: 70 },
      { name: "B", value: 80 },
      { name: "C", value: 80 },
      { name: "D", value: 80 },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    value: 30,
    lat: 30.5,
    lon: 100,
    color: "#38a169",
    children: [
      { name: "A", value: 10 },
      { name: "B", value: 5 },
    ],
  },
];

const MapPage = () => {
  const [selectedBubble, setSelectedBubble] = useState(null);

  const navigate = useNavigate();

  const handleBubbleClick = (bubble) => {
    const scaleFactor = 3;
    const size = Math.max(80, bubble.r * 2 * scaleFactor); 
    setSelectedBubble({
      ...bubble,
      size,
    });
  };

  const closePacking = () => setSelectedBubble(null);

  return (
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
      <Grid>
        <GridItem position="absolute"  >
          <Button
            color="black"
            bg="gray.300"
            borderRadius="20px"
            px={6}
            size="md"
            onClick={() => navigate("/")}
          >
            BACK TO HOME
          </Button>
        </GridItem>

        <GridItem position="center">
          <Box
            bg="white"
            w= "1200px"
            borderRadius="md"
            boxShadow="md"
            overflow="hidden"
            position="relative"
            onClick={() => navigate("/map")} 
            _hover={{ borderColor: "blue.400" }}
          >
            <BubbleMap data={sampleData} onBubbleClick={handleBubbleClick} size="large"  />
          </Box>
          
          {selectedBubble && (
            <Box
              position="absolute"
              left={`${selectedBubble.cx - selectedBubble.size / 2}px`}
              top={`${selectedBubble.cy - selectedBubble.size / 2}px`}
              width={`${selectedBubble.size}px`}
              height={`${selectedBubble.size}px`}
              zIndex={30}
              pointerEvents="auto"
              sx={{
                transformOrigin: "center center",
                animation: "scaleIn 220ms ease",
              }}
            >
              <ZoomableCirclePacking
                data={{ name: selectedBubble.name, children: selectedBubble.children || [] }}
                width={selectedBubble.size}
                height={selectedBubble.size}
                onClose={closePacking}
                parentColor={selectedBubble.color}
                pointerEvents="auto"
              />
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default MapPage;
