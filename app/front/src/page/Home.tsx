import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Footer from './Footer';
import { User } from '../interface/User';
import {useState, useEffect, useRef} from 'react'
import Clock from '../component/Clock';

function Home(props: {user: User}) {

  console.log(props.user);

  const [isLogged, setIsLogged] = React.useState(props.user.connected);
  
  // j'aimerais que ca change le isLogged si l'user s'est connecté
  useEffect(() => {
    if (props.user.connected === true)
      setIsLogged(!isLogged);
  }, [props.user.connected]);

  return (
    <Box component="main" style={{ backgroundColor: "green", height:"400px", overflow:"hidden" }}>
      <Grid container >
        <Grid item xs={6} sm={6} md={2} lg={2} xl={2}>Premier item de grille</Grid>
        <Grid item xs={12} sm={12} md={7} lg={7} xl={7}>Deuxieme item de grille: {isLogged === false ? <Clock/> : "You are logged ans your dashboard should be displayed"}</Grid>
        <Grid item xs={6} sm={6} md={3} lg={3} xl={3}>Troisieme item de grille</Grid>
      </Grid>
      This is HOME &lt;3
      <Footer />`
    </Box>
  );
}
export default Home;
