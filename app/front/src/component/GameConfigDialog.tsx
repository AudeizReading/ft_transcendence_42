import React, { useState } from 'react';

import { Box, Dialog, Button, DialogTitle, DialogContent, TextField, Grid, Switch, Slider, DialogActions, Snackbar, Alert, AlertColor } from '@mui/material';
import GameSettingsInterface from '../interface/GameSettingsInterface';
import LoadingButton from './LoadingButton';

interface GameConfigDialogProps {
  sendInvite: (settings: GameSettingsInterface) => Promise<boolean>,
  open: boolean,
  setOpen: (open: boolean) => any,
}

// Component to call whenever a user wants to create a game.
// props.open controls whether the Dialog box is opened. props.setOpen is the associated
// useState function.
// props.sendInvite is a function that will be called when the user confirms the game's parameters
// and sends the invitation. It contains a GameSettingsInterface object to be used to configure
// the game. In other words, it's what will ultimately call the backend.
export default function GameConfigDialog(props: GameConfigDialogProps)
{
  const handleClose = () => props.setOpen(false);
  const handleSwitch = (e: any) => setEnableTimeLimit(e.target.checked);
  const handleBallSlider = (e: any, newVal: number | number[]) => setBallSpeed(newVal as number);
  const handleSend = async () => {
    setStatus("loading");
    const success = await props.sendInvite({ pointsToWin, timeLimit: enableTimeLimit ? timeLimit : undefined, ballSpeed});
    if (success)
      setStatus("success");
    else
      setStatus("error");
  }

  const [enableTimeLimit, setEnableTimeLimit] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(11);
  const [timeLimit, setTimeLimit] = useState<number>(5);
  const [ballSpeed, setBallSpeed] = useState(25);
  const [status, setStatus] = useState<'neutral' | 'loading' | 'success' | 'error'>("neutral");

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      
      <Snackbar open={status === "error"} autoHideDuration={3000}
        onClose={() => setStatus("neutral")} anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Alert severity="error" variant="filled" onClose={() => setStatus("neutral")}>
          L'invitation n'a pas pu être envoyée
        </Alert>
      </Snackbar>
      <Snackbar open={status === "success"} autoHideDuration={3000}
        onClose={() => setStatus("neutral")} anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Alert severity="success" variant="filled" onClose={() => setStatus("neutral")}>
          Invitation envoyée !
        </Alert>
      </Snackbar>

      <DialogTitle>Création de partie</DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <TextField
              id="score-to-win"
              label="Points pour gagner"
              type="number"
              margin="dense"
              inputProps={{ min: 3, max: 50 }}
              value={pointsToWin}
              onChange={(e: any) => setPointsToWin(e.target.value)}
              onBlur={() => setPointsToWin(Math.min(Math.max(pointsToWin, 3), 50))}
              error={pointsToWin < 3 || pointsToWin > 50}
              fullWidth
            />
          </Grid>
          <Grid item xs={7}>
            <Box display="flex" flexDirection="row" alignItems="center" sx={{m: 0, p: 0}} >
              <Switch checked={enableTimeLimit} onChange={handleSwitch} />
              <TextField
                id="time-limit"
                label="Limite de temps (min)"
                type="number"
                margin="dense"
                inputProps={{ min: 1, max: 15 }}
                value={timeLimit}
                onChange={(e: any) => setTimeLimit(e.target.value)}
                onBlur={() => setTimeLimit(Math.min(Math.max(timeLimit || 0, 1), 15))}
                error={enableTimeLimit && (timeLimit < 1 || timeLimit > 15)}
                fullWidth
                disabled={!enableTimeLimit}
              />
            </Box>
          </Grid>
          <Grid item xs>
            <p style={{textAlign: 'center', margin: 0, padding: 0}}>Vitesse de la balle</p>
            <Box display="flex" flexDirection="row" alignItems="center" sx={{my: 0, mx: 0.5, p: 0, gap: "10px"}} >
              🐢
              <Slider
                value={ballSpeed}
                onChange={handleBallSlider}
                marks={ [{value: 25, label: "Par défaut"}] }
                step={5}
                min={0}
                max={100}
              />
              🐇
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => props.setOpen(false)} variant="text">Annuler</Button>
        <LoadingButton loading={status === "loading"} onClick={handleSend} variant="contained">Inviter</LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
