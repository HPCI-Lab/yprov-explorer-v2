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

  const Color2= useColorModeValue("black", "rgba(0, 0, 0, 0.5)");

  return (
      <Stack h="100%" >

        {filtered.length === 0 ? (
          <Box  className="dl-empty" textAlign="center" color={Color2}  >
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
