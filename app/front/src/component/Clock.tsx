import Box from '@mui/material/Box';
import {useState, useEffect, useRef} from 'react'
import useInterval from '../hooks/useInterval';
import formattingNumber from '../dep/formattingNumber';
import Timer from '../component/Timer';
import AnalogicClock from '../component/AnalogicClock'

function Clock()
{
  const [date, setDate] = useState(new Date());

  const [hours, setHours] = useState(date.getHours());
  const [minutes, setMinutes] = useState(date.getMinutes());
  const [secondes, setSecondes] = useState(date.getSeconds());

  const [day, setDay] = useState(date.getDate());
  const [numDay, setNumDay] = useState(date.getDay());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [year, setYear] = useState(date.getFullYear());

  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  // update des secondes a chaque seconde
  useInterval(() => setSecondes(new Date().getSeconds()), 1000);

  // update des minutes
  useEffect(() => {secondes === 0 && setMinutes(new Date().getMinutes())}, [secondes]);
  // update des heures
  useEffect(() => {minutes === 0 && secondes === 0 && setHours(new Date().getHours())}, [minutes]);

  // update des jours
  useEffect(() => {
    if (hours === 0 && minutes === 0 && secondes === 0)
    {
      setDay(new Date().getDate());
      setNumDay(new Date().getDay());
    }
  }, [hours]);

  // update du mois
  useEffect(() => {day === 1 && hours === 0 && minutes === 0 && secondes === 0 && setMonth(new Date().getMonth() + 1)}
    , [day]);

  // update de l'annee
  useEffect(() => {month === 1 && day === 1 && hours === 0 && minutes === 0 && secondes === 0 && setYear(new Date().getFullYear())}
    , [month]);

  return (
    <Box component="div" sx={{display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Box component="h2">
        <Box component="span">{days[numDay]}</Box>
        <Box component="span"> {formattingNumber(day)}</Box>
        <Box component="span">/{formattingNumber(month)}</Box>
        <Box component="span">/{year}</Box>   
      </Box>
      <Box component="h3">
        <Box component="span">{formattingNumber(hours)}</Box> 
        <Box component="span">:{formattingNumber(minutes)}</Box>
        <Box component="span">:{formattingNumber(secondes)}</Box>
      </Box>
    </Box>);
}

export default Clock;