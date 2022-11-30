import React, { useState, useEffect } from 'react';
import './App.css';

import Home from './page/Home';
import Play from './page/Play';
import Score from './page/Score';
import Profile from './page/Profile';
import Auth from './page/Auth';
import Chat from './page/Chat';

import TopBar from './component/TopBar';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

import { BrowserRouter, Routes, Route, Link as RouterLink } from "react-router-dom";

import { fetch_opt } from './dep/fetch.js'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function App() {
  if (window.location.hostname === 'localhost')
    window.location.href = window.location.href.replace('localhost', '127.0.0.1');

  const isNotAuth = (window.location.pathname !== '/auth');

  const defaultNotConnected = () => ({
    id: 0,
    name: '',
    connected: false,
    matchmaking: false,
    avatar: '',
    notifs: {
      num: 0,
      arr: [{
        text: '', // TODO: C'est moche, et c'est pour forcer le bon typage
        date: 0,
        url: ''
      }]
    }
  });

  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(defaultNotConnected());

  const fetch_userinfo = () => {
    fetch('http://' + window.location.hostname + ':8190/user/me', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setLoaded(true)
          console.log('fetch', result);
          if (!result.connected)
            return setUser(defaultNotConnected())
          setUser({
            id: result.user.id,
            name: result.user.name,
            connected: true,
            matchmaking: result.user.matchmaking,
            avatar: result.user.avatar,
            notifs: {
              num: 3,
              arr: [{
                text: 'Welcome! You can change your avatar! Click here to go to your profile :)',
                date: +new Date(),
                url: '/user/' + result.user.id
              }, {
                text: 'blabla2',
                date: +new Date(),
                url: ''
              }, {
                text: 'blabla3',
                date: +new Date(),
                url: ''
              }]
            }
          })
        },
        (error) => {
          console.info('fetch_userinfo', error)
          setUser(defaultNotConnected())
        }
      )
  };

  let [alreadyOpen, setAlreadyOpen] = useState(false);

  const handleDialogClose = () => {
    window.dispatchEvent(new Event('click_iamfirst'));
  };

  useEffect(() => {
    fetch_userinfo();
    const fct = () => {
      try {
        fetch_userinfo()
      } catch (e) {
        console.error("network issue.")
        return setTimeout(() => fetch_userinfo(), 15000);
      }
      setTimeout(fct, alreadyOpen ? 450000 : (user.matchmaking ? 5000 : 15000));
    };
    let timeout = setTimeout(fct, user.matchmaking ? 5000 : 15000); // TODO: Better? Socket.io?

    console.info('broadcast channel');
    const bc = new BroadcastChannel("one-pong-only");

    bc.onmessage = (event) => {
      if (event.data === 'Am I the first?' && !alreadyOpen) {
        bc.postMessage('No you are not.');
      }
      if (event.data === 'No you are not.' || event.data === 'I am the first!') {
        alreadyOpen = true; // fix bug!
        setAlreadyOpen(true);
      }
    };

    bc.postMessage(`Am I the first?`);

    /*const handleBeforeUnload = () => {
      console.info('close bc');
      bc.close();
    }
    window.addEventListener('beforeunload', handleBeforeUnload, false);*/

    const handleDialogClose = () => {
      bc.postMessage('I am the first!');
      alreadyOpen = false; // fix bug!
      setAlreadyOpen(false);
    };
    window.addEventListener('click_iamfirst', handleDialogClose, false);

    return () => {
      clearTimeout(timeout);
      console.info('close bc');
      bc.close();
      //window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click_iamfirst', handleDialogClose);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box className="App">
      <Backdrop sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={!loaded || alreadyOpen}>
        <CircularProgress color="inherit" />
        <Dialog
          open={alreadyOpen}
          TransitionComponent={Transition}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Veuillez nous excuser pour cette interruption
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Il semblerait que vous aviez Pong sur plus d'un onglet à la fois. Vous pouvez
              décider de fermer l'autre page en cliquant sur "Fermer l'autre session".
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="error">
              Fermer l'autre session
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
      <BrowserRouter>
        {isNotAuth && <TopBar fetch_userinfo={fetch_userinfo} user={user}/>}
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/play" element={<Play fetch_userinfo={fetch_userinfo} user={user} />} />
          <Route path="/score" element={<Score />} />
          <Route path="/user/:userid" element={<Profile fetch_userinfo={fetch_userinfo} user={user} />} />
          <Route path="/chat" element={<Chat />} />

          <Route path="/auth" element={<Auth />} />

          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;

function Error() {
  return (
    <div style={{ backgroundColor: "red", height:"400px", overflow:"hidden" }}>
      <h1>Oh non erreur 404 !</h1>
      <RouterLink to="/">Revenir en arrière</RouterLink>
    </div>
  );
}
