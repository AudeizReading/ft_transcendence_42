import React, { useState, useEffect } from 'react';
import './App.css';
import TopBar from './component/TopBar';
import Home from './page/Home';
import Play from './page/Play';
import Score from './page/Score';
import Profile from './page/Profile';
import Auth from './page/Auth';
import Chat from './page/Chat';
import Box from '@mui/material/Box';
import {
  BrowserRouter,
  Routes,
  Route,
  Link as RouterLink
} from "react-router-dom";
import { fetch_opt } from './dep/fetch.js'

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

  const [user, setUser] = useState(defaultNotConnected());

  const fetch_userinfo = () => {
    fetch('http://' + window.location.hostname + ':8190/user/me', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          console.log('fetch', result);
          if (!result.connected)
            return setUser(defaultNotConnected())
          setUser({
            id: result.user.id,
            name: result.user.name,
            connected: true,
            matchmaking: false,
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

  useEffect(() => {
    fetch_userinfo();
    let timeout = setTimeout(() => {
      fetch_userinfo()
      setTimeout(() => fetch_userinfo(), user.matchmaking ? 5000 : 15000);
    }, user.matchmaking ? 5000 : 15000); // TODO: Better? Socket.io?

    // cleanup this component
    return () => {
      clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box className="App">
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
