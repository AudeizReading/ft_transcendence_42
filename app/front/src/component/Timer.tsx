import Box from '@mui/material/Box'
import useInterval from '../hooks/useInterval'
import formattingNumber from '../dep/formattingNumber';
import {useState, useEffect} from 'react'

function Timer()
{
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(count % 60);
  const [minutes, setMinutes] = useState(Math.floor(count / 60));
  const [hours, setHours] = useState(Math.floor(count / 3600));

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  useEffect(() => setSeconds(count % 60), [count]);
  useEffect(() => {seconds === 0 && setMinutes(Math.floor((count / 60) % 60))}, [seconds]);
  useEffect(() => {minutes === 0 && setHours(Math.floor((count / 3600) % 3600))}, [minutes]);

  return (
    <Box component="div">
      <Box component="div">
        <Box component="span">{formattingNumber(hours)}:</Box>
        <Box component="span">{formattingNumber(minutes)}:</Box>
        <Box component="span">{formattingNumber(seconds)}</Box>
      </Box>
    </Box>
    );
}

export default Timer;