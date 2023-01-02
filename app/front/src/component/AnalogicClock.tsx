import {useState, useEffect} from 'react'
import Box from '@mui/material/Box'

<<<<<<< HEAD
function AnalogicClock(props: {
  stress: boolean,
  time: Date
})
=======
import {TimeContext} from '../contexts/TimeContext';

function AnalogicClock(props: any)
>>>>>>> Home: fix height props with the css related instead js
{
  const [pressure, setPressure] = useState(props.stress);

  const styleNeutral = {
    position: 'relative',
    width: '100%'
  };

  const styleClock = {
    ...styleNeutral,
  };

<<<<<<< HEAD
  const [styleWrap] = useState({
=======
  const styleWrap = {
>>>>>>> Home: fix height props with the css related instead js
    position: 'relative',
    borderRadius: '50%',
    backgroundColor: '#fff',
    borderBottom: '5px solid #def',
    borderLeft: '5px solid #eee',
    borderTop: '5px solid #eee',
    borderRight: '5px solid #dee',
    boxShadow: 'inset 2px 3px 8px 3px rgba(0, 0, 0, 0.6)',
<<<<<<< HEAD
    width: '33vh',
    height: '33vh',
    maxWidth: 351,
    minWidth: 99,
    maxHeight: 351,
    minHeight: 99,
    display: 'block',
    transition: 'height 0.15s ease-in-out, width 0.15s ease-in-out',
    m: 'auto'
  } as any);
=======
    width: 'calc(100vh / 3)',
    height: 'calc(100vh / 3)',
    display: {xs: 'none', sm: 'block'},
    transition: '',
    m: 'auto'
  };
>>>>>>> Home: fix height props with the css related instead js

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

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setStyleNeedleSecond({...styleNeedleSecond, transform: `rotate(${time.getSeconds() * 6}deg)`})
      setStyleNeedleMinute({...styleNeedleMinute, transform: `rotate(${time.getMinutes() * 6}deg)`})
      setStyleNeedles({...styleNeedles, transform: `rotate(${time.getHours() * 30}deg)`})
    })
    return () => clearInterval(interval);
  }, [time, styleNeedleSecond, styleNeedleMinute, styleNeedles])
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
  useEffect(() => {
    if (pressure === false) {
      setStyleTic({...styleTic, display: {xs: 'none', sm: 'none'}})
      setStyleTac({...styleTac, display: {xs: 'none', sm: 'none'}})
    }
  }, [pressure, styleTic, styleTac]);

  return (
    <Box component="div" sx={styleClock}>
      <Box component="div" sx={styleNeutral}>
        <Box component="span" sx={styleTic}>{(time.getSeconds() % 2) === 1 && "TIC"}</Box>
      </Box>
      <Box component="div" sx={styleWrap}>
        <Box component="span" sx={styleNeedles}></Box> 
        <Box component="span" sx={styleNeedleMinute}></Box>
        <Box component="span" sx={styleNeedleSecond}></Box>
        <Box component="span" sx={styleCenterClock}></Box>
      </Box>
      <Box component='div' sx={styleNeutral}>
        <Box component="span" sx={styleTac}>{(time.getSeconds() % 2) === 0 && "TAC"}</Box>
      </Box>
    </Box>);
}

export default AnalogicClock;
