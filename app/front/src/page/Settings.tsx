import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import { fetch_opt } from '../dep/fetch'
import { User } from '../interface/User'

function Settings(props: {
    fetch_userinfo: Function,
    user: User
  }) {

  

  return (
    <Box component="main" sx={{ height: '100%', background: 'white', color: 'black', textAlign: 'center' }}>
      <Box component="h2">2FA</Box>
      {/*BACK : https://github.com/guyht/notp */}
    </Box>
  );
}
export default Settings;