import React, { useState } from 'react';

import { Box, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NotifContainerType } from '../interface/User';
import { Link as RouterLink } from 'react-router-dom';

interface NotifListProps {
  handleCloseNotifMenu: () => void,
  notifs: NotifContainerType,
}

// { user.notifs.num ?
//   <List sx={{ height:'100%', p: 0, overflow: 'auto' }}>
//     {user.notifs.arr.map((notif, index) => (
//       Boolean(index) && <Divider /> , // eslint-disable-line
//       <ListItem key={index} onClick={handleCloseNotifMenu} sx={{ display: 'block', p: 0, m: 0 }}
//         {...(notif.url !== '' ? {
//             component: RouterLink,
//             to: notif.url
//           } : {})
//         }
//       >
//         <ListItemButton sx={{ display: 'block', pt: 1, pb:0 }}>
//           <Box sx={{ color: notif.read && false /* TODO: readAt ??? */ ? 'grey' : 'text.primary', display: 'block',
//                     fontWeight: 'medium', whiteSpace: 'normal' }}>
//             {notif.text}
//           </Box>
//           <Box sx={{ color: 'text.secondary', display: 'block', fontSize: 11, textAlign: 'right' }}>
//             {new Date(notif.date).toLocaleString()}
//           </Box>
//         </ListItemButton>
//       </ListItem>
//     ))
//     }
//   </List> 
// :
//   <Box sx={{ color: 'text.primary', display: 'block', fontWeight: 'medium', whiteSpace: 'normal', px: 4, py: 0 }}>
//     Vous n'avez aucune notification !
//   </Box>
// }

export default function NotifList(props: NotifListProps)
{
  if (!props.notifs.num)
    return (
      <Box sx={{ color: 'text.primary', display: 'block', fontWeight: 'medium', whiteSpace: 'normal', px: 4, py: 0 }}>
        Vous n'avez aucune notification !
      </Box>
  );

  const deleteNotifButton = (
    <IconButton edge="end" onClick={() => alert("I work!")}>
      <DeleteIcon />
    </IconButton>
  );
  
  const notifListJSX = props.notifs.arr.map( (notif, index) =>
    <ListItem
      key={index}
      sx={{ display: 'block', p: 0, m: 0 }}
      divider={index < props.notifs.arr.length - 1}
      onClick={props.handleCloseNotifMenu}
      // Make this a RouterLink only if there's a URL in the notif
      { ...(notif.url ? {component: RouterLink, to: notif.url} : {}) }
      secondaryAction={deleteNotifButton}
    >
      <ListItemButton sx={{ display: 'block', pt: 1, pb:0 }}>
        <Box sx={{
          color: notif.read ? 'grey' : 'text.primary',
          display: 'block',
          fontWeight: 'medium',
          whiteSpace: 'normal' }}
        >
          {notif.text}
        </Box>
        <Box sx={{ color: 'text.secondary', display: 'block', fontSize: 11, textAlign: 'right' }}>
          {new Date(notif.date).toLocaleString()}
        </Box>
      </ListItemButton>
    </ListItem>
  );

  return (
    <List sx={{ height:'100%', p: 0, overflow: 'auto' }} >
      {notifListJSX}
    </List>
  )
}
