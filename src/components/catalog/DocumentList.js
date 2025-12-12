/*  DocumentList.js
    Component to display a list of document files in a grid layout.
    Adapts its size based on whether an info panel is open.
*/

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Grid, GridItem, Flex } from "@chakra-ui/react";
import DocumentFile from "./DocumentFile";

export default function DocumentList({
  files = [],
  columns = 5,
  onSelect,
  onOpen,
  initialSelectedId = null,
  panelOpen = false, 
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [query] = useState("");

  const handleSelect = (id) => {
    setSelectedId(id);
    onSelect && onSelect(id);
  };

  const handleOpen = (id) => {
    onOpen && onOpen(id);
  };

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
    <Flex
      direction="column"
      flex={panelOpen ? 2 : 3} 
      minW={0} 
      transition="all 0.3s ease-in-out"
      overflow="hidden"
    >
      {filtered.length === 0 ? (
        <Box textAlign="center" color="gray.600" mt={4}>
          No document found.
        </Box>
      ) : (
        <Grid
          gap={5}
          rowGap={20}
          templateColumns={{ base: "repeat(1, 1fr)", md: `repeat(${columns}, 1fr)` }}
          overflowY="auto"
          overflowX="hidden"
          flex="1"
        >
          {filtered.map((f) => (
            <GridItem key={f.id} display="flex" flexDirection="column" minW={10}>
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
    </Flex>
  );
}

DocumentList.propTypes = {
  files: PropTypes.array.isRequired,
  columns: PropTypes.number,
  onSelect: PropTypes.func,
  onOpen: PropTypes.func,
  initialSelectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  panelOpen: PropTypes.bool,
};
