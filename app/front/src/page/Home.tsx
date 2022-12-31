import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Footer from './Footer';
import { User } from '../interface/User';
import {useState, useEffect, useRef, createContext, useContext} from 'react'
import Clock from '../component/Clock';
import DateTime from '../component/DateTime';
import Timer from '../component/Timer';

import AnalogicClock from '../component/AnalogicClock';

function Home(props: {user: User}) {

  const [user, setUser] = useState(props.user);
  const [isLogged, setIsLogged] = useState(user.connected);
  
  // j'aimerais que ca change le isLogged si l'user s'est connecté
  useEffect(() => {
    if (user.connected === true)
      setIsLogged(!isLogged);
  }, [user]);

  const gridNotLogged = (
      <Grid container rowSpacing={{xs: 1, md: 2}} columnSpacing={{xs: 3, md: 6}}>
        <Grid item xs={12} md={6}>Premier item de grille
          <AnalogicClock stress={true}/>
        </Grid>
        <Grid item xs={12} md={6}>{<DateTime component="h1"/>}{<Clock component="h6"/>}</Grid>
        <Grid item xs={12} md={12}>{<Timer/>}</Grid>
      </Grid>
  );

  return (
    <Box component="main" style={{ backgroundColor: "green", height:"400px" }}>
    {!isLogged && gridNotLogged}
      
      This is HOME &lt;3
      <Footer />`
    </Box>
  );
}
export default Home;
