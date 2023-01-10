import Box from '@mui/material/Box';
import {ElementType} from 'react'

import formattingNumber from '../dep/formattingNumber';

function formattingEnglishDate(day: number) {
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

function DateTime(props: {
  component: ElementType<any>,
  time: Date
})
{
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  return (
    <Box component={props.component}> 
      <Box component="span">{days[props.time.getDay()]}</Box>
      <Box component="span"> {formattingNumber(props.time.getDate())}</Box>
      <Box component="sup">{formattingEnglishDate(props.time.getDate())}</Box>
      <Box component="span"> {months[props.time.getMonth()]}</Box>
      <Box component="span"> {props.time.getFullYear()}</Box>   
    </Box>);
}

export default DateTime;
