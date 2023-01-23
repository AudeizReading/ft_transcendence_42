import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ChatComponent from '../component/Chat';

interface ChatPageProps {
  userID: number,
}

export default function ChatPage(props: ChatPageProps)
{
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(props.userID !== 0);
  }, [props.userID]);

  return (
    <Box component="main" sx={{p: 1, height: '100vh', overflow: 'auto', background: 'white', color: 'black'}}>
      { loaded ?
        <ChatComponent user_id={props.userID} />
        : null
      }
    </Box>
  );
}
