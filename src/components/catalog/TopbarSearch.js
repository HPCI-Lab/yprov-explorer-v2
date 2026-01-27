import React, { useState, useRef, useEffect } from "react";
import { Flex, Input, Box, Icon, IconButton, Image } from "@chakra-ui/react";
import { SearchIcon, SunIcon } from "@chakra-ui/icons";
import { Calendar, MapIcon } from "lucide-react";
import TimeLine from "./TimeLineC";
import { useNavigate } from "react-router-dom";
import { searchCatalog } from "./Connection/FilterConnection";

export default function TopbarSearch({ onSearch, onTime }) {
  const [query, setQuery] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);

  const inputRef = useRef(null);
  const timelineRef = useRef(null);
  const navigate = useNavigate();

  const applySearch = () => {
    handleSearch(query);
  };

  const handleSearch = async (q) => {
    try {
      const data = await searchCatalog(q);
      if (onSearch) onSearch(data);
    } catch (err) {
      console.error("Errore nella ricerca:", err.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timelineRef.current && !timelineRef.current.contains(event.target)) {
        setShowTimeline(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Flex
      position="relative"
      h="100px"
      align="center"
      justify="space-between"
      bg="black"
      color="black"
      borderBottom="5px solid black"
      borderRight="5px solid black"
      px={4}
      zIndex={20}
    >
      <Image src="/logo.png" boxSize="40px" borderRadius="xl" />

      <Flex
        bg="white"
        w="60%"
        borderRadius="full"
        align="center"
        px={4}
        py={1}
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
        transition="box-shadow 0.2s ease, transform 0.15s ease"
        _focusWithin={{ boxShadow: "0 0 0 3px rgba(66,153,225,0.45)", transform: "scale(1.01)" }}
        position="relative"
      >
        <Icon as={SearchIcon} color="gray.500" cursor="pointer" mr={2} onClick={applySearch} />

        <Input
          ref={inputRef}
          placeholder="Search title, author, pid, keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          border="none"
          _focus={{ outline: "none", boxShadow: "none" }}
        />

        <Icon
          as={Calendar}
          boxSize={5}
          color="gray.600"
          cursor="pointer"
          ml={2}
          onClick={() => setShowTimeline((prev) => !prev)}
        />

        {showTimeline && (
          <Box
            ref={timelineRef}
            position="absolute"
            top="110%"
            right="10px"
            bg="white"
            p={3}
            borderRadius="md"
            boxShadow="lg"
            zIndex={40}
          >
            <TimeLine onFilter={onTime} />
          </Box>
        )}

        <Icon as={MapIcon} boxSize={5} color="gray.600" cursor="pointer" ml={2} onClick={() => navigate("/map")} />
      </Flex>

      <IconButton icon={<SunIcon />} aria-label="Toggle theme" bg="gray.700" borderRadius="xl" />
    </Flex>
  );
}
