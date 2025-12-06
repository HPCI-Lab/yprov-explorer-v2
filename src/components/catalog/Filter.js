/* Filter.js  
Component for filtering catalog items based on author, date range, and node type.
Utilizes Chakra UI for styling and layout.
*/

import React, { useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Filter = ({ onApplyFilters }) => {
  
  // Track filters input
  const [author, setAuthor] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [nodeType, setNodeType] = useState("");

  // Calls parent callback with current filter values
  const handleApply = () => {
    const filters = {
      author: author.trim(),
      dateFrom,
      dateTo,
      node: nodeType,
    };
    onApplyFilters(filters);
  };

  return (
 
      <Flex
        bg="gray.900"
        borderRight="5px solid black"
        color="white"
        display="flex" 
        justifyContent="space-between"
        alignItems="center"
        p="4"
        borderRadius="xl"
        borderLeft="5px solid black"
        
      > 

        <FormControl
          display="flex"
          alignItems="center"
          flex="1"
          ml={10}
        >
          <FormLabel> Author </FormLabel>

          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            size="sm"
            borderRadius="full"
            w="50%"                 
          />

        </FormControl>

        <FormControl
          display="flex"
          alignItems="center"
          flex="1"
          ml={10}    
        >
          <FormLabel> Date FROM </FormLabel>

          {/* DatePicker for selecting the start date */}
          <DatePicker
            selected={dateFrom}
            onChange={(date) => setDateFrom(date)}
            dateFormat="dd/MM/yyyy"
            customInput={
              <Input
                size="sm"
                borderRadius="full"
                w="50%"
              />
            }
          />
        </FormControl>

        <FormControl
          display="flex"
          alignItems="center"
          flex="1"
          ml={10}
        >
          <FormLabel> Date TO </FormLabel>

          <DatePicker 
            selected={dateTo} 
            onChange={(date) => setDateTo(date)} 
            dateFormat="dd/MM/yyyy" 
            customInput={ 
              <Input 
                size="sm"
                borderRadius="full"
                w="50%" 
              />
            }
            minDate={dateFrom}
           
          />
        </FormControl>

        <FormControl
          display="flex"
          alignItems="center"
          flex="1"
          ml={10}
        >
          <FormLabel> Type </FormLabel>
          
          {/* Select dropdown for node type */}
          <Select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value)}
            size="sm"
            borderRadius="full"
            w="50%"
            color="black"
          >
            <option value="">All</option>
            <option value="entity">Entity</option>
            <option value="activity">Activity</option>
          </Select>
        </FormControl>

        <Box 
          display="flex"
          alignItems="center"
          flex="1"
          ml={10}
        >

          <Button
            onClick={handleApply}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
            w="50%" 
          >
            Apply
          </Button>
        </Box>
      </Flex>

     
    
  );
};

export default Filter;
