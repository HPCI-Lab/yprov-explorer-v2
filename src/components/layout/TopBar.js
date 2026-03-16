import {
    Flex,
    Input,
    IconButton,
    Box,
    Menu,
    Text,
    MenuButton,
    MenuList,
    MenuItem,
    Divider,
    useColorMode
} from "@chakra-ui/react";
import { SunIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/react"
import {useState} from "react";
import controller from "../graph/graphController";
import UploadData from "../upload/UploadData";
import {MoonIcon} from "lucide-react";

/*
TopBar.js: Top bar component that contains main elements for navigation:
- searchbar for searching the nodes on the graph
- theme toggler button for changing the theme on preferences
*/

/**
 *
 * @param {Object} dataset - data file
 * @param {Object} onDatasetLoaded - current dataset
 * @returns {JSX.Element}
 * @constructor
 */

export default function TopBar({ dataset, onDatasetLoaded }) {
    //query states
    const [query, setQuery] = useState("");

    //calling the controller for the search
    const handleSearch = () => {
        controller.searchNode(query);
    };

    //Main layout
    return (
        <Flex h="38px" align="center" justify="space-between" color="white" borderBottom="1px solid" borderColor="black" px="3">
            {/*Logo container*/}
            <Flex align="center" gap="4">
                {/* Logo */}
                <Box w="26px" h="26px">
                    <Image src="logo.png" boxSize="26px" objectFit="contain" pointerEvents="none" borderRadius="md"/>
                </Box>
                {/* File menu */}
                <Menu>
                    <MenuButton
                        as={Text}
                        fontSize="sm"
                        cursor="pointer"
                        px="2"
                        py="1"
                        borderRadius="sm"
                        _hover={{ bg: "gray" }}
                        _expanded={{ bg: "gray" }}
                    >
                        File
                    </MenuButton>
                    <MenuList bg="black" borderColor="white" minW="180px" fontSize="sm">
                        <UploadData currentDataset={dataset} onDatasetLoaded={onDatasetLoaded}/>
                        <Divider />
                        <MenuItem bg="black">Close</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>

            <Box flex="1" maxW="420px">
            {/*Search bar*/}
                <Input
                    size="sm"
                    placeholder="Search node..."
                    border="1px solid"
                    borderColor="white"
                    bg="white"
                    color="black"
                    _placeholder={{ color: "black" }}
                    _hover={{ borderColor: "black" }}
                    _focus={{ borderColor: "blue.400" }}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
            </Box>
            {/*Theme toggler*/}
            <Flex align="center" gap="1">
                {/*
                <IconButton
                    size="xs"
                    aria-label="Toggle theme"
                    onClick={toggleColorMode}
                    icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
                    variant="ghost"
                />
                */}
            </Flex>
        </Flex>
    );
}
