import React from 'react';
import Box from '@mui/material/Box';
import ChatComponent from '../component/Chat';

interface ChatPageProps {
  userID: number,
}

export default function ChatPage(props: ChatPageProps)
{
  return (
    <Box component="main" sx={{p: 1, background: 'white', color: 'black'}}>
      <ChatComponent user_id={props.userID} />
    </Box>
  );
}
