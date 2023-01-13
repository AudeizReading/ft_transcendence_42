import React from 'react';
import { Box, Dialog, Button, DialogTitle, DialogContent, ListItem, ListItemIcon, ListItemText, List, Avatar } from '@mui/material';
import { ProfileUserInterface } from '../page/Profile';
import { EmojiEvents } from '@mui/icons-material';

interface AchievementListDialogProps {
  open: boolean,
  setOpen: Function,
  profileUser: ProfileUserInterface,
}

export default function AchievementListDialog(props: AchievementListDialogProps)
{
  const onClose = () => props.setOpen(false);

  const achievements: JSX.Element[] = [];
  const playedGames = props.profileUser.wins + props.profileUser.losses;

  // Bon OK, j'ai vraiment honte là. Je vais foutre des vrais achievements...
  if (props.profileUser.wins + props.profileUser.losses > 0)
    achievements.push(<AchievementListItem key={1} primary="Il faut une première fois à tout" secondary="Jouez une fois à pong" />);
  if (props.profileUser.wins > 0)
    achievements.push(<AchievementListItem key={2} primary="Point faible : trop fort" secondary="Gagnez une partie de pong" />);

  return (
    <Dialog open={props.open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Liste des succès
      </DialogTitle>

      <DialogContent>
        <List sx={{width: '100%'}} >
          {achievements.length ? achievements : "Oh oh... Il n'y a rien ici !"}
        </List>
      </DialogContent>
    </Dialog>
  );
}

function AchievementListItem(props: {primary: string, secondary?: string})
{
  return (
    <ListItem>

      <ListItemIcon>
        <Avatar sx={{backgroundColor: 'gold'}}>
          <EmojiEvents />
        </Avatar>
      </ListItemIcon>

      <ListItemText {...props} />

    </ListItem>
  );
}
