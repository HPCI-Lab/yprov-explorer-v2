import {Box, HStack, IconButton, Input, InputGroup, InputLeftElement} from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { EditorView, lineNumbers } from "@codemirror/view";
import {AddIcon, MinusIcon, SearchIcon} from "@chakra-ui/icons";
import {useRef, useState} from "react";
import { gutter, GutterMarker } from "@codemirror/view";

/*
CodeEditor.js: viewer of the notebook code. Receive lines and builds the cells. Shows the text editor.
 */
/**ù
 *
 * @param {Object[]} lines - lines
 * @param {Object} onLineClick - clicked line
 * @returns {JSX.Element}
 * @constructor
 */

export default function CodeEditor({ lines, onLineClick  }){
    //building the code to show, based on the lines
    let code = [];
    const codeLines = [];
    //states and ref for text editor size and update
    const [fontSize, setFontSize] = useState(14);
    const editorRef = useRef(null);
    const [search, setSearch] = useState("");
    //building the code
    for(let i = 0; i<lines.length; i++){
        codeLines.push(lines[i].code);
    }
    code = codeLines.join("\n");

    //function for handling the text click of CodeMirror
    const lineClickExtension = EditorView.domEventHandlers({
        mousedown: (event, view) => {
            if (!onLineClick) {
            }else{
                //calculating cursor position
                const position = view.posAtCoords({
                    x: event.clientX,
                    y: event.clientY
                });
                if (position == null){

                }else{
                    //recover the lines
                    const line = view.state.doc.lineAt(position);
                    const editorLineNumber = line.number;
                    //recover the lines and the clicked
                    const visibleLines = lines.filter(line => !line.isCellSeparator);
                    const clicked = visibleLines[editorLineNumber - 1];
                    if (!clicked){
//
                    }else{
                        //select the line
                        view.dispatch({selection: { anchor: line.from }, scrollIntoView: true,});
                    }
                    console.log(clicked.count);
                    onLineClick(clicked.count);
                }
            }
        }
    });
    //text editor theme
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

    //main layout
    return (
        <Box w="100%" h="100%" minH="0" display="flex" flexDirection="column" gap="3" overflow="hidden">
            {/*search bar TO IMPLEMENT*/}
            <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color="black"/>
                </InputLeftElement>
                <Input
                    placeholder="Search into the code..."
                    bg="white"
                    color="black"
                    border="1px solid"
                    borderColor="black"
                    _placeholder={{color: "black"}}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>
            <Box flex="1" position="relative" bg="gray.750" border="1px solid" minH="0" borderColor="black" overflow="hidden" display="flex" flexDirection="column">
                <HStack
                    position="absolute"
                    top="0"
                    right="0"
                    w="100%"
                    height="28px"
                    px="2"
                    spacing={1}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="white"
                    zIndex="10"
                >
                    <IconButton
                        size="xs"
                        aria-label="font minus"
                        icon={<MinusIcon color="black"/>}
                        onClick={() => setFontSize(v => Math.max(10, v - 2))}
                    />
                    <IconButton
                        size="xs"
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
                    {/*code mirror that contains the code*/}
                    <CodeMirror
                        value={code}
                        ref={editorRef}
                        theme={oneDark}
                        extensions={[
                            lineNumbers(),
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
        </Box>
    );
}
