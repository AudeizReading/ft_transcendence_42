import {useState, useEffect} from 'react'
import Box from '@mui/material/Box'

function DigitalClock(props: any)
{
  const [seconds, setSeconds] = useState(props.sec);
  const [minutes, setMinutes] = useState(props.min);
  const [hours, setHours] = useState(props.hrs);
  const [pressure, setPressure] = useState(props.stress);

  const styleNeutral = {
    position: 'relative',
    width: '100%'
  };

  const styleClock = {
    ...styleNeutral,
    border: '5px solid red',
  };

  const styleWrap = {
    position: 'relative',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '5px solid white',
    boxShadow: 'inset 2px 3px 8px 0 rgba(0, 0, 0, 0.1)',
    width: {xs: 50, sm: 100, md: 200},
    height: {xs: 50, sm: 100, md: 200},
    display: {xs: 'none', sm: 'block'},
    m: 'auto'
  };

  const [styleNeedles, setStyleNeedles] = useState({
    position: 'absolute',
    width: '2.1%',
    height: '30%',
    m: 'auto',
    top: '-27%',
    left: 0,
    bottom: 0,
    right: 0,
    transformOrigin: 'bottom center',
    transform: 'rotate(0deg)',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.4)',
    backgroundColor: 'black'
  });

  const [styleNeedleMinute, setStyleNeedleMinute] = useState({
    ...styleNeedles,
    position: 'absolute',
    height: '40%',
    width: '1.2%',
    top: '-38%',
    left: 0,
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.4)',
    transform: 'rotate(90deg)'
  });

  const [styleNeedleSecond, setStyleNeedleSecond] = useState({
    position: 'absolute',
    height: '28%',
    width: '0.7%',
    m: 'auto',
    top: '-26%',
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: '1.4%',
    backgroundColor: '#ff4b3e',
    transformOrigin: 'bottom center',
    transform: 'rotate(180deg)'
  });

  const styleCenterClock = {
    position: 'absolute',
    top: {xs: '47.5%', md: '48.5%'},
    left: 0,
    bootom: 0,
    right: 0,
    width: '2.5%',
    height: '2.5%',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: '0.15em solid #1b1b1b',
    m: 'auto'
  };

  // update des secondes
  useEffect(() => {seconds !== props.sec && setSeconds(props.sec)}, [props.sec]);

  // update des minutes
  useEffect(() => {minutes !== props.min && setMinutes(props.min)}, [props.min]);

  // update des heures
  useEffect(() => {hours !== props.hrs && setHours(props.hrs)}, [props.hrs]);

  // update de l'aiguille des secondes
  useEffect(() => setStyleNeedleSecond({...styleNeedleSecond, transform: `rotate(${seconds * 6}deg)`})
  , [seconds]);

  // update de l'aiguille des minutes
  useEffect(() => {
    setStyleNeedleMinute({...styleNeedleMinute, transform: `rotate(${minutes * 6}deg)`});
  }, [minutes]);

  // update de l'aiguille des heures
  useEffect(() => {
    setStyleNeedles({...styleNeedles, transform: `rotate(${hours * 30}deg)`});
  }, [hours]);

  const [styleTic, setStyleTic] = useState({
    display: {xs: 'none', sm: 'block'},
    position: 'absolute',
    top: 0,
    transform: 'rotate(-45deg)',
    p: 'auto',
    m: '10%'
  });

  const [styleTac, setStyleTac] = useState({
    display: {xs: 'none', sm: 'block'},
    position: 'absolute',
    bottom: 0,
    right: '0%',
    transform: 'rotate(45deg)',
    p: 'auto',
    m: '10%'
  });

// On peut choisir de mettre la pression au visiteur, dans ce cas un TIC TAC apparait a cote de l'horloge
  useEffect(() => {
    props.stress === true && setPressure(true);
  }, [props.stress]);

  useEffect(() => {
    if (pressure === false)
      setStyleTic({...styleTic, display: {xs: 'none', sm: 'none'}});
  }, [pressure]);

  useEffect(() => {
    if (pressure === false)
      setStyleTac({...styleTac, display: {xs: 'none', sm: 'none'}});
  }, [pressure]);


  return (
    <Box component="div" sx={styleClock}>
      <Box component="div" sx={styleNeutral}>
        <Box component="span" sx={styleTic}>{(seconds % 2) === 1 && "TIC"}</Box>
      </Box>
      <Box component="div" sx={styleWrap}>
        <Box component="span" sx={styleNeedles}></Box> 
        <Box component="span" sx={styleNeedleMinute}></Box>
        <Box component="span" sx={styleNeedleSecond}></Box>
        <Box component="span" sx={styleCenterClock}></Box>
      </Box>
      <Box component='div' sx={styleNeutral}>
        <Box component="span" sx={styleTac}>{(seconds % 2) === 0 && "TAC"}</Box>
      </Box>
    </Box>);
}

export default DigitalClock;