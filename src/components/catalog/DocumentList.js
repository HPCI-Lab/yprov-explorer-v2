/*
DocumentList.js: displays a collection of DocumentFile items in a responsive grid.
It supports selection of a single document, filtering by name, author, or type, and triggering callbacks on select or open.
The grid layout adapts to the number of columns and handles empty states gracefully.
*/

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  GridItem,
  useColorModeValue,
  Stack,
} from "@chakra-ui/react";
import DocumentFile from "./DocumentFile";

export default function DocumentList({
  files = [],
  columns = 5,
  onSelect,
  onOpen,
  initialSelectedId = null,
}) {
  // Tracks which document is currently selected
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [query] = useState("");

  // Updates selection state and triggers optional callback
  const handleSelect = (id) => {
    setSelectedId(id);
    onSelect && onSelect(id);
  };

  const handleOpen = (id) => {
    onOpen && onOpen(id);
  };

  // Filters documents based on the search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => {
      return (
        (f.name || "").toLowerCase().includes(q) ||
        (f.author || "").toLowerCase().includes(q) ||
        (f.type || "").toLowerCase().includes(q)
      );
    });
  }, [files, query]);

  return (
      <Stack h="100%">

        {filtered.length === 0 ? (
          <Box  className="dl-empty" textAlign="center" color="black"  >
            No document found.
          </Box>

        ) : (

          <Grid
            className="dl-grid"
            gap={5}
            rowGap={20}
            templateColumns={{ base: "repeat(1, 1fr)", md: `repeat(${columns}, 1fr)` }} 
            overflowY="auto"
            overflowX="hidden"
            height="100%"
          >
            {filtered.map((f) => (
              <GridItem key={f.id} className="dl-grid-item" display="flex" flexDirection="column" minW={10}>
                <DocumentFile
                  file={f}
                  selected={f.id === selectedId}
                  onSelect={handleSelect}
                  onOpen={handleOpen}
                />
              </GridItem>
            ))}
          </Grid>
        )}
      </Stack>
 
  );
}


DocumentList.propTypes = {
  files: PropTypes.array.isRequired,
  columns: PropTypes.number,
  onSelect: PropTypes.func,
  onOpen: PropTypes.func,
  initialSelectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};
