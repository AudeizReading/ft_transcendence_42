import React, { useState, useEffect } from 'react';
import './App.css';
import TopBar from './component/TopBar';
import Home from './page/Home';
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

  const notConnected = () => ({
    connected: false,
    avatar: ''
  });

  const [user, setUser] = useState(notConnected());

  const fetch_userinfo = () => {
    fetch('http://' + window.location.hostname + ':8190/user/info', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          console.log('fetch', result);
          if (!result.connected)
            return setUser(notConnected())
          setUser({
            connected: true,
            avatar: result.user.avatar
          })
        },
        (error) => {
          console.info('fetch_userinfo', error)
          setUser(notConnected())
        }
      )
  };

  useEffect(() => {
    fetch_userinfo();
    const interval = setInterval(() => fetch_userinfo(), 15000); // TODO: Better? Socket.io?

    // cleanup this component
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box className="App">
      <BrowserRouter>
        {isNotAuth && <TopBar fetch_userinfo={fetch_userinfo} user={user}/>
          }
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/score" element={<Score />} />
          <Route path="/profile" element={<Profile />} />
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
