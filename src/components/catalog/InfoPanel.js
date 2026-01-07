/* InfoPanel.js
   Component to display detailed information about a selected document file,
   aligned with DocumentFile data structure (file.source).
*/

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  CloseButton,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import OpenButton from "./OpenButton";
import GraphPreview from "./GraphPreview/GraphPreview";

export default function InfoPanel({ file, onClose }) {
  const [setGraphData] = useState(null);

  if (!file || !file.source) return null;

  // 🔹 Extract data exactly like DocumentFile
  const {
    title,
    author,
    description,
    id,
    pid,
    score,
    version,
    owner_email,
    storage_url,
    parent_document_pid,
    date,
    yprovistance,
  } = file.source;

  return (
    <Box
      p={6}
      borderRadius="2xl"
      boxShadow="2xl"
      overflowY="auto"
      height="100%"
      position="relative"
    >
      {/* Close button */}
      {onClose && (
        <CloseButton
          position="absolute"
          top={4}
          right={4}
          onClick={onClose}
          color="whiteAlpha.800"
          _hover={{ color: "white" }}
        />
      )}

      {/* Title */}
      <Box w="100%" textAlign="center" mb={6}>
        <Heading size="xl" color="white">
          {title ?? "Untitled"}
        </Heading>
      </Box>

      {/* Preview */}
      {storage_url && (
        <GraphPreview url={storage_url} width={450} height={250} />
      )}

      {/* Metadata */}
      <VStack align="start" spacing={2} mt={4} wordBreak="break-word">
        {Object.entries({
          TITLE: title,
          AUTHOR: author,
          PID: pid ?? id,
          DESCRIPTION: description,
          SCORE: score,
          VERSION: version,
          "OWNER EMAIL": owner_email,
          "STORAGE URL": storage_url,
          "PARENT DOCUMENT PID": parent_document_pid,
          DATE: date,
          "YPROV INSTANCE": yprovistance,
        }).map(([label, value]) => (
          <Box
            key={label}
            w="100%"
            bg="gray.700"
            borderRadius="md"
            p={3}
            boxShadow="sm"
          >
            <Text
              color="blue.400"
              fontWeight="bold"
              textTransform="uppercase"
              mb={1}
            >
              {label}
            </Text>
            <Text color="white">{value ?? "-"}</Text>
          </Box>
        ))}
      </VStack>

      {/* Open button */}
      {storage_url && (
        <OpenButton
          fileUrl={storage_url}
          setGraphData={setGraphData}
        />
      )}
    </Box>
  );
}

InfoPanel.propTypes = {
  file: PropTypes.object,
  onClose: PropTypes.func,
};
