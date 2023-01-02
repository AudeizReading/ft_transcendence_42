import React from 'react';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { User } from '../interface/User';

import Footer from './Footer';
import Dashboard from '../component/Dashboard'

import Clock from '../component/Clock';
import DateTime from '../component/DateTime';
import AnalogicClock from '../component/AnalogicClock';

import UnstableGrid from '@mui/system/Unstable_Grid';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const BoxPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  minWidth: '14vw',
  minHeight: '14vw',
  maxWidth: '14vw',
  maxHeight: '14vw',
  ...theme.typography.body2,
  overflow: 'hidden',
  borderRadius: 10,
  '& > p': {
    margin: 0,
    padding: 0,
    fontSize: '3vi',
    fontWeight: 700,
    marginTop: '9.5vi',
    display: 'block',
    textAlign: 'center'
  }
}));

function Home(props: {
    loaded: boolean,
    fetch_userinfo: Function,
    user: User
  }) {
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
      <UnstableGrid container rowSpacing={{xs: 1, md: 2}} columnSpacing={{xs: 3, md: 6}} sx={{margin: 0, height: {xs: 'calc(100vh - 120px)', lg: 'calc(100vh - 90}px)'} }}>
        <UnstableGrid xs={6} md={8} xsOffset={3} mdOffset={4} sx={{textAlign: 'center'}}>
          <DateTime component="h2" time={time}/>
        </UnstableGrid>

        <UnstableGrid sx={{position: 'relative', width: '100%', mx: '2%', p: '1%'}}>
          <UnstableGrid xs={12} md={5} mdOffset={7} sx={{position: 'relative', display: 'flex', flexFlow: 'column', alignItems: 'center'}}>
            <AnalogicClock stress={true} time={time}/>
            <UnstableGrid xs={12} mdOffset={0} sx={{position: 'absolute', top: '62%', width: '100%', textAlign: 'center', zIndex: 10, color: 'black' }}>
              <Clock component="h6" time={time}/>
            </UnstableGrid>
          </UnstableGrid>

          <UnstableGrid rowSpacing={{xs: 4, md: 2}} xs={6} md={4} xsOffset={3} mdOffset={1} sx={{position: {md: 'absolute'}, top: {md: 0}, textAlign: {xs: 'center', md: 'left'}}}>
            <UnstableGrid>Hello Dear Visitor!</UnstableGrid>
            <UnstableGrid>{randomizeMessages()}</UnstableGrid>
            <UnstableGrid>Please Log In</UnstableGrid>
          </UnstableGrid>
        </UnstableGrid>
      </UnstableGrid>
  );

  return (
    <Box component="main" sx={{ height: '100vh', overflow: 'auto' }}>
      {isLogged === false ?
        <Fade in={true} timeout={400}>{gridNotLogged}</Fade>
        :
        <React.Fragment>
          <Box sx={{ display: 'flex', mt: '10vh', mx: 10, gap: '2vw' }}>
            <BoxPaper sx={{
              background: 'url(/res/pong/iceberg_full.png), url(https://www.desktopbackground.org/download/1152x864/2014/04/15/747399_ocean-water-night-backgrounds_1255x1024_h.jpg)',
              backgroundPosition: 'center 80%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100%, cover',
            }}>
              <Box component="p">JOUER</Box>
            </BoxPaper>
            <BoxPaper>
              <Box component="p">SCORE</Box>
            </BoxPaper>
            <BoxPaper>
              <Box component="p">SOCIAL</Box>
            </BoxPaper>
            <BoxPaper>
              <Box component="p">OPTION</Box>
            </BoxPaper>
          </Box>
        </React.Fragment>}
      {false && <Footer />}
    </Box>
  );
}
export default Home;
