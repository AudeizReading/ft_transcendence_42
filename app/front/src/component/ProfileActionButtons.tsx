import React, { useState } from 'react';

import { Box, Button } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { fetch_opt } from '../dep/fetch';
import Friend from '../interface/Friend';
import GameConfigDialog from './GameConfigDialog';
import GameSettingsInterface from '../interface/GameSettingsInterface';

interface ProfileActionButtonsProps {
  disabled?: boolean,
  fetch_userinfo: Function,
  currentUserID: number,
  currentUserFriends: Friend[],
  profileUser: {
    id: number,
    name: string,
    avatar: string,
    wins: number,
    loses: number,
    status: string,
  },
}

export default function ProfileActionButtons(props: ProfileActionButtonsProps)
{
  async function callFriendController(user: number | string, action: string) {
    await fetch(`http://${window.location.hostname}:8190/friend/${user}/${action}`, fetch_opt());
    props.fetch_userinfo();
  }
  
  async function sendInvite(settings: GameSettingsInterface) {
    const inviteData = {
      fromID: props.currentUserID,
      toID: props.profileUser.id,
      settings,
    }
    const result = await fetch(`http://${window.location.hostname}:8190/invite/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(fetch_opt().headers),
        },
        body: JSON.stringify(inviteData),
    });
    // TODO: Error handling
    if (!result.ok)
      console.error(result); // where the fuck is the error message ?
  }

  const [isGameConfigOpen, setGameConfigOpen] = useState(false);

  const friend_status = props.currentUserFriends
    .find(friend => friend.id === props.profileUser.id)
    ?.friend_status;

  const normalUser = (
    <Box component="span">
      <Button variant="contained" color="success" sx={{mx: 1}} startIcon={<PersonAddAlt1Icon/>}
        onClick={() => callFriendController(props.profileUser.name, "request")}
      >
        Ajouter en ami
      </Button>
    </Box>
  );

  const requestedUser = (
    <Box component="span">
      <Button variant="contained" color="error" sx={{mx: 1}} startIcon={<CloseIcon/>}
        onClick={() => callFriendController(props.profileUser.id, "cancelrequest")}
      >
        Annuler la demande d'ami
      </Button>
    </Box>
  );

  const pendingUser = (
    <Box component="span">
      <Button variant="contained" color="success" sx={{mx: 1}} startIcon={<CheckIcon/>}
        onClick={() => callFriendController(props.profileUser.id, "accept")}
      >
        Accepter l'ami
      </Button>
      <Button variant="contained" color="error" sx={{mx: 1}} startIcon={<CloseIcon/>}
        onClick={() => callFriendController(props.profileUser.id, "refuse")}
      >
        Refuser l'ami
      </Button>
    </Box>
  );

  const friendUser = (
    <Box component="span">

      <GameConfigDialog open={isGameConfigOpen} setOpen={setGameConfigOpen} sendInvite={sendInvite}/>

      <Button variant="contained" color="success" sx={{mx: 1}} startIcon={<VideogameAssetIcon/>}
        disabled={props.profileUser.status !== "online"}
        onClick={() => setGameConfigOpen(true)}
      >
        Inviter à jouer
      </Button>
      <Button variant="contained" color="primary" sx={{mx: 1}} startIcon={<MessageIcon/>} >
        Envoyer un message
      </Button>
      <Button variant="contained" color="error" sx={{mx: 1}} startIcon={<DeleteForeverIcon/>}
        onClick={() => callFriendController(props.profileUser.id, "remove")}
      >
        Supprimer l'ami
      </Button>
    </Box>
  );

  if (!!props.disabled)
    return null;
  else if (friend_status === "requested")
    return requestedUser;
  else if (friend_status === "pending")
    return pendingUser;
  else if (friend_status === "accepted")
    return friendUser;
  else
    return normalUser;
}
