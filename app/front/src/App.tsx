import React from 'react';
import './App.css';
import TopBar from './component/TopBar';
import Box from '@mui/material/Box';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Box className="App">
        <TopBar />
        <BrowserRouter>
          <Routes>
            <Route index path="/" element={<Red />} />
            <Route path="/score" element={<Green />} />
            <Route path="/profile" element={<Orange />} />
            <Route path="/cyan" element={<Cyan />} />

            <Route path="*" element={<Red />} />
          </Routes>
        </BrowserRouter>
    </Box>
  );
}

export default App;

function Red() {
  return (
    <div style={{ backgroundColor: "red", height:"400px", overflow:"hidden" }}>
      <Link to="score">My Profile</Link>
    </div>
  );
}

function Green() {
  return (
    <div style={{ backgroundColor: "green", height:"400px", overflow:"hidden" }}>
    </div>
  );
}

function Orange() {
  return (
    <div style={{ backgroundColor: "orange", height:"400px", overflow:"hidden" }}>
    </div>
  );
}

function Cyan() {
  return (
    <div style={{ backgroundColor: "cyan", height:"400px", overflow:"hidden" }}>
    </div>
  );
}
