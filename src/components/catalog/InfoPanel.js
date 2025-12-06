/* InfoPanel.js
Displays detailed information about a selected file in the catalog.
Utilizes Chakra UI for styling and layout.    
*/

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  useColorModeValue, 
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import OpenButton from "./OpenButton";

export default function InfoPanel({ file }) {
 
  {/* Set text color based on the current color mode */}
  const textColor = useColorModeValue("black", "whiteAlpha.900");
  const [setGraphData] = useState(null);
  
  if (!file) return null;

  return (

    <Box 
      p="2"
      bg="gray.700"
      borderLeft="5px solid black"
      color="white"
      borderRadius="xl"
      height="100%"
      overflowY="auto"
    >
      <Heading 
        whiteSpace="normal"
        wordBreak="break-word"
      >
        {file.name}
      </Heading>

      <Image src={file.preview}/>

      {/* Display file attributes with labels and values */}
      <Text color={textColor}>
        <Text as="span" fontWeight="700">TITLE: </Text>
        <Text as="span" fontWeight="400">{file.title ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">AUTHOR: </Text>
        <Text as="span" fontWeight="400">{file.author ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">ID/PID: </Text>
        <Text as="span" fontWeight="400">{file.id ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">DESCRIPTION: </Text>
        <Text as="span" fontWeight="400">{file.description ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">SCORE: </Text>
        <Text as="span" fontWeight="400">{file.score ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">VERSION: </Text>
        <Text as="span" fontWeight="400">{file.version ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">OWNER_EMAIL: </Text>
        <Text as="span" fontWeight="400">{file.owner_email ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">STORAGE URL: </Text>
        <Text as="span" fontWeight="400">{file.storage_url ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">PARENT DOCUMENT PID: </Text>
        <Text as="span" fontWeight="400">{file.parent_document_pid ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">DATE: </Text>
        <Text as="span" fontWeight="400">{file.date ?? "-"}</Text>
      </Text>

      <Text color={textColor}>
        <Text as="span" fontWeight="700">yPrv ISTANCE: </Text>
        <Text as="span" fontWeight="400">{file.yprovistance ?? "-"}</Text>
      </Text>
    
      <OpenButton fileUrl={file.storage_url} setGraphData={setGraphData}/> 
      
    </Box>
  );
}

// Define prop types for the InfoPanel component
InfoPanel.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    preview: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), 
    version: PropTypes.string,
    owner_email: PropTypes.string,
    storage_url: PropTypes.string,
    parent_document_pid: PropTypes.string,
    date: PropTypes.string,
    yprovistance: PropTypes.string,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func,
};
