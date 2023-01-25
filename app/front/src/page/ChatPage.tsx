import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ChatComponent from '../component/Chat';

import { User } from '../interface/User'

interface ChatPageProps {
  userID: number,
  user: User
}

export default function ChatPage(props: ChatPageProps)
{
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(props.userID !== 0);

    if (!props.user.connected)
      navigate('/');
  }, [props.userID, navigate, props.user]);

  return (
    <Box component="main" sx={{p: 1, height: '100vh', overflow: 'auto', background: 'white', color: 'black'}}>
      { loaded ?
        <ChatComponent user_id={props.userID} />
        : null
      }
    </Box>
  );
}
