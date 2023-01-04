import React from 'react';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Grid from '@mui/system/Unstable_Grid';

import { User } from '../interface/User';

import Footer from './Footer';

import Clock from '../component/Clock';
import DateTime from '../component/DateTime';
import AnalogicClock from '../component/AnalogicClock';

function Home(props: {user: User}) {
  const [user, setUser] = useState(props.user);
  const [isLogged, setIsLogged] = useState(user.connected);
  
  useEffect(() => setUser(props.user), [user, props.user]);
  useEffect(() => setIsLogged(user.connected), [user.connected]);

  const customMessages = {
    notLogged: [
      "Why not throw a Pong Game ?", 
      "Try it is love it", 
      "There is already someone who is looking for playing with you!"
  ]};

  function randomizeMessages() {
    return (customMessages.notLogged[new Date().getHours() % (customMessages.notLogged.length - 1)]);
  }

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    })
    return () => clearInterval(interval);
  }, [time])

  const gridNotLogged = (
      <Grid container rowSpacing={{xs: 1, md: 2}} columnSpacing={{xs: 3, md: 6}} sx={{margin: 0, height: {xs: 'calc(100vh - 120px)', lg: 'calc(100vh - 90}px)'}}}>
        <Grid xs={6} md={8} xsOffset={3} mdOffset={4} sx={{textAlign: 'center'}}>
          <DateTime component="h2" time={time}/>
        </Grid>

        <Grid sx={{position: 'relative', width: '100%', mx: '2%', p: '1%'}}>
          <Grid xs={12} md={5} mdOffset={7} sx={{position: 'relative', display: 'flex', flexFlow: 'column', alignItems: 'center'}}>
            <AnalogicClock stress={true} time={time}/>
            <Grid xs={12} mdOffset={0} sx={{position: 'absolute', top: '62%', width: '100%', textAlign: 'center', zIndex: 10}}>
              <Clock component="h6" time={time}/>
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
    <Box component="main" sx={{ height: '100vh', overflow: 'auto' }}>
      {isLogged === false && <Fade in={true} timeout={400}>{gridNotLogged}</Fade>}
      <Footer />
    </Box>
  );
}
export default Home;
