/* TopbarSearch.js
   Search bar component with filter suggestions and timeline filter.
   Fully compatible with backend at http://localhost:8002/docs
*/

import React, { useState, useRef, useEffect } from "react";
import { Flex, Input, Box, Icon, IconButton, Image } from "@chakra-ui/react";
import { SearchIcon, SunIcon } from "@chakra-ui/icons";
import { Calendar, MapIcon } from "lucide-react";
import TimeLine from "./TimeLineC";
import { useNavigate } from "react-router-dom";

// Suggestion keywords for filtering
const SUGGESTIONS = [
  "author",
  "pid",
  "keyword",
  "type",
  "version",
  "parent pid",
  "yProv instance",
];

// Mapping UI filter → backend parameter
const FILTER_TO_PARAM = {
  author: "author",
  pid: "pid",
  keyword: "keyword",
  version: "version",
  "parent pid": "parent_pid",
  type: "type",
  "yProv instance": "yprov_instance",
};

export default function TopbarSearch({ onSearch, onTime }) {
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const timelineRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
      if (timelineRef.current && !timelineRef.current.contains(event.target)) {
        setIsTimelineOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions based on input type
  const filteredSuggestions = SUGGESTIONS.filter((s) => {
    if (query === "") return true;
    if (/^\d+$/.test(query)) {
      return ["pid", "version", "parent pid"].includes(s);
    }
    return !["pid", "version", "parent pid"].includes(s);
  });

  // Apply search: translates UI filter to backend parameter
  const apply = () => {
    if (!query || query.trim() === "") return;

    if (activeFilter) {
      const backendParam = FILTER_TO_PARAM[activeFilter];
      onSearch({ [backendParam]: query });
    } else {
      onSearch({ query });
    }
  };

  // Select suggestion from dropdown
  const selectSuggestion = (s) => {
    setActiveFilter(s);
    setShowMenu(false);
  };

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
      {/* LOGO */}
      <Image src="/logo.png" boxSize="40px" borderRadius="xl" />

      {/* SEARCH BAR */}
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
        _focusWithin={{
          boxShadow: "0 0 0 3px rgba(66,153,225,0.45)",
          transform: "scale(1.01)",
        }}
        position="relative"
      >
        <Icon as={SearchIcon} color="gray.500" cursor="pointer" mr={2} onClick={apply} />

        {activeFilter && (
          <Flex
            px={2}
            py={1}
            bg="gray.200"
            borderRadius="md"
            fontSize="sm"
            fontWeight="bold"
            align="center"
            mr={2}
            whiteSpace="nowrap"
          >
            {activeFilter}:
            <Box ml={2} fontWeight="bold" cursor="pointer" onClick={() => setActiveFilter(null)}>
              ✕
            </Box>
          </Flex>
        )}

        <Input
          ref={inputRef}
          placeholder={activeFilter ? `Insert value for ${activeFilter}…` : "Search title, author, pid, keyword…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowMenu(!activeFilter);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
            if (activeFilter && e.key === "Backspace" && query === "") e.preventDefault();
          }}
          onClick={() => !activeFilter && setShowMenu(true)}
          border="none"
          _focus={{ outline: "none", boxShadow: "none" }}
        />

        {/* TIMELINE ICON */}
        <Icon
          as={Calendar}
          boxSize={5}
          color="gray.600"
          cursor="pointer"
          ml={2}
          onClick={() => setIsTimelineOpen((prev) => !prev)}
        />

        {isTimelineOpen && (
          <Box ref={timelineRef} position="absolute" top="110%" right="10px" bg="white" p={3} borderRadius="md" boxShadow="lg" zIndex={40}>
            <TimeLine onFilter={onTime} />
          </Box>
        )}

        {/* MAP ICON */}
        <Icon as={MapIcon} boxSize={5} color="gray.600" cursor="pointer" ml={2} onClick={() => navigate("/map")} />

        {/* FILTER DROPDOWN */}
        {showMenu && !activeFilter && (
          <Box ref={menuRef} position="absolute" top="110%" left="0" bg="white" w="100%" p={2} borderRadius="md" boxShadow="md" zIndex={40} color="black">
            {filteredSuggestions.map((s, idx) => (
              <React.Fragment key={idx}>
                <Box p="2" borderRadius="md" _hover={{ bg: "gray.200", cursor: "pointer" }} onClick={() => selectSuggestion(s)}>
                  {s}
                </Box>
                {idx < filteredSuggestions.length - 1 && <Box h="1px" bg="gray.300" my="1" w="95%" mx="auto" />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Flex>

      {/* THEME BUTTON */}
      <IconButton icon={<SunIcon />} aria-label="Toggle theme" bg="gray.700" borderRadius="xl" />
    </Flex>
  );
}
