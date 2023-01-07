import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

function Auth() {
  const [html, setHtml] = useState('');

  useEffect(() => { // will be run twice ^^'
    localStorage.setItem('bearer', window.location.hash.replace('#bearer=', ''));

    try {
      window.opener.window.wOpen = window;
      window.opener.window.dispatchEvent(new Event('auth_success'));
    } catch (e) {
      console.warn('je suis triste mais auth!');
      setHtml(' *');
    }
  },[]);

  return (
    <Box component="main" sx={{ height: '100%', background: 'white' }}>
      <Box component="p" sx={{ color: 'black', textAlign: 'center' }}
        >Connexion OK. Vous pouvez fermer cette page :) {html}</Box>
    </Box>
  );
}
export default Auth;