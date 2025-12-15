import { Flex, Input, IconButton, Box } from "@chakra-ui/react";
import { SunIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/react"
import {useState} from "react";
import controller from "../../graph/GraphController";

/*
TopBar.js: Top bar component that contains main elements for navigation:
- searchbar for searching the nodes on the graph
- theme toggler button for changing the theme on preferences
*/
export default function TopBar() {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        controller.searchNode(query);
    };

    return (
        <Flex
            h="38px"
            align="center"
            justify="space-between"
            bg="gray.900"
            color="white"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            px="3"
        >
            {/*Logo container*/}
            <Flex align="center" justify="center" w="24px">
                <Image
                    src="logo.png"
                    boxSize="26px"
                    objectFit="contain"
                />
            </Flex>
            <Box flex="1" maxW="420px">
            {/*Search bar*/}
                <Input
                    size="sm"
                    placeholder="Search node..."
                    bg="gray.800"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _placeholder={{ color: "whiteAlpha.500" }}
                    _hover={{ borderColor: "whiteAlpha.300" }}
                    _focus={{ borderColor: "blue.400" }}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
            </Box>

            {/*Theme toggler*/}
            <Flex align="center" gap="1">
                <IconButton
                    size="xs"
                    icon={<SunIcon />}
                    aria-label="Toggle theme"
                />
            </Flex>
        </Flex>
    );
}
