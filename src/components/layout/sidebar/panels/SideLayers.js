// MultiLevel.js
// Component for performing graph reduction and selecting reduced levels

import { useState, useRef, useEffect } from "react";
import "./multiLevel.css";
import { Box, Button, Text, List, ListItem } from "@chakra-ui/react";

const SideLayers = ({ mainGraphData, mainFileName, setGraphData, updateJsonLabel }) => {
  // --- State ---
  const [propsFile, setPropsFile] = useState(null);
  const [options, setOptions] = useState({
    entity_based: false,
    line_tracking: false,
    chunked: false,
    reduce_io: false
  });
  const [reductionUuid, setReductionUuid] = useState(null);
  const [levelCount, setLevelCount] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const previousUuidRef = useRef(null);
  const lastMainFileRef = useRef(mainFileName);

  // --- API helpers ---
  const deleteReductionSession = async (uuid) => {
    if (!uuid) return;
    try {
      await fetch(`${process.env.REACT_APP_API_SERVER_HOST}/files/${uuid}`, { method: "DELETE", keepalive: true });
      console.log(`Deleted reduction session: ${uuid}`);
    } catch (err) {
      console.warn("Failed to delete session:", err);
    }
  };

  const handlePropsFileChange = (e) => setPropsFile(e.target.files[0]);

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({ ...prev, [name]: checked }));
  };

  // --- Start graph reduction ---
  const startReduction = async () => {
    setAlertMsg(null);
    setIsLoading(true);

    if (!mainGraphData) {
      setAlertType("error");
      setAlertMsg(
        <>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />
          Main file not loaded!
        </>
      );
      setIsLoading(false);
      return;
    }

    try {
      // Delete previous session
      if (previousUuidRef.current) {
        await deleteReductionSession(previousUuidRef.current);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append(
        "graph_file",
        new Blob([JSON.stringify(mainGraphData)], { type: "application/json" }),
        mainFileName
      );
      if (propsFile) formData.append("props_file", propsFile);
      formData.append("options", JSON.stringify(options));

      // Send reduction request
      const response = await fetch(`${process.env.REACT_APP_API_SERVER_HOST}/reducer`, { method: "POST", body: formData });
      const data = await response.json();

      if (!data.uuid || !data.count) {
        setAlertType("error");
        setAlertMsg(
          <>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />
            Reduction failed — try changing the options.
          </>
        );

        setIsLoading(false);
        setLevelCount(0);
        return;
      }

      setReductionUuid(data.uuid);
      setLevelCount(data.count);
      previousUuidRef.current = data.uuid;

      setAlertType("success");
      setAlertMsg(
        <>
          <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }} />
          Reduction completed successfully, {data.count} levels produced!
        </>
      );
    } catch (error) {
      console.error("Reduction failed:", error);
      setAlertType("error");
      setAlertMsg(
        <>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />
          Reduction failed, see console.
        </>
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Auto-load level 0 after successful reduction ---
  useEffect(() => {
    if (reductionUuid && levelCount > 0) {
      setSelectedLevel(0);
      handleLevelSelect(0);
    }
  }, [reductionUuid, levelCount]);

  // --- Load selected reduction level ---
  const handleLevelSelect = async (level) => {
    if (alertType === "error") setAlertMsg(null);
    if (!reductionUuid) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_SERVER_HOST}/files/${reductionUuid}/${level}`);
      if (!response.ok) throw new Error("Failed to fetch level data");

      const reducedGraph = await response.json();
      setGraphData(reducedGraph);

      const baseName = mainFileName ? mainFileName.split("/").pop().replace(/\.json$/i, "") : "graph";
      const newName = `${baseName}_${level}.json`;

      if (updateJsonLabel) updateJsonLabel(reducedGraph, newName);

      const encodedName = encodeURIComponent(newName);
      window.history.replaceState(null, "", `${window.location.origin}${window.location.pathname}?file=${encodedName}`);

      setSelectedLevel(level);
    } catch (error) {
      console.error("Error fetching reduced level:", error);
      setAlertType("error");
      setAlertMsg(
        <>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />
          Failed to fetch reduced level.
        </>
      );
    }
  };

  // --- Handle main file changes ---
  useEffect(() => {
    if (lastMainFileRef.current && mainFileName !== lastMainFileRef.current) {
      if (previousUuidRef.current) {
        deleteReductionSession(previousUuidRef.current);
        previousUuidRef.current = null;
      }
      setReductionUuid(null);
      setLevelCount(0);
      setSelectedLevel(null);
      setAlertMsg(null);
    }
    lastMainFileRef.current = mainFileName;
  }, [mainFileName]);

  // --- Clean up on window unload ---
  useEffect(() => {
    const handleUnload = () => {
      if (previousUuidRef.current) {
        deleteReductionSession(previousUuidRef.current);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // --- Tooltips ---
  const tooltipDescriptions = {
    entity_based:
      "Enable when the input graph is entity-based (relies on 'wasDerivedFrom' relations between entities).",
    line_tracking:
      "Enable when working with documents that embed line tracking information for pre-reduction.",
    chunked:
      "For graphs from yProv4Dask — merges nodes differing only by chunk index (ignored if line_tracking is enabled).",
    reduce_io:
      "Aggregates entities that serve as inputs/outputs to a single activity into one entity each.",
    props:
      "Each line of this file defines a property key, its type, and how it should be aggregated (0: ignore, 1: aggregate unique values). See graph_tools.VertexPropertyMap for details."
  };

  // --- Render ---
  return (
    <Box className="ml-panel">
      <h3 className="ml-title">Graph Reduction</h3>

      <Button className="ml-advanced-toggle" onClick={() => setShowAdvanced((prev) => !prev)}>
        {showAdvanced ? (
          <>
            Hide Advanced Options
            <i className="bi bi-chevron-up" style={{ marginLeft: 6 }} />
          </>
        ) : (
          <>
            Show Advanced Options
            <i className="bi bi-chevron-down" style={{ marginLeft: 6 }} />
          </>
        )}
      </Button>

      {showAdvanced && (
        <>
          <Box className="ml-section">
            <h4 className="ml-subtitle">Reduction Options</h4>

            {Object.keys(options).map((opt) => (
              <label key={opt} className="ml-tooltip-item">
                <input type="checkbox" name={opt} checked={options[opt]} onChange={handleOptionChange} style={{ marginLeft: 6}}/>
                <Text>{opt.replace("_", " ")}</Text>

                <Text className="ml-tooltip-wrapper">
                  <i className="bi bi-info-circle"></i>
                  <Text className="ml-tooltip-text">{tooltipDescriptions[opt]}</Text>
                </Text>
              </label>
            ))}
          </Box>

          <Box className="ml-section">
            <h4 className="ml-subtitle">
              Props File
              <Text className="ml-tooltip-wrapper"  style={{marginLeft: "20px"}}>
                <i className="bi bi-info-circle"></i>
                <Text className="ml-tooltip-text">{tooltipDescriptions.props}</Text>
              </Text>
            </h4>

            <label>
              <input className="ml-file-input" type="file" accept=".txt" onChange={handlePropsFileChange} />
            </label>
          </Box>
        </>

      )}

      <Button className="ml-button" onClick={startReduction} disabled={isLoading}>
        {isLoading ? (
          <>
            Reducing…
            <i className="bi bi-hourglass-split" style={{ marginLeft: 6 }} /> 
          </>
        ) : (
          <>
            <i className="bi bi-diagram-3" style={{ marginRight: 6 }} />
            Start reduction
          </>
        )}
      </Button>

      {alertMsg && <Box className={`ml-alert ml-alert-${alertType}`}>{alertMsg}</Box>}

      {levelCount > 0 && (
        <Box className="ml-section">
          <h4 className="ml-subtitle">Level Selector</h4>

          <List className="ml-select">
            {Array.from({ length: levelCount }, (_, i) => i).map((l) => (
              <ListItem
                key={l}
                className={`ml-level-item ${selectedLevel === l ? "selected" : ""}`}
                onClick={() => handleLevelSelect(l)}
              >
                {l}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

    </Box>
  );
};

export default SideLayers;
