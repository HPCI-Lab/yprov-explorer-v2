import React from "react";
import PropTypes from "prop-types";
import { Box, Grid, GridItem, Flex } from "@chakra-ui/react";
import DocumentFile from "./DocumentFile";

export default function DocumentList({
  files = [],
  columns = 5,
  onSelect,
  onOpen,
  selectedId = null,
  panelOpen = false,
}) {
  return (
    <Flex
      direction="column"
      flex={panelOpen ? 2 : 3}
      minW={0}
      overflow="hidden"
    >
      {files.length === 0 ? (
        <Box textAlign="center" color="gray.600" mt={4}>
          No document found.
        </Box>
      ) : (
        <Grid
          gap={5}
          rowGap={20}
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: `repeat(${columns}, 1fr)`,
          }}
          overflowY="auto"
          flex="1"
        >
          {files.map((f, idx) => (
            <GridItem key={f.id ?? f.pid ?? idx}>
              <DocumentFile
                file={f}
                selected={f.id === selectedId || f.pid === selectedId}
                onSelect={() => onSelect?.(f.id ?? f.pid)}
                onOpen={() => onOpen?.(f.id ?? f.pid)}
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
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  panelOpen: PropTypes.bool,
};