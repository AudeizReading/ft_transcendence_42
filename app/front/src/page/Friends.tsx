import React, { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import MessageIcon from '@mui/icons-material/Message';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import CheckIcon from '@mui/icons-material/Check';

import { User, NotifContainerType, NotifDataType } from '../interface/User';
import Friend from '../interface/Friend';
import UserButton from '../component/UserButton';
import UserChip from '../component/UserChip';
import LoadingButton from '../component/LoadingButton';
import { fetch_opt } from '../dep/fetch';

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

// Component to render the "My Friends" page.
// Gets the array of friends of this user
export default function Friends(props: { fetch_userinfo: Function, user: User })
{
  const gridColums: GridColDef[] = [
    {
      field: "name",
      headerName: "Nom",
      width: 240,
      renderCell: (params: GridRenderCellParams) => <UserButton {...params.row} />,
      // renderCell: (params: GridRenderCellParams) => <UserChip {...params.row} />,
    },
    {
      field: "games-played",
      headerName: "Nombre de parties",
      width: 150,
      valueGetter: (params: GridValueGetterParams) => params.row.games_played,
    },
    {
      field: "win-ratio",
      headerName: "Rapport Victoires/Défaites",
      width: 200,
      valueGetter: (params: GridValueGetterParams) =>
        ((params.row.games_won / params.row.games_played) || 0).toFixed(2),
    },
    {
      field: "buttons",
      headerName: "",
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) =>
        <FriendActionButtons user={props.user} fetch_userinfo={props.fetch_userinfo} {...params.row} />,
    },
  ];

  // ========================================================================== //
  // ========================================================================== //
  // ========================================================================== //

  const gridRows = props.user.friends;
  const [search, setSearch] = useState("");
  const [addingFriend, setAddingFriend] = useState(false);

  const filteredRows = gridRows.filter(
    (row: Friend) => row.name.toLowerCase().includes(search.toLowerCase())
  );

  // TODO: Fix the ugly percent height ( doesn't look good when screen is resized too much)
  return (
    <Box component="main">

      <AddFriendDialog fetch_userinfo={props.fetch_userinfo} addingFriend={addingFriend} setAddingFriend={setAddingFriend} />
      
      <Box display="flex" alignItems="center" sx={{ maxWidth: 800, width: '100%', mx: 'auto', my: 1 }}>
        <TextField
          id="search-friend"
          label="Rechercher un ami"
          variant="outlined"
          fullWidth
          value={search}
          onChange={ (e : any) => setSearch(e.target.value) }
        />
        <Button
          variant="contained"
          sx={{ml: 1, height: 55, width: '25%'}}
          onClick={(e: any) => setAddingFriend(true)}
        >
          Ajouter un ami
        </Button>
      </Box>
      
      <Box sx={{ height: '91%', maxWidth: 800, width: '100%', mx: 'auto', my: 1 }}>
        <DataGrid
          rows={filteredRows}
          columns={gridColums}
          pageSize={50}
          rowsPerPageOptions={[]}
          disableSelectionOnClick
          disableColumnSelector
          disableColumnMenu
        />
      </Box>

    </Box>
  );
}

function AddFriendDialog(props: {
    fetch_userinfo: Function,
    addingFriend: boolean,
    setAddingFriend: Function
  })
{
  const {addingFriend, setAddingFriend} = props;
  const [friendName, setFriendName] = useState("");
  const [loading, setLoading] = useState(false); // Do I NEED a state for that?
  const [isError, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const textFieldRef = useRef<any>(null);

  function closeDialog() {
    setAddingFriend(false);
    setFriendName("");
    setError(false);
    setLoading(false);
    setSuccess(false);
  }

  function getFieldLabel() {
    if (isError)
      return "Impossible d'ajouter l'ami";
    else if (success)
      return "Demande d'ami envoyée !";
    else
      return "Nom de l'ami à ajouter";
  }

  async function requestFriend(e: React.FormEvent) {
    e.preventDefault();
    if (friendName.length === 0)
      return;

    setLoading(true);
    const result = await fetch(`http://${window.location.hostname}:8190/friend/${friendName}/request`, fetch_opt());
    const req_success: boolean = await result.json();
    if (!req_success) {
      setError(true);
    }
    else {
      setSuccess(true);
    }
    textFieldRef.current!.focus();
    setLoading(false);
  }

  return (
    <Dialog open={addingFriend} onClose={closeDialog} maxWidth="sm" fullWidth>
      <form onSubmit={requestFriend}>
        <DialogTitle>Ajouter un ami</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            inputRef={textFieldRef}
            error={isError}
            margin="dense"
            id="name"
            label={getFieldLabel()}
            type="search"
            variant="outlined"
            color={success ? "success" : "primary"}
            fullWidth
            value={friendName}
            onChange={ (e : any) => {
              setFriendName(e.target.value);
              setError(false);
              setSuccess(false);
            } }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Annuler</Button>
          <LoadingButton type="submit" loading={loading}>Ajouter</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Component to render the buttons for an entry in the friend list. If it's a friend,
// displays buttons for invite, chat, and unfriend. If it's a friend request, displays
// buttons to accept or deny.
function FriendActionButtons(props: {
    user: User,
    fetch_userinfo: Function,
    id: number,
    friend_status: "pending" | "accepted"
  })
{
  async function callFriendController(action: string) {
    await fetch(`http://${window.location.hostname}:8190/friend/${props.id}/${action}`, fetch_opt());
    props.fetch_userinfo();
  }

  const pendingFriend = (
    <Box component="span">
      <Tooltip title="Accepter l'ami" arrow disableInteractive>
        <IconButton color="success" onClick={() => callFriendController("accept")}>
          <CheckIcon/>
        </IconButton>
      </Tooltip>
      <Tooltip title="Refuser l'ami" arrow disableInteractive>
        <IconButton color="error" onClick={() => callFriendController("refuse")}>
          <CloseIcon/>
        </IconButton>
      </Tooltip>
    </Box>
  );

  // NOTE: Will be used later
  const requestedFriend = (
    <Box component="span">
      <p>Invitation sent</p>
      <Tooltip title="Annuler la demande d'ami" arrow disableInteractive>
        <IconButton color="error">
          <CloseIcon/>
        </IconButton>
      </Tooltip>
    </Box>
  );

  const knownFriend = (
    <Box component="span">
      <Tooltip title="Inviter à jouer" arrow disableInteractive>
        <IconButton color="success">
          <VideogameAssetIcon/>
        </IconButton>
      </Tooltip>
      <Tooltip title="Envoyer un message" arrow disableInteractive>
        <IconButton color="primary">
          <MessageIcon/>
        </IconButton>
      </Tooltip>
      <Tooltip title="Supprimer l'ami" arrow disableInteractive>
        <IconButton color="error" onClick={() => callFriendController("remove")}>
          <DeleteForeverIcon/>
        </IconButton>
      </Tooltip>
    </Box>
  );

  // if (props.user.id === props.id)
  //   return requestedFriend;
  return (props.friend_status === "pending" ? pendingFriend : knownFriend);
}
