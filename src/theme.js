import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: { brand: { 500: "#000000ff" } },
  fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
  config: { initialColorMode: "light", useSystemColorMode: true },
  styles: {
    global: {
      "*": {
      paddingRight: "4px",

        /* Chrome and Safari */
        "&::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(222, 221, 221, 0.35)",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0,0,0,0.5)",
        },
      },
    },
  }
});

export default theme;