import React from 'react';

import { Box, IconButton, List, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NotifContainerType } from '../interface/User';
import { Link as RouterLink } from 'react-router-dom';
import { fetch_opt } from '../dep/fetch';

interface NotifListProps {
  handleCloseNotifMenu: () => void,
  notifs: NotifContainerType,
  fetch_userinfo: Function,
}

export default function NotifList(props: NotifListProps)
{
  if (!props.notifs.num) {
    return <p>Vous n'avez aucune notification !</p>;
  }

  const getDeleteNotifButton = (id: number) => (
    <IconButton
      edge="end"
      // TODO: Error handling?
      onClick={async () => {
        await fetch(`http://${window.location.hostname}:8190/notif/delete/${id}`, fetch_opt());
        props.fetch_userinfo();
      }}
    >
      <DeleteIcon />
    </IconButton>
  );
  
  const notifListJSX = props.notifs.arr.map( (notif, index) =>
    <ListItem
      key={index}
      sx={{ p: 0, m: 0 }}
      divider={index < props.notifs.arr.length - 1}
      secondaryAction={getDeleteNotifButton(notif.id)}
    >
      <ListItemButton
        sx={{ display: 'block', pt: 1, pb:0 }}
        onClick={props.handleCloseNotifMenu}
        // Make this a RouterLink only if there's a URL in the notif
        { ...(notif.url ? {component: RouterLink, to: notif.url} : {}) }
      >
        <Box sx={{color: notif.read ? 'grey' : 'text.primary', whiteSpace: 'normal'}} >
          {notif.text}
        </Box>
        <Box sx={{ color: 'text.secondary', fontSize: 11, textAlign: 'right' }} >
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
