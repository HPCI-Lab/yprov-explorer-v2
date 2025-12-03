import { Box, VStack, IconButton } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { Home, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";

/*
Sidebar.js: Sidebar component for representing all the panels feature
*/
export default function Sidebar({ onOpenPanel, homeRoute }) {
  const navigate = useNavigate();
  return (
    <Box
      w="70px"
      bg="gray.900"
      borderRight="5px solid black"
      color="white"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      p="4"
      borderRadius="xl"
      borderLeft="5px solid black"
    >
      <VStack spacing="4">
        <IconButton
          icon={<Home />}
          aria-label="menu"
          bg="gray.700"
          borderRadius="xl"
          onClick={() => navigate(homeRoute || "/catalog")}
        />
        <IconButton
          icon={<Paperclip />}
          aria-label="input"
          bg="gray.700"
          borderRadius="xl"
          onClick={() => {
            navigate("/");
            onOpenPanel("input");}}
        />
       
      </VStack>
      <IconButton
        icon={<SettingsIcon />}
        aria-label="bottom-settings"
        bg="gray.700"
        borderRadius="xl"
        onClick={() => onOpenPanel("settings")}
      />
    </Box>
  );
}