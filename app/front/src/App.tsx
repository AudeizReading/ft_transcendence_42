import React from 'react';
import './App.css';
import TopBar from './component/TopBar';
import Home from './page/Home';
import Score from './page/Score';
import Profile from './page/Profile';
import Chat from './page/Chat';
import Box from '@mui/material/Box';
import {
  BrowserRouter,
  Routes,
  Route,
  Link as RouterLink
} from "react-router-dom";

function App() {
  return (
    <Box className="App">
        <BrowserRouter>
          <TopBar />
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/score" element={<Score />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />

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
      <RouterLink to="/">Home</RouterLink>
    </div>
  );
}
