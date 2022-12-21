import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

import Home from './page/Home';
import Play from './page/Play';
import Game from './page/Game';
import Score from './page/Score';
import Profile from './page/Profile';
import Auth from './page/Auth';
import Footer from './page/Footer';

import TopBar from './component/TopBar';
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

import { fetch_opt } from './dep/fetch'
import { User } from './interface/User'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MATCHMAKING_SECONDS = 25;

function App() {
  if (window.location.hostname === 'localhost')
    window.location.href = window.location.href.replace('localhost', '127.0.0.1');

  const isNotAuth = (window.location.pathname !== '/auth');

  const fetched_firsttime = useRef(false);
  const timeout: any = useRef(0);

  const defaultNotConnected = () => ({
    id: 0,
    name: '',
    connected: false,
    matchmaking_state: null,
    matchmaking_remaining: null,
    matchmaking_users: { count: 0, avatars: [] },
    avatar: '',
    notifs: { num: 0, arr: [] },
    msgs: { num: 0, arr: [] },
    actions: { num: 0, arr: [] },
    is_playing: false
  } as User);

  const [loaded, setLoaded] = useState(false);
  let [alreadyOpen, setAlreadyOpen] = useState(false); // 'let' because it lets doing a hack/force render refresh state
  const [user, setUser] = useState(defaultNotConnected());

  const fetch_userinfo = useCallback(() => {
    // console.trace(); // Permet de vérifier quelles fonctions appellent fetch_userinfo
    fetch('http://' + window.location.hostname + ':8190/user/me', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setLoaded(true)
          // console.log('fetch', result);
          if (!result.connected)
            return setUser(defaultNotConnected())
          setUser({
            id: result.user.id,
            name: result.user.name,
            connected: true,
            matchmaking_state: result.user.matchmaking_state,
            matchmaking_remaining: result.user.matchmaking_remaining,
            matchmaking_users: result.matchmaking_users,
            avatar: result.user.avatar,
            notifs: result.notifs,
            msgs: result.msgs,
            actions: result.actions,
            is_playing: result.user.is_playing
          });
        },
        (error) => {
          setLoaded(false)
          console.info('fetch_userinfo', error)
          setUser(defaultNotConnected())
        }
      )
  }, []);

  const handleDialogClose = () => {
    window.dispatchEvent(new Event('click_iamfirst'));
  };

  const handleReadyMatchMaking = async () => {
    user.matchmaking_state = 'CONFIRMED';
    await fetch('http://' + window.location.hostname + ':8190/game/matchmaking/confirm', fetch_opt());
    user.matchmaking_remaining = new Date().toString();
  };

  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const refresh = (bool: boolean) => {
      if (bool) {
        fetch_userinfo();
        fetched_firsttime.current = true;
      }
      clearTimeout(timeout.current);
      timeout.current = setTimeout(refresh, alreadyOpen ? 450000 : (loaded && user.matchmaking_state !== null ? 3000 : 8000), 1);
      // TODO: Better? Socket.io?
    };
    refresh(!fetched_firsttime.current);

    const timer: any = setInterval(() => {
      if (user.matchmaking_remaining === null)
        return clearInterval(timer);
      setProgress((+new Date() - +new Date(user.matchmaking_remaining)) / MATCHMAKING_SECONDS / 10);
    }, 400);

    // console.info('broadcast channel');
    const bc = new BroadcastChannel('one-pong-only');

    bc.onmessage = (event) => {
      if (!isNotAuth)
        return ;

      if (event.data === 'Am I the first?' && !alreadyOpen) {
        bc.postMessage('No you are not.');
      }
      if (event.data === 'No you are not.' || event.data === 'I am the first!') {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        alreadyOpen = true; // hack: fix bug!
        setAlreadyOpen(true);
      }
    };

    isNotAuth && bc.postMessage(`Am I the first?`);

    /*const handleBeforeUnload = () => {
      console.info('close bc');
      bc.close();
    }
    window.addEventListener('beforeunload', handleBeforeUnload, false);*/

    const handleDialogClose = () => {
      bc.postMessage('I am the first!');
      alreadyOpen = false; // hack: fix bug!
      setAlreadyOpen(false);
    };
    window.addEventListener('click_iamfirst', handleDialogClose, false);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout.current);
      // console.info('close bc');
      bc.close();
      //window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click_iamfirst', handleDialogClose);
    };
  }, [alreadyOpen, fetch_userinfo, isNotAuth, user]);

  return (
    <React.Fragment>
      <Backdrop sx={{ color: '#000', zIndex: 2000 }} open={!loaded || alreadyOpen}>
        <CircularProgress color="inherit" />
        <Dialog
          open={alreadyOpen}
          TransitionComponent={Transition}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ zIndex: 2100 }}
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
        <Dialog
          open={user.matchmaking_state === 'MATCHED' && progress <= 105}
          TransitionComponent={Transition}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Un opposant a été trouvé
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Un opposant d'une grande force vous a été trouvé. Cliquez sur prêt pour lancer
              la partie.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReadyMatchMaking}>
              <CircularProgress size={16} sx={{ mr: 1, verticalAlign: 'middle', mt: '-1px' }}
                variant="determinate" value={progress}
                /> Pret ({Math.max(MATCHMAKING_SECONDS - Math.round(progress * MATCHMAKING_SECONDS / 100), 0)}sec)
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
      <BrowserRouter>
        {isNotAuth && <TopBar fetch_userinfo={fetch_userinfo} user={user} loaded={loaded} alreadyOpen={alreadyOpen} />}
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/play" element={<Play fetch_userinfo={fetch_userinfo} user={user} />} />
          <Route path="/game/:gameid" element={<Game user={user} />} />
          <Route path="/game/" element={<Game user={user} />} />
          <Route path="/score" element={<Score />} />
          <Route path="/user/:userid" element={<Profile fetch_userinfo={fetch_userinfo} user={user} />} />

          <Route path="/auth" element={<Auth />} />

          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </React.Fragment>
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
