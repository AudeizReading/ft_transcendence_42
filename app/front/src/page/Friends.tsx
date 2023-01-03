import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import MessageIcon from '@mui/icons-material/Message';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

import { User, NotifContainerType, NotifDataType } from '../interface/User';
import Friend from '../interface/Friend';
import UserButton from '../component/UserButton';
import UserChip from '../component/UserChip';

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

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
    renderCell: (params: GridRenderCellParams) => <FriendActionButtons {...params.row} />,
  },
];

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

// Component to render the "My Friends" page.
// Gets the array of friends of this user
export default function Friends(props: { 
    user: User
  })
{
  const gridRows = props.user.friends;
  const [search, setSearch] = useState("");

  const filteredRows = gridRows.filter(
    (row: Friend) => row.name.toLowerCase().includes(search.toLowerCase())
  );

  // TODO: Fix the ugly percent height ( doesn't look good when screen is resized too much)
  return (
    <Box component="main">
      
      <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto', my: 1 }}>
        <TextField
          id="search-friend"
          label="Rechercher un ami"
          variant="outlined"
          margin="normal"
          fullWidth
          value={search}
          onChange={ (e : any) => setSearch(e.target.value) }
        />
      </Box>
      
      <Box sx={{ height: '87%', maxWidth: 800, width: '100%', mx: 'auto', my: 1 }}>
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

// Component to render the buttons for an entry in the friend list. If it's a friend,
// displays buttons for invite, chat, and unfriend. If it's a friend request, displays
// buttons to accept or deny.
function FriendActionButtons(props: {friend_status: string})
{
  const pendingFriend = (
    <Box component="span">

      <Tooltip title="Accepter l'ami" arrow disableInteractive>
        <IconButton color="success">
          <CheckIcon/>
        </IconButton>
      </Tooltip>

      <Tooltip title="Refuser l'ami" arrow disableInteractive>
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
        <IconButton color="error">
          <DeleteForeverIcon/>
        </IconButton>
      </Tooltip>

    </Box>
  );

  return (props.friend_status === "pending" ? pendingFriend : knownFriend);
}
