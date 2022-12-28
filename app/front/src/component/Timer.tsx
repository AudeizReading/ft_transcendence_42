import Box from '@mui/material/Box'
import useInterval from '../hooks/useInterval'
import formattingNumber from '../dep/formattingNumber';
import {useState} from 'react'

function Timer()
{
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return (
    <Box component="span">{formattingNumber(count)} seconds are elapsed since </Box>);
}

export default Timer;