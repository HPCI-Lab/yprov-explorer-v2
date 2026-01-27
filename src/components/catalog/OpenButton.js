/* open-button component to fetch a JSON file and set graph data */

import React from "react";
import { Flex, Button, } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


const OpenButton = ({fileUrl, setGraphData}) => {

    const navigate = useNavigate();
const handleOpen = async () => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Errore nel caricamento del JSON");
      }

      const jsonData = await response.json();
      
      setGraphData(jsonData);

      navigate("/");
    } catch (error) {
      console.error(error);
    }
    };  

  return (
    <Flex  justify="center" p = "4">
        <Button
            colorScheme="blue"
            size="sm"
            
            borderRadius="full"
            w="50%" 
            onClick={handleOpen}
        >
            OPEN
        </Button> 
    </Flex>
  );
};

export default OpenButton;
