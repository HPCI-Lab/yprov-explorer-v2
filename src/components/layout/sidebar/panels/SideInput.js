import { Box, Heading} from "@chakra-ui/react";
import JsonLabel from "../../../old/JsonLabel/JsonLabel";
import React, { forwardRef } from "react";
/*
SideInput.js: Input panel for controlling inputs:
- Api input
- Json input
- Others
 */
const SideInput = forwardRef(({ setGraphData, setCurrentFileName }, ref) => {
  return (
    <Box color="white">
      <JsonLabel
        ref={ref}
        setGraphData={setGraphData}
        setCurrentFileName={setCurrentFileName}
      />
    </Box>
  );
});

export default SideInput;