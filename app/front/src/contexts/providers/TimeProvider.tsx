import { useState, useEffect } from 'react';

import { TimeContext } from '../TimeContext';
import getDatasCurrentTime from '../dep/getDatasCurrentTime';

import useInterval from '../../hooks/useInterval';


export default function TimeProvider(props: any) {
  const [timeData, setTimeData] = useState(getDatasCurrentTime());
  const [sec, setSec] = useState(0);

  useInterval(() => {setSec(sec + 1)}, 1000);

  useEffect(() => {
      let curTime = new Date();
      setTimeData({...timeData, curTime, seconds: curTime.getSeconds()});
  }, [sec]);

  useEffect(() => {
    timeData.seconds === 0 && setTimeData({...timeData, minutes: new Date().getMinutes()});
  }, [timeData.seconds]);

  useEffect(() => {
    timeData.minutes === 0 && timeData.seconds === 0 && setTimeData({...timeData, hours: new Date().getHours()});
  }, [timeData.minutes]);

  useEffect(() => {
    timeData.hours === 0 && 
    timeData.minutes === 0 && 
    timeData.seconds === 0 &&
    setTimeData({...timeData, dayOfMonth: new Date().getDate()});
  }, [timeData.hours]);

  useEffect(() => {
    timeData.hours === 0 && 
    timeData.minutes === 0 && 
    timeData.seconds === 0 &&
    setTimeData({...timeData, dayOfWeek: new Date().getDay()});
  }, [timeData.hours]);

  useEffect(() => {
    timeData.dayOfMonth === 1 &&
    timeData.hours === 0 && 
    timeData.minutes === 0 && 
    timeData.seconds === 0 &&
    setTimeData({...timeData, month: new Date().getMonth() + 1});
  }, [timeData.dayOfMonth]);

  useEffect(() => {
    timeData.month === 1 &&
    timeData.dayOfMonth === 1 &&
    timeData.hours === 0 && 
    timeData.minutes === 0 && 
    timeData.seconds === 0 &&
    setTimeData({...timeData, year: new Date().getFullYear()});
  }, [timeData.month]);

  return (
    <TimeContext.Provider value={timeData}>
      {props.children}
    </TimeContext.Provider>
    );
}