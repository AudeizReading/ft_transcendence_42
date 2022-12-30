import {createContext} from 'react';
import getDatasCurrentTime from '../dep/getDatasCurrentTime'

export const TimeContext = createContext(getDatasCurrentTime());

export default TimeContext;