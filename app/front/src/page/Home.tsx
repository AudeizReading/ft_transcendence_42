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

import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import { fetch_opt } from '../dep/fetch'

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const BoxPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  textShadow: '0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 2px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C, 0 0 1px #3F528C',
  minWidth: '14vw',
  minHeight: '14vw',
  maxWidth: '14vw',
  maxHeight: '14vw',
  ...theme.typography.body2,
  overflow: 'hidden',
  borderRadius: '10%',
  border: '1px solid #027368',
  boxShadow: '1px -4px 12px #3F528C',
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

  const test = async () => {
    await fetch('http://' + window.location.hostname + ':8190/user/' + user.id.toString(), fetch_opt()).then(result => console.log(result));
  };
  //test();
  
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
      <UnstableGrid container rowSpacing={{xs: 1, md: 2}} columnSpacing={{xs: 3, md: 6}} sx={{margin: 0, height: {xs: 'calc(100vh - 120px)', lg: 'calc(100vh - 90}px)'},}}>
        <UnstableGrid xs={6} md={8} xsOffset={3} mdOffset={4} sx={{textAlign: 'center',}}>
          <DateTime component="h2" time={time}/>
        </UnstableGrid>

        <UnstableGrid sx={{position: 'relative', width: '100%', mx: '2%', p: '1%'}}>
          <UnstableGrid xs={8} sm={5} xsOffset={2} smOffset={7} 
            sx={{
              position: 'relative', 
              display: 'flex', 
              flexFlow: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <AnalogicClock stress={true} time={time}/>
              <UnstableGrid xs={12} smOffset={0} 
                sx={{
                  position: 'absolute', 
                  top: '6vh', 
                  width: '100%', 
                  textAlign: 'center', 
                  zIndex: 10, 
                  color: '#024959' 
                }}>
                <Clock component="h6" time={time}/>
              </UnstableGrid>
          </UnstableGrid>

          <UnstableGrid rowSpacing={{xs: 4, sm: 2}} xs={6} sm={7} xsOffset={3} smOffset='auto' 
            sx={{
              position: {sm: 'absolute'}, 
              top: {sm: 0}, 
              textAlign: {xs: 'center', sm: 'left'},
            }}>
            <UnstableGrid component='h1'>Hello Dear Visitor!</UnstableGrid>
            <UnstableGrid component='blockquote' sx={{fontStyle: 'italic'}}>{randomizeMessages()}</UnstableGrid>
            <UnstableGrid component='div' sx={{textAlign: {sm: 'right', md: 'left'}, fontWeight: 'bold', fontSize: '1.5em', textTransform: 'uppercase',}}>Please Log In</UnstableGrid>
          </UnstableGrid>
        </UnstableGrid>
      </UnstableGrid>
  );

  const datasBoxPaper = [
    {
      sx: {
        background: 'url(/res/pong/iceberg_full.png), url(https://www.desktopbackground.org/download/1152x864/2014/04/15/747399_ocean-water-night-backgrounds_1255x1024_h.jpg)',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%, cover',
      },
      child: {sx: {},},
      name:'JOUER',
      url: '/play',
      uid: 'play',
    },
    {
      sx: 
      {
        background: 'url(https://www.desktopbackground.org/p/2015/09/06/1007039_aurora-borealis-iphone-wallpapers-wallpaper_1920x1200_h.jpg)',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        transform: 'rotate3d(0, 1, 0, 180deg)',
        boxShadow: '1px -4px 12px #3F528C',
      },
      child: {
        sx: {
          transform: 'rotate3d(0, 1, 0, 180deg)',
        },
      },
      name:'SCORES',
      url: '/score',
      uid: 'score',
    },
    {
      sx: {
        background: 'url(https://www.desktopbackground.org/p/2014/03/04/726085_penguin-wallpapers-1280x800-wallpapers-penguin-1280x800-wallpapers_1280x800_h.jpg)',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      },
      child: {sx:{},},
      name: 'AMIS',
      url: '/friend',
      uid: 'friend',
    },
    {
      sx: {
        background: 'url(https://www.desktopbackground.org/download/o/2011/08/14/250058_aurora-borealis-from-space-wallpaper_1920x1080_h.jpg)',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      },
      child: {sx:{},},
      name: 'OPTIONS',
      url: '/',
      uid: 'options',
    },
  ];

  const LinkBox = (
      datasBoxPaper.map((data) =>
        {
          return (
          <BoxPaper key={data.uid} sx={data.sx}>
              <Box component="p" sx={data.child.sx}>
                <Link to={data.url} component={RouterLink} color="inherit" underline="none">
                  {data.name}
                </Link>
              </Box>
          </BoxPaper>
            
          )
        }
  ));

  return (
    <Box component="main" sx={{ height: '100vh', overflow: 'auto' }}>
      {isLogged === false ?
        <Fade in={true} timeout={400}>{gridNotLogged}</Fade>
        :
        <React.Fragment>
        <Box sx={{
          display: 'flex', 
          height: '100%', 
          p: 'auto',
          flexDirection: {
            xs: 'row', 
            md: 'column',
          },
          justifyContent: 'center',
          alignItems: 'center',
        }}>

          <Box sx={{ 
            display: 'flex',  
            flexFlow: {
              xs: 'column wrap', 
              md: 'row wrap',
            },
            flex: '0 1 auto',
            width: 'auto',
            height: 'auto',
            my: '10vw',
            mx: '10vw',
            gap: {
              xs: '5vh', 
              lg: '2vw'
            } 
          }}>            
            {
              LinkBox
            }
          </Box>
          {  
            true && 
            <Box 
              component="div"
              sx={{ 
                width: 'auto', 
                display: 'flex', 
                flexFlow: 'column wrap',
                flex: '2 1 auto', 
                border: '2px solid #3F528C'
              }}
            >
              Futur Dashboard
            </Box>
          }
          </Box>
        </React.Fragment>}
      {isLogged === false && window.outerHeight > 350 && <Footer />}
    </Box>
  );
}
export default Home;
