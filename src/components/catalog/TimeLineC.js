/*
  Timeline component for filtering files based on date ranges.
*/

import { 
  Box, 
  RangeSlider, 
  RangeSliderTrack, 
  RangeSliderFilledTrack, 
  RangeSliderThumb,
  Flex,
  Text
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

function TimeLine({ onFilter }) {
  // Get current year
  const today = new Date();
  const currentYear = today.getFullYear();

  // State for year, month, and day ranges
  const [yearRange, setYearRange] = useState([2020, currentYear]);
  const [monthRange, setMonthRange] = useState([1, 12]);
  const [dayRange, setDayRange] = useState([1, 31]);
  // Month names for display
  const monthNames = [
    "Gen", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Effect to call onFilter whenever ranges change
  useEffect(() => {
    const from = new Date(yearRange[0], monthRange[0] - 1, dayRange[0]);
    const to = new Date(yearRange[1], monthRange[1] - 1, dayRange[1]);
    onFilter({ from, to });
  }, [yearRange, monthRange, dayRange, onFilter]);

  return (
    <Box w="100%" mx="auto" my={4} p={4} bg="#909492ff" borderRadius="xl">
      <Flex direction="column" gap={4}>
        <Box>
          <Text color="white" mb={1}>Year: {yearRange[0] === yearRange[1] ? yearRange[0] :  `${yearRange[0]} - ${yearRange[1]}`}</Text>
          <RangeSlider
            min={2010}
            max={currentYear}
            value={yearRange}
            onChange={(val) => setYearRange(val)}
          >
            {/* Year slider track */}
            <RangeSliderTrack>
              <RangeSliderFilledTrack bg="blue.600" />
            </RangeSliderTrack>
            <RangeSliderThumb index={0}/>
            <RangeSliderThumb index={1}/>
          </RangeSlider>
        </Box>

        {/* Month slider */}
        <Box>
          <Text color="white" mb={1}>Month: {monthRange[0] === monthRange[1] ? monthNames[monthRange[0]- 1] :  `${monthNames[monthRange[0] - 1]} – ${monthNames[monthRange[1] - 1]}`}</Text>
          <RangeSlider
            min={1}
            max={12}
            value={monthRange}
            onChange={(val) => setMonthRange(val)}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack bg="green.500" />
            </RangeSliderTrack>
            <RangeSliderThumb index={0}/>
            <RangeSliderThumb index={1}/>
          </RangeSlider>
        </Box>

        {/* Day slider */}
        <Box>
          <Text color="white" mb={1}>Day: {dayRange[0] === dayRange[1] ? dayRange[1] : `${dayRange[0]} – ${dayRange[1]}`}</Text>
          <RangeSlider
            min={1}
            max={31}
            value={dayRange}
            onChange={(val) => setDayRange(val)}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack bg="orange.400" />
            </RangeSliderTrack>
            <RangeSliderThumb index={0}/>
            <RangeSliderThumb index={1}/>
          </RangeSlider>
        </Box>
      </Flex>
    </Box>
  );
}

export default TimeLine;
