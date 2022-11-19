import React from 'react';
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

function App() {
  if (window.location.hostname == 'localhost')
    window.location.href = window.location.href.replace('localhost', '127.0.0.1');

  const isNotAuth = (window.location.pathname != '/auth');

  return (
    <Box className="App">
      <BrowserRouter>
        {isNotAuth && <TopBar />}
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
