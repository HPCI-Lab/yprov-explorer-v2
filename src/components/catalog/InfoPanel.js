/* InfoPanel.js   
    Component to display detailed information about a selected document file, 
    including metadata, linked files, and linked documents.
*/
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Button,
  Collapse,
  Link,
  CloseButton,
  ScaleFade,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import OpenButton from "./OpenButton";

export default function InfoPanel({ file, onClose }) {
  const [setGraphData] = useState(null);
  const [linkedFilesVisible, setLinkedFilesVisible] = useState(false);
  const [linkedDocumentsVisible, setLinkedDocumentsVisible] = useState(false);

  if (!file) return null;

  const ButtonStyle = (colorScheme) => ({
    borderRadius: "full",
    px: 6,
    py: 2,
    _hover: { transform: "scale(1.05)" },
    transition: "all 0.2s",
    colorScheme,
  });

  const FileCard = ({ f, color }) => (
    <Box
      p={3}
      borderRadius="md"
      bg={color}
      w="100%"
      _hover={{ transform: "scale(1.03)", shadow: "md" }}
      transition="all 0.2s"
    >
      <Link href={f.storage_url} isExternal fontWeight="semibold">
        {f.name}
      </Link>
    </Box>
  );

  return (
    <Box p={6} borderRadius="2xl" boxShadow="2xl" overflowY="auto" height="100%" position="relative">
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

      {/* Main title */}
      <Box w="100%" textAlign="center" mb={6} p={3} borderRadius="xl">
        <Heading size="xl" color="white">{file.name}</Heading>
      </Box>

      {/* Preview image */}
      {file.preview && (
        <Image src={file.preview} alt={file.name} borderRadius="3xl" mb={4} opacity={0.8} />
      )}

      {/* Metadata */}
      <VStack align="start" spacing={1} mb={2} wordBreak="break-word">
        {Object.entries({
          TITLE: file.title,
          AUTHOR: file.author,
          "ID/PID": file.id,
          DESCRIPTION: file.description,
          SCORE: file.score,
          VERSION: file.version,
          "OWNER EMAIL": file.owner_email,
          "STORAGE URL": file.storage_url,
          "PARENT DOCUMENT PID": file.parent_document_pid,
          DATE: file.date,
          "YPRV ISTANCE": file.yprovistance,
        }).map(([label, value]) => (
          <Box key={label} w="100%" bg="gray.700" borderRadius="md" p={3} boxShadow="sm">
            <Text color="blue.400" fontWeight="bold" textTransform="uppercase" mb={1}>
              {label}
            </Text>
            <Text color="white">{value ?? "-"}</Text>
          </Box>
        ))}
      </VStack>

      {/* Open button */}
      <OpenButton fileUrl={file.storage_url} setGraphData={setGraphData} />

      {/* Action buttons */}
      <HStack spacing={4} mb={4} mt={4}>
        <Button
          {...ButtonStyle("blue")}
          onClick={() => setLinkedFilesVisible(!linkedFilesVisible)}
          w="170px"
        >
          Linked files
        </Button>
        <Button
          {...ButtonStyle("green")}
          onClick={() => setLinkedDocumentsVisible(!linkedDocumentsVisible)}
          w="170px"
        >
          Linked documents
        </Button>
      </HStack>

      {/* Linked files */}
      <Collapse in={linkedFilesVisible} animateOpacity>
        <VStack spacing={2} mt={2}>
          {file.attached_files?.length ? (
            file.attached_files.map(f => (
              <ScaleFade in={linkedFilesVisible} key={f.id}>
                <FileCard f={f} color="gray.700" />
              </ScaleFade>
            ))
          ) : (
            <Text color="white">No linked files</Text>
          )}
        </VStack>
      </Collapse>

      {/* Linked documents */}
      <Collapse in={linkedDocumentsVisible} animateOpacity>
        <VStack spacing={2} mt={2}>
          {file.linked_files?.length ? (
            file.linked_files.map(f => (
              <ScaleFade in={linkedDocumentsVisible} key={f.id}>
                <FileCard f={f} color="gray.600" />
              </ScaleFade>
            ))
          ) : (
            <Text color="white">No linked documents</Text>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
}

InfoPanel.propTypes = {
  file: PropTypes.object.isRequired,
  onClose: PropTypes.func,
};
