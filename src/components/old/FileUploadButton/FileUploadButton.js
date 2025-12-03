import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Heading,
  Spinner,
  Divider
} from "@chakra-ui/react";

const FileUploadButton = ({ onFileUpload }) => {
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState(null);
  const [apiInput, setApiInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Refs to store the current input values
  const linkInputRef = useRef("");
  const apiInputRef = useRef("");

  // Handler for showing/hiding the upload section
  const handleButtonClick = () => {
    setShowUploadSection(!showUploadSection);
    setError(null);
  };

  // Function to parse JSON content, handling both objects and strings
  const parseJsonContent = (content) => {
    if (typeof content === "object" && content !== null) {
      return content;
    }
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing JSON content:", error);
      throw new Error("Invalid JSON format");
    }
  };

  // Function to process the JSON data, handling a potential 'result' field
  const processJsonData = (jsonData) => {
    try {
      if (jsonData.result && typeof jsonData.result === "string") {
        return parseJsonContent(jsonData.result);
      }
      return jsonData;
    } catch (error) {
      console.error("Error processing JSON data:", error);
      throw new Error("Error processing JSON structure");
    }
  };

  // Handler for file upload from the computer
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const initialContent = parseJsonContent(event.target.result);
          const processedContent = processJsonData(initialContent);
          onFileUpload(uploadedFile.name, processedContent);
          setError(null);
        } catch (error) {
          setError(error.message);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      setError("Please upload a valid JSON file.");
    }
  };

  // Handler for uploading JSON via URL
  const handleLinkUpload = async () => {
    // Use the value from the ref, which always contains the updated value
    const currentLinkInput = linkInputRef.current.trim();
    if (currentLinkInput === "") {
      setError("Please enter a valid URL.");
      return;
    }
    console.log("URL upload initiated, linkInput:", currentLinkInput);
    setLoading(true);
    setError(null);
    try {
      const fullUrl = currentLinkInput.startsWith("http")
        ? currentLinkInput
        : `https://${currentLinkInput}`;
      const response = await fetch(fullUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const initialContent = await response.json();
      const processedContent = processJsonData(initialContent);
      onFileUpload(fullUrl, processedContent);
      const encodedUrl = encodeURIComponent(fullUrl);
      window.history.replaceState(null, "", `?file=${encodedUrl}`);
      setLinkInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error fetching or processing JSON:", error);
      setError("Failed to load or process JSON from URL. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for uploading JSON via API endpoint
  const handleApiUpload = async () => {
    // Use the value from the ref, which always contains the updated value
    const currentApiInput = apiInputRef.current.trim();
    if (currentApiInput === "") {
      setError("Please enter a valid API endpoint.");
      return;
    }
    console.log("API upload initiated, apiInput:", currentApiInput);
    setLoading(true);
    setError(null);
    try {
      const fullApiUrl = currentApiInput.startsWith("http")
        ? currentApiInput
        : `https://${currentApiInput}`;
      console.log("Fetching from API URL:", fullApiUrl);
      const proxyUrl = `./proxy?url=${encodeURIComponent(fullApiUrl)}`;
      console.log("Using proxy URL:", proxyUrl);
      const response = await fetch(proxyUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const initialContent = await response.json();
      const parsedContent =
        initialContent.result && typeof initialContent.result === "string"
          ? JSON.parse(initialContent.result)
          : initialContent;
      onFileUpload(fullApiUrl, parsedContent);
      const encodedUrl = encodeURIComponent(fullApiUrl);
      window.history.replaceState(null, "", `?file=${encodedUrl}`);
      setApiInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Failed to load or process JSON from API: ${error.message}. Please check the endpoint and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="gray.300"
      p={5}
      borderRadius="md"
      boxShadow="md"
      w="100%"
      color="gray.800"
    >
      <Heading size="md" mb={4}>
        Upload a JSON file
      </Heading>

      {/* UPLOAD FILE */}
      <VStack align="stretch" spacing={3} mb={4}>
        <Text fontWeight="semibold">Upload from Computer</Text>
        <Input
          fontSize={11}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          bg="white"
        />
      </VStack>

      <Divider my={3} />

      {/* URL */}
      <VStack align="stretch" spacing={3} mb={4}>
        <Text fontWeight="semibold">Upload from URL</Text>
        <Input
          placeholder="enter JSON file form URL"
          fontSize={11}
          value={linkInput}
          onChange={(e) => {
            setLinkInput(e.target.value);
            linkInputRef.current = e.target.value;
          }}
          bg="white"
        />
        <Button
          colorScheme="blue"
          onClick={handleLinkUpload}
          isDisabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "upload form URL"}
        </Button>
      </VStack>

      <Divider my={3} />

      {/* API */}
      <VStack align="stretch" spacing={3}>
        <Text fontWeight="semibold"> Enter from API</Text>
        <Input
          fontSize={11}
          placeholder="enter API endpoint"
          value={apiInput}
          onChange={(e) => {
            setApiInput(e.target.value);
            apiInputRef.current = e.target.value;
          }}
          bg="white"
        />
        <Button
          colorScheme="blue"
          onClick={handleApiUpload}
          isDisabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "upload form API"}
        </Button>
      </VStack>

      {error && (
        <Text mt={4} color="red.500" fontWeight="medium">
          {error}
        </Text>
      )}
    </Box>
  );
};

export default FileUploadButton;