/* 
  Theme:
  - Defines global typography, colors, and color mode settings.
  - Applies custom scrollbar styling, including increased thickness,
    added right-side spacing, and visual separation of the thumb from the edge.
  - Enhances overall readability and provides a consistent UI appearance.
*/

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: { brand: { 500: "#000000ff" } },
  fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
  config: { initialColorMode: "light", useSystemColorMode: true },
  styles: {
    global: {
      
      "html, body, *": {
        /* browsers (Chrome, Edge, Safari) */
        "&::-webkit-scrollbar": {
          width: "20px",
          height: "12px",
          marginRight: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "100px",
          border: "5px solid transparent",
          backgroundClip: "content-box",
        },
        
      },

    
    }
  }
});

export default theme;