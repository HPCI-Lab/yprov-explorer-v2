import { Flex, Input, IconButton } from "@chakra-ui/react";
import { SunIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/react";

/*
TopBar.js: Top bar component that contains main elements for navigation:
- searchbar for searching the nodes on the graph
- theme toggler button for changing the theme on preferences
*/

export default function TopBar() {
    return (
        <Flex
            h="60px"
            align="center"
            justify="space-between"
            bg="black"
            color="white"
            borderRight="5px solid black"
            borderBottom="5px solid black"
        >
            {/*Logo container*/}
            <Flex align="center" justify="center" w="70px">
                <Image src="/logo.png" boxSize="40px" borderRadius="xl" aspectRatio={16 / 9} borderLeft="5px white"/>
            </Flex>
            <Flex flex="1" justify="center" gap="5"  mx="20px">
                {/*Search bar*/}
                <Input
                    placeholder="Search"
                    w="50%"
                    bg="white"
                    borderRadius="xl"
                    _placeholder={{ color: "gray.400" }}
                />
            </Flex>
            {/*Theme toggler*/}
            <IconButton
                icon={<SunIcon />}
                aria-label="Toggle theme"
                bg="gray.700"
                borderRadius="xl"
            />
        </Flex>
    );
}
