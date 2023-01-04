import React from 'react';
import { useState, useEffect, useContext } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Grid from '@mui/system/Unstable_Grid';

import { User } from '../interface/User';

import {TimeContext} from '../contexts/TimeContext';
import useWindowSize from '../hooks/useWindowSize';

import Footer from './Footer';

import Clock from '../component/Clock';
import DateTime from '../component/DateTime';
import AnalogicClock from '../component/AnalogicClock';

function Home(props: {user: User}) {

  const [user, setUser] = useState(props.user);
  const [isLogged, setIsLogged] = useState(user.connected);
  const windowHeight = useWindowSize().height;
  const timeData = useContext(TimeContext);
  
  useEffect(() => setUser(props.user), [user, props.user]);
  useEffect(() => setIsLogged(user.connected), [user.connected]);

  const customMessages = {
    notLogged: [
      "Why not throw a Pong Game ?", 
      "Try it is love it", 
      "There is already someone who is looking for playing with you!"
  ]};

  function randomizeMessages() {
    return (customMessages.notLogged[timeData.hours % (customMessages.notLogged.length - 1)]);
  }

  const gridNotLogged = (
      <Grid container rowSpacing={{xs: 1, md: 2}} columnSpacing={{xs: 3, md: 6}} sx={{height: {xs: windowHeight - 120, lg: windowHeight - 90}}}>
        <Grid xs={6} md={8} xsOffset={3} mdOffset={4} sx={{textAlign: 'center'}}>
          <DateTime component="h2"/>
        </Grid>

        <Grid sx={{position: 'relative', width: '100%', mx: '2%', p: '1%'}}>
          <Grid xs={12} md={5} mdOffset={7} sx={{position: 'relative', display: {xs: 'none', sm: 'flex'}, flexFlow: 'column', alignItems: 'center'}}>
            <AnalogicClock stress={true}/>
            <Grid xs={12} mdOffset={0} sx={{position: 'absolute', top: '62%',width: '100%', textAlign: 'center', zIndex: 10}}>
              <Clock component="h6"/>
            </Grid>
          </Grid>

          <Grid rowSpacing={{xs: 4, md: 2}} xs={6} md={4} xsOffset={3} mdOffset={1} sx={{position: {md: 'absolute'}, top: {md: 0}, textAlign: {xs: 'center', md: 'left'}}}>
            <Grid>Hello Dear Visitor!</Grid>
            <Grid>{randomizeMessages()}</Grid>
            <Grid>Please Log In</Grid>
          </Grid>
        </Grid>
      </Grid>
  );

  return (
    <Box component="main" sx={{ backgroundColor: "green", height: windowHeight, overflow: 'hidden' }}>
      {isLogged === false && <Fade in={true} timeout={400}>{gridNotLogged}</Fade>}
      <Footer />
    </Box>
  );
}
export default Home;
