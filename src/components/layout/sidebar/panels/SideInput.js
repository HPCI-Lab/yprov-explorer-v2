import { Box, Heading} from "@chakra-ui/react";
import JsonLabel from "../../../old/JsonLabel/JsonLabel";
import React from "react";
/*
SideInput.js: Input panel for controlling inputs:
- Api input
- Json input
- Others
 */
export default function SideInput({setGraphData, jsonContent, setJsonContent}) {
    return (
        <Box color="white">
            <JsonLabel setGraphData={setGraphData} jsonContent={jsonContent} setJsonContent={setJsonContent}/>;
        </Box>
    );
}
