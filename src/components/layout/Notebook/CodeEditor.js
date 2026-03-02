import {Box, HStack, IconButton, Input, InputGroup, InputLeftElement} from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { EditorView, lineNumbers } from "@codemirror/view";
import {AddIcon, MinusIcon, SearchIcon} from "@chakra-ui/icons";
import {useRef, useState} from "react";
import { gutter, GutterMarker } from "@codemirror/view";

class ProvenanceMarker extends GutterMarker {
    toDOM() {
        const el = document.createElement("div");
        el.style.color = "#facc15";
        el.style.fontSize = "10px";
        el.style.lineHeight = "1";
        el.style.marginLeft = "4px";
        return el;
    }
}

const provenanceMarker = new ProvenanceMarker();

export default function CodeEditor({ lines, provenanceLines, onLineClick  }){
    const [fontSize, setFontSize] = useState(14);
    const editorRef = useRef(null);
    const code = lines
        .filter(l => !l.isCellSeparator)
        .map(l => l.content)
        .join("\n");

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

    const lineClickExtension = EditorView.domEventHandlers({
        mousedown: (event, view) => {
            if (!onLineClick) return;

            const pos = view.posAtCoords({
                x: event.clientX,
                y: event.clientY
            });
            if (pos == null) return;

            const line = view.state.doc.lineAt(pos);
            const editorLineNumber = line.number;

            const visibleLines = lines.filter(l => !l.isCellSeparator);
            const clicked = visibleLines[editorLineNumber - 1];
            if (!clicked) return;

            view.dispatch({
                selection: { anchor: line.from },
                scrollIntoView: true,
            });

            const hasProv = provenanceLines?.has(clicked.lineNumber);
            if (!hasProv) {
                console.log("Line without provenance:", clicked.lineNumber);
            }
            onLineClick(clicked.lineNumber);
        }
    });

    const provenanceGutter = gutter({
        class: "cm-provenance-gutter",
        lineMarker: (view, line) => {
            const visibleLines = lines.filter(l => !l.isCellSeparator);
            const entry = visibleLines[line.number - 1];
            if (!entry) return null;

            return provenanceLines?.has(entry.lineNumber)
                ? provenanceMarker
                : null;
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
                bg="gray.750"
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
                    bg="gray.800"
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
                        value={code}
                        ref={editorRef}
                        theme={oneDark}
                        extensions={[
                            lineNumbers(),
                            provenanceGutter,
                            python(),
                            editorTheme,
                            EditorView.editable.of(false),
                            lineClickExtension,
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
            {/*
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
            */}
        </Box>
    </Box>
    );
}
