/*
DocumentFile.js: single document item in a list.
It displays a preview image, the file name, and handles selection via click or keyboard.
The visual appearance changes when the item is selected, using background color, shadow, and transform effects.
*/

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Image,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";

export default function DocumentFile({ file, selected, onSelect }) {
  // Calls the parent callback when this document is selected
  const handleSelect = () => onSelect && onSelect(file.id);

  const bg = useColorModeValue("#909492ff", "rgba(255,255,255,0.02)");
  const shadow = selected ? "0 12px 28px rgba(2,6,23,0.6)" : "none";
  return (
    <Box
      as="article"
      role="button"
      onClick={handleSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
      aria-pressed={selected}
      aria-label={`${file.name} by ${file.author}`}
      bg={bg}
      borderRadius="10px"
      borderWidth="1px"
      padding="10px"
      borderColor={bg}
      transform={selected ? "translateY(-4px)" : "none"}
      boxShadow={shadow}
      display="row"
      alignItems="flex-start"
      userSelect="none"
      overflow="auto"
     
    >
      <Image src={file.preview} />  
      <Text> {file.name} </Text>

      <VisuallyHidden>
        {selected ? "Selected" : "Not selected"}
      </VisuallyHidden>
    </Box>
  );
}

// Prop validation for safety
DocumentFile.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    author: PropTypes.string,
    pid: PropTypes.string,
    preview: PropTypes.string,
    metrics: PropTypes.shape({
      nodes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      activity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      entities: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
};
