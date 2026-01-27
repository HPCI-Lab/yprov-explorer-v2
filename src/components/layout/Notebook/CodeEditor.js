import {Box, HStack, IconButton, Input, InputGroup, InputLeftElement} from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { EditorView, lineNumbers } from "@codemirror/view";
import {AddIcon, MinusIcon, SearchIcon} from "@chakra-ui/icons";
import {useState} from "react";

export default function CodeEditor({ cellIndex }){
    const [fontSize, setFontSize] = useState(14);

    const editorTheme = EditorView.theme({
        ".cm-gutters": {
            backgroundColor: "#1e1e1e",
            color: "#9ca3af",
            borderRight: "1px solid #2d2d2d",
        },
        ".cm-activeLineGutter": {
            backgroundColor: "#2b2b2b",
            color: "#fff",
        },
        ".cm-activeLine": {
            backgroundColor: "#2b2b2b",
        },
        ".cm-line:hover": {
            backgroundColor: "#333333"
        },
    });


    return (
        <Box
            w="100%"
            h="100%"
            minH="0"
            display="flex"
            flexDirection="column"
            gap="3"
            overflow="hidden"
        >
            <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color="whiteAlpha.600"/>
                </InputLeftElement>
                <Input
                    placeholder="Search in code…"
                    bg="gray.750"
                    color="black"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _placeholder={{color: "black"}}
                />
            </InputGroup>
            <Box
                flex="1"
                position="relative"
                bg="gray.900"
                border="1px solid"
                minH="0"
                borderColor="whiteAlpha.200"
                overflow="hidden"
                display="flex"
                flexDirection="column"
            >

                <HStack
                    position="absolute"
                    top="0"
                    right="0"
                    w="100%"
                    height="28px"
                    px="2"
                    spacing={1}
                    bg="gray.900"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.200"
                    zIndex="10"
                >
                    <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="search"
                        icon={<SearchIcon color="black"/>}
                    />
                    <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="font minus"
                        icon={<MinusIcon color="black"/>}
                        onClick={() => setFontSize(v => Math.max(10, v - 2))}
                    />
                    <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="font plus"
                        icon={<AddIcon color="black"/>}
                        onClick={() => setFontSize(v => v + 2)}
                    />
                </HStack>
                <Box
                    overflow="hidden"
                    flex="1"
                    bg="gray.900"
                    width="100%"
                    minHeight="0"
                    border="1px gray.600"
                    paddingTop="28px"
                    sx={{
                        "& .cm-scroller": {
                            scrollbarWidth: "thin",
                            scrollbarColor: "#444 transparent",
                            overflowY: "auto",
                        },
                        "& .cm-editor": {
                            height: "100%",
                        },
                        "& .cm-scroller::-webkit-scrollbar": {
                            width: "4px",
                        },
                        "& .cm-scroller::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                        "& .cm-scroller::-webkit-scrollbar-thumb": {
                            background: "#4a4a4a",
                            borderRadius: "3px",
                        },
                        "& .cm-scroller::-webkit-scrollbar-thumb:hover": {
                            background: "#6a6a6a",
                        },
                    }}
                >
                    <CodeMirror
                        value={`# Cell ${cellIndex}\n\nprint("Hello from cell ${cellIndex}")`}
                        theme={oneDark}
                        extensions={[
                            lineNumbers(),
                            python(),
                            editorTheme,
                            EditorView.editable.of(false),
                        ]}
                        basicSetup={{
                            highlightActiveLine: true,
                            highlightActiveLineGutter: true,
                            foldGutter: false,
                        }}
                        style={{
                            fontSize: `${fontSize}px`,
                            height: "100%",
                        }}
                    />
                </Box>
            </Box>
        <Box
            pt="2"
            borderTop="1px solid"
            borderColor="whiteAlpha.200"
        >
            <HStack justify="space-between">
                <Box fontSize="xs" opacity={0.6}>
                    Ready to associate with graph
                </Box>

                <IconButton
                    size="sm"
                    colorScheme="blue"
                    icon={<AddIcon />}
                    aria-label="associate"
                />
            </HStack>
        </Box>
    </Box>
    );
}
