// JsonLabel.js
/*
JsonLabel.js: This component allows users to load and view a JSON file. It uses internal states to manage the name of the file 
loaded, the JSON content and the visibility of a loading window. The user can select a JSON file via a 
upload button, which reads and analyzes the file content, updating the status and passing data to the parent component 
via setGraphData. The JSON content is displayed in a readable format within a sliding window, with each 
Line displayed separately. If no file was uploaded, a default message is shown.
*/

import React, { useState, useEffect} from "react";
import "./jsonLabel.css";
import FileUploadButton from "../FileUploadButton/FileUploadButton";
import { unifiedFileLoader } from '../../../server/unified-loader';

/*
 - setGraphData: Function to set the graph data in the parent component
*/
// JsonLabel.js


const API_BASE = process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8000";

const JsonLabel = ({ setGraphData, jsonContent, setJsonContent, setSavedGraphFilename }) => {
  const [fileName, setFileName] = useState(null);
  const [showUploadBox, setShowUploadBox] = useState(false);

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Upload a File instance to server /api/graphs/upload
  const uploadFileToServer = async (fileObj) => {
    try {
      const form = new FormData();
      form.append("file", fileObj);

      const res = await fetch(`${API_BASE}/api/graphs/upload`, {
        method: "POST",
        body: form
      });

      if (!res.ok) {
        console.error("Upload failed:", res.statusText);
        return null;
      }

      const json = await res.json();
      if (json && json.filename) {
        if (setSavedGraphFilename) setSavedGraphFilename(json.filename);
        return json.filename;
      }
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Function to handle the file upload and update the states accordingly
  const handleFileUpload = async (name, content, originalFile=null) => {
    let parsedContent = content;

    if (content.result && typeof content.result === "string") {
      try {
        parsedContent = JSON.parse(content.result);
      } catch (error) {
        console.error("Error parsing 'result' field:", error);
        alert("Invalid 'result' field in JSON file.");
        return;
      }
    }

    setFileName(name);
    setShowUploadBox(false);
    setJsonContent(JSON.stringify(content, null, 2).split("\n"));
    setGraphData(content);
    const encodedUrl = encodeURIComponent(name);
    window.history.replaceState(null, "", `?file=${encodedUrl}`);
    if (originalFile) {
      await uploadFileToServer(originalFile);
    } else {
      try {
        const blob = new Blob([JSON.stringify(content)], { type: "application/json" });
        const fakeName = name || "graph.json";
        const fileObj = new File([blob], fakeName, { type: "application/json" });
        await uploadFileToServer(fileObj);
      } catch (err) {
        console.error("Could not create/upload blob file:", err);
      }
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  useEffect(() => {
    const loadContent = async () => {
      const fileUrl = getQueryParam("file");
      if (!fileUrl) return;

      try {
        const decodedUrl = decodeURIComponent(fileUrl);
        const isFullUrl = decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://');

        let result;
        if (isFullUrl) {
          result = await unifiedFileLoader(decodedUrl);
        } else {
          result = await unifiedFileLoader(fileUrl);
        }

        if (!result || !result.data) {
          throw new Error('Invalid data format received');
        }

        setFileName(decodedUrl);
        const formattedContent = JSON.stringify(result.data, null, 2).split("\n");
        setJsonContent(formattedContent);
        setGraphData(result.data);

        try {
          const blob = new Blob([JSON.stringify(result.data)], { type: "application/json" });
          const fakeName = decodedUrl.split("/").pop() || "graph.json";
          const fileObj = new File([blob], fakeName, { type: "application/json" });
          await uploadFileToServer(fileObj);
        } catch (err) {
          console.error("Error uploading loaded URL content to server:", err);
        }

      } catch (error) {
        console.error("Error loading JSON content:", error);
        setJsonContent(["Error loading JSON content. Please try again."]);
        setFileName("Error loading file");
      }
    };

    loadContent();
  }, [setGraphData]);

  return (
    <div className="json-label-container">
      <div className="json-label-header">
      <span>
        <strong>My File:</strong> {fileName ? truncateText(fileName, 30) : "Nessun file caricato"}
      </span>

        <div className="upload-button-container">
        <FileUploadButton onFileUpload={(fileNameOrUrl, content, originalFile) => handleFileUpload(fileNameOrUrl, content, originalFile)} />
        </div>
      </div>

      {showUploadBox && (
        <div className="upload-overlay">
          <div className="upload-box">
            <input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file && file.type === "application/json") {
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const content = JSON.parse(event.target.result);
                      // Pass original file to upload function
                      await handleFileUpload(file.name, content, file);
                    } catch (error) {
                      console.error("Errore nel parsing del file JSON", error);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <button onClick={() => setShowUploadBox(false)}>Chiudi</button>
          </div>
        </div>
      )}
      <div
          className="json-content-container"
          dangerouslySetInnerHTML={{
            __html: Array.isArray(jsonContent)
                ? jsonContent.map((line) => `<pre>${line}</pre>`).join("")
                : "Carica un file JSON per visualizzarlo qui.",
          }}
      ></div>
    </div>
  );
};

export default JsonLabel;
