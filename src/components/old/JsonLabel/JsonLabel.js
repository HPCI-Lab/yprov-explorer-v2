// JsonLabel.js
/*
JsonLabel.js: This component allows users to load and view a JSON file. It uses internal states to manage the name of the file 
loaded, the JSON content and the visibility of a loading window. The user can select a JSON file via a 
upload button, which reads and analyzes the file content, updating the status and passing data to the parent component 
via setGraphData. The JSON content is displayed in a readable format within a sliding window, with each 
Line displayed separately. If no file was uploaded, a default message is shown.
*/

import React, { useState, useEffect} from "react";
import { Box, Flex, Text, VStack} from "@chakra-ui/react";
import FileUploadButton from "../FileUploadButton/FileUploadButton";
import { unifiedFileLoader } from '../../../server/unified-loader';

/*
 - setGraphData: Function to set the graph data in the parent component
*/
const JsonLabel = ({ setGraphData, jsonContent, setJsonContent }) => {
  const [fileName, setFileName] = useState(null); // State to store the name of the uploaded file
  //const [jsonContent, setJsonContent] = useState(null); // State to store the JSON content
  const [showUploadBox, setShowUploadBox] = useState(false); // State to manage the visibility of the upload window

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Function to handle the file upload and update the states accordingly
  const handleFileUpload = (name, content) => {
    let parsedContent = content;

    // Check if the content has a 'result' field and parse it if it's a string
    if (content.result && typeof content.result === "string") {
      try {
        parsedContent = JSON.parse(content.result);
      } catch (error) {
        console.error("Error parsing 'result' field:", error);
        alert("Invalid 'result' field in JSON file.");
        return;
      }
    }
    setFileName(name); // Save the file name in the state
    setShowUploadBox(false); // Hide the upload window
    setJsonContent(JSON.stringify(content, null, 2).split("\n")); // Format the JSON content and split it by line 
    setGraphData(content); // Update the graph data in the parent component 
    const encodedUrl = encodeURIComponent(name); // Encode the file name to handle special characters
    window.history.replaceState(null, "", `?file=${encodedUrl}`); // Update the URL with the file name
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`; // Truncate the text if it's longer than the max length
    }
    return text;
  };

  // Load the JSON content from the URL parameter when the component is mounted 
  useEffect(() => {
    const loadContent = async () => {
      const fileUrl = getQueryParam("file");
      if (!fileUrl) return;
  
      try {
        // Decode the URL to handle special characters
        const decodedUrl = decodeURIComponent(fileUrl);
        
        // Check if the URL is a full URL
        const isFullUrl = decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://');
        
        let result;
        if (isFullUrl) {
          // For full URLs/API, pass the decoded
          result = await unifiedFileLoader(decodedUrl);
        } else {
          // For relative URLs, pass the original URL
          result = await unifiedFileLoader(fileUrl);
        }
  
        // Check if the result is valid
        if (!result || !result.data) {
          throw new Error('Invalid data format received');
        }
  
        // Set the file name
        setFileName(decodedUrl);
        
        // Format the JSON content and split it by line
        const formattedContent = JSON.stringify(result.data, null, 2).split("\n");
        setJsonContent(formattedContent);
        
        // Update the graph data in the parent component
        setGraphData(result.data);
        
      } catch (error) {
        console.error("Error loading JSON content:", error);
        setJsonContent(["Error loading JSON content. Please try again."]);
        setFileName("Error loading file");
      }
    };
  
    loadContent();
  }, [setGraphData]);
  
  
  return (
    <Box w="100%" h="100%" p={4}>
      <Text fontWeight="bold">
          My File: {fileName ? truncateText(fileName, 30) : "Nessun file caricato"}
        </Text>
      <Flex justify="space-between" align="cente" >
    
        <FileUploadButton
          onFileUpload={(fileNameOrUrl, content) => handleFileUpload(fileNameOrUrl, content)}
        />
      </Flex>

      {showUploadBox && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.00"
          justify="center"
          align="center"
          zIndex={1000}
        >
          <VStack p={6} borderRadius="md" spacing={4}>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === "application/json") {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const content = JSON.parse(event.target.result);
                      handleFileUpload(file.name, content);
                    } catch (error) {
                      console.error("Errore nel parsing del JSON", error);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
           
          </VStack>
        </Flex>
      )}

    </Box>
  );
};

export default JsonLabel;