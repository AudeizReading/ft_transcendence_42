import {useState, useEffect, useContext} from 'react'
import Box from '@mui/material/Box'

import {TimeContext} from '../contexts/TimeContext';
import useWindowSize from '../hooks/useWindowSize';

function AnalogicClock(props: any)
{
  const timeData = useContext(TimeContext);

  const [seconds, setSeconds] = useState(timeData.seconds);
  const [minutes, setMinutes] = useState(timeData.minutes);
  const [hours, setHours] = useState(timeData.hours);

  const [pressure, setPressure] = useState(props.stress);
  const windowHeight = useWindowSize().height;
  const [clockDiameter, setClockDiameter] = useState(Math.round(windowHeight / 3));

  const styleNeutral = {
    position: 'relative',
    width: '100%'
  };

  const styleClock = {
    ...styleNeutral,
  };

  const [styleWrap, setStyleWrap] = useState({
    position: 'relative',
    borderRadius: '50%',
    backgroundColor: '#fff',
    borderBottom: '5px solid #def',
    borderLeft: '5px solid #eee',
    borderTop: '5px solid #eee',
    borderRight: '5px solid #dee',
    boxShadow: 'inset 2px 3px 8px 3px rgba(0, 0, 0, 0.6)',
    width: clockDiameter,
    height: clockDiameter,
    display: {xs: 'none', sm: 'block'},
    transition: '',
    m: 'auto'
  });

  const [styleNeedles, setStyleNeedles] = useState({
    position: 'absolute',
    width: '2.1%',
    height: '30%',
    m: 'auto',
    top: '-30%',
    left: 0,
    bottom: 0,
    right: 0,
    transformOrigin: 'bottom center',
    transform: 'rotate(0deg)',
    boxShadow: '-3px -3px 18px 0px rgba(0, 0, 0, 0.4)',
    backgroundColor: 'black',
  });

  const [styleNeedleMinute, setStyleNeedleMinute] = useState({
    ...styleNeedles,
    position: 'absolute',
    height: '40%',
    width: '1.2%',
    top: '-40%',
    left: 0,
    boxShadow: '-2px -2px 20px 1px rgba(0, 0, 0, 0.4)',
    transform: 'rotate(90deg)'
  });

  const [styleNeedleSecond, setStyleNeedleSecond] = useState({
    position: 'absolute',
    height: '28%',
    width: '0.7%',
    m: 'auto',
    top: '-28%',
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: '1.4%',
    backgroundColor: '#ff4b3e',
    transformOrigin: 'bottom center',
    boxShadow: '-2px -2px 20px 1px rgba(0, 0, 0, 0.25)',
    transform: 'rotate(180deg)'
  });

  const styleCenterClock = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '2.5%',
    height: '2.5%',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: '0.15em solid #1b1b1b',
    m: 'auto'
  };

  // update des secondes
  useEffect(() => {seconds !== timeData.seconds && setSeconds(timeData.seconds)}, [timeData.seconds]);
  // update des minutes
  useEffect(() => {minutes !== timeData.minutes && setMinutes(timeData.minutes)}, [timeData.minutes]);
  // update des heures
  useEffect(() => {hours !== timeData.hours && setHours(timeData.hours)}, [timeData.hours]);

  useEffect(() => {
    setClockDiameter(Math.round(windowHeight / 3))
  }, [windowHeight]);

  useEffect(() => {
    if (clockDiameter < 351 && clockDiameter > 99)
      setStyleWrap({...styleWrap, width: clockDiameter, height: clockDiameter, transition: 'height 0.15s ease-in-out, width 0.15s ease-in-out'})
  }, [clockDiameter]);

  // update de l'aiguille des secondes
  useEffect(() => setStyleNeedleSecond({...styleNeedleSecond, transform: `rotate(${seconds * 6}deg)`}), [seconds]);
  // update de l'aiguille des minutes
  useEffect(() => setStyleNeedleMinute({...styleNeedleMinute, transform: `rotate(${minutes * 6}deg)`}), [minutes]);
  // update de l'aiguille des heures
  useEffect(() => setStyleNeedles({...styleNeedles, transform: `rotate(${hours * 30}deg)`}), [hours]);

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
  useEffect(() => {props.stress === true && setPressure(true)}, [props.stress]);
  useEffect(() => {pressure === false && setStyleTic({...styleTic, display: {xs: 'none', sm: 'none'}})}, [pressure]);
  useEffect(() => {pressure === false && setStyleTac({...styleTac, display: {xs: 'none', sm: 'none'}})}, [pressure]);


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

export default AnalogicClock;