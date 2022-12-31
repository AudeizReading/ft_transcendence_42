import Box from '@mui/material/Box';
import {useState, useEffect, useContext} from 'react'

import {TimeContext} from '../contexts/TimeContext'

import formattingNumber from '../dep/formattingNumber';

function Clock({component}: any)
{
  const timeData = useContext(TimeContext);
  const [date, setDate] = useState(timeData.curTime);
  const [tag, setTag] = useState(component);

  const [hours, setHours] = useState(timeData.hours);
  const [minutes, setMinutes] = useState(timeData.minutes);
  const [seconds, setSeconds] = useState(timeData.seconds);

  // update des secondes
  useEffect(() => {seconds !== timeData.seconds && setSeconds(timeData.seconds)}, [timeData.seconds]);
  // update des minutes
  useEffect(() => {minutes !== timeData.minutes && setMinutes(timeData.minutes)}, [timeData.minutes]);
  // update des heures
  useEffect(() => {hours !== timeData.hours && setHours(timeData.hours)}, [timeData.hours]);

  //update de la box de display (comme ca si on un titre ou une div ou autre, c'est plus flexible et reutilisable)
  useEffect(() => {tag !== component && setTag(component)}, [component]);

  return (
    <Box component="div" sx={{display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Box component={tag}>
        <Box component="span">{formattingNumber(hours)}</Box> 
        <Box component="span">:{formattingNumber(minutes)}</Box>
        <Box component="span">:{formattingNumber(seconds)}</Box>
      </Box>
    </Box>);
}

export default Clock;