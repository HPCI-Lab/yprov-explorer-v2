/* DocumentFile.js: represents a single document file in the catalog. It displays a preview image, name, author, and indicators for linked files and attached documents.
It supports selection and highlights when selected.
*/

import React from "react";
import PropTypes from "prop-types";
import { Box, Text, VStack} from "@chakra-ui/react";
import GraphPreview from "./GraphPreview/GraphPreview";

export default function DocumentFile({ file, selected, onSelect }) {
  // Handler for selecting the document
  const handleSelect = () => onSelect && onSelect(file.id);

  // Extract file details
  const title = file.source?.title ?? "Untitled";
  const author = file.source?.author ?? "Unknown";
  const storageUrl = file.source?.storage_url ?? "";

  // Number of linked files
  //const linkedFile = file.linked_files ;

  /* Function to count linked documents
  const LinkedDocument = (file) => {
    if (!file.linked_documents || !Array.isArray(file.linked_documents)) {
      return 0;
    }
    return file.linked_documents.length;
  };

  const linkedCount = LinkedDocument(file);
  const hasAttached = linkedCount > 0; */

  const bg = "rgba(0,0,0,0.5)";

  return (
   <Box
      as="article"
      role="button"
      onClick={handleSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
      aria-pressed={selected}
      borderRadius="16px"
      overflow="hidden"
      position="relative"
      boxShadow={selected ? "0 8px 24px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.1)"}
      transform={selected ? "scale(1.02)" : "scale(1)"}
      transition="all 0.2s"
      cursor="pointer"
    >
      <GraphPreview url={storageUrl} width={300} height={200} />

      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="100%"
        bg={bg}
        color="white"
        px={3}
        py={2}
      >
        <VStack align="flex-start" spacing={1}>
          <Text fontWeight="bold" wordBreak="break-word">{title}</Text>
          <Text fontSize="sm" opacity={0.8} wordBreak="break-word">{author}</Text>
        </VStack>
      </Box>

      {/* Indicators for linked files and attached documents 
      <HStack position="absolute" top="8px" right="8px" spacing={2}>
        {linkedFile > 0 && (
          <Tooltip label="linked files">
            <Badge 
              px={2} 
              py={0.5} 
              borderRadius="6px" 
              bg="black" 
              color="white"
            >
              {linkedFile}
            </Badge>
          </Tooltip>
        )}
        {hasAttached && (
          <Tooltip label="linked documents">
            <Badge
              px={2}
              py={1.5}
              borderRadius="6px"
              bg="green"
              color="white"
              display="flex"
              alignItems="center"
            >
              <Icon as={FileText} boxSize={3} />
            </Badge>
          </Tooltip>
        )}
      </HStack> */}
    </Box>
  );
}
DocumentFile.propTypes = {
  file: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
};  
