import { useState, useEffect } from 'react';

import { TimeContext } from '../TimeContext';
import getDatasCurrentTime from '../dep/getDatasCurrentTime';

import useInterval from '../../hooks/useInterval';

export default function TimeProvider(props: any) {
  const [timeData, setTimeData] = useState(getDatasCurrentTime());
  const [sec, setSec] = useState(0);

  useInterval(() => {setSec(sec + 1)}, 1000);

  useEffect(() => {
      setTimeData(getDatasCurrentTime());
  }, [sec]);

  return (
    <TimeContext.Provider value={timeData}>
      {props.children}
    </TimeContext.Provider>
    );
}