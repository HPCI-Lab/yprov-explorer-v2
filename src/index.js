import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import {ChakraProvider, ColorModeScript, extendTheme} from "@chakra-ui/react";


const root = ReactDOM.createRoot(document.getElementById('root'));
const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
                color: props.colorMode === "dark" ? "gray.100" : "gray.800",
            },
        }),
    },
});

root.render(
    <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
    </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
