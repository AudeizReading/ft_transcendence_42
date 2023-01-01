import Box from '@mui/material/Box';
import {useState, useEffect, useContext} from 'react'

import {TimeContext} from '../contexts/TimeContext'

import formattingNumber from '../dep/formattingNumber';

function DateTime({component}: any)
{
  const timeData = useContext(TimeContext);
  const [date, setDate] = useState(timeData.curTime);
  const [tag, setTag] = useState(component);

  const [day, setDay] = useState(timeData.dayOfMonth);
  const [numDay, setNumDay] = useState(timeData.dayOfWeek);
  const [month, setMonth] = useState(timeData.month);
  const [year, setYear] = useState(timeData.year);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // update des jours
  useEffect(() => {day !== timeData.dayOfMonth && setDay(timeData.dayOfMonth)}, [timeData.dayOfMonth]);
  // update des jours
  useEffect(() => {numDay !== timeData.dayOfWeek && setNumDay(timeData.dayOfWeek)}, [timeData.dayOfWeek]);
  // update du mois
  useEffect(() => {month !== timeData.month && setMonth(timeData.month)}, [timeData.month]);
  // update de l'annee
  useEffect(() => {year !== timeData.year && setYear(timeData.year)}, [timeData.year]);

  //update de la box de display (comme ca si on un titre ou une div ou autre, c'est plus flexible et reutilisable)
  useEffect(() => {tag !== component && setTag(component)}, [component]);

  function formattingEnglishDate(day: number)
  {
    switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
    }
  }

  return (
    <Box component={tag}> 
      <Box component="span">{days[numDay]}</Box>
      <Box component="span"> {formattingNumber(day)}</Box>
      <Box component="sup">{formattingEnglishDate(day)}</Box>
      <Box component="span"> {months[month]}</Box>
      <Box component="span"> {year}</Box>   
    </Box>);
}

export default DateTime;