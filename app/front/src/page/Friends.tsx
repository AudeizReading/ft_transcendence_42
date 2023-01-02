import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import ButtonBase from '@mui/material/ButtonBase';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MessageIcon from '@mui/icons-material/Message';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

// TODO: Fix this bullshit. I can't directly give a color string in the properties
// for some reason
function getBadge(status: string)
{
  const GreenBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  const BlueBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#1976d2',
      color: '#1976d2',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  const GreyBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#7f7f7f',
      color: '#7f7f7f',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  if (status === "online")
    return GreenBadge;
  else if (status === "in-game")
    return BlueBadge;
  else
    return GreyBadge;
}

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

const gridColums: GridColDef[] = [
  {
    field: "name",
    headerName: "Nom",
    width: 240,
    renderCell: (params: GridRenderCellParams) => <AvatarAndName {...params.row} />,
  },
  {
    field: "games-played",
    headerName: "Nombre de parties",
    width: 150,
    valueGetter: () => "TODO",
  },
  {
    field: "win-ratio",
    headerName: "Rapport Victoires/Défaites",
    width: 200,
    valueGetter: () => "TODO",
  },
  {
    field: "buttons",
    headerName: "",
    width: 200,
    filterable: false,
    renderCell: (params: GridRenderCellParams) => <FriendActionButtons {...params.row} />,
  },
];

// It's here until I figure out what the hell I'm doing
interface FriendInterface {
  id: string,
  name: string,
  status: string,
  avatar?: string,
  pending: boolean, // Of course, to be replaced by real logic
}

// Component to render the avatar and name of the user, with an online indicator badge.
// The whole thing is clickable as a button.
function AvatarAndName(props: FriendInterface)
{
  const avatar = <Avatar alt={props.name} src={props.avatar}>{props.name[0]}</Avatar>;

  // Alternate design, I liked it but it doesn't really fit as well in a table.
  // Also, can't get the online badge with it.
  const chip = (
    <Chip
      avatar={avatar}
      label={props.name}
      variant="outlined"
      component="a"
      href={`http://${window.location.hostname}:3000/user/${props.id}`}
      clickable
      />
  );

  const AvatarBadge = getBadge(props.status);

  return (
    <ButtonBase href={`http://${window.location.hostname}:3000/user/${props.id}`}>
      <AvatarBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        {avatar}
      </AvatarBadge>
      <Box sx={{pl: 1}}>
        {props.name}
      </Box>
    </ButtonBase>
  );
}

// Component to render the buttons for an entry in the friend list. If it's a friend,
// displays buttons for invite, chat, and unfriend. If it's a friend request, displays
// buttons to accept or deny.
function FriendActionButtons(props: {pending: boolean})
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

  return (props.pending ? pendingFriend : knownFriend);
}

// Component to render the "My Friends" page.
function Friends(props: any)
{
  // For debugging only
  const init_rows: FriendInterface[] = [
    {
      id: "bob",
      name: "Bob",
      status: "offline",
      pending: true,
    },
    {
      id: "brice",
      name: "Brice",
      status: "offline",
      pending: false,
    },
    {
      id: "edgar",
      name: "Edgar Hussein",
      status: "online",
      pending: false,
    },
    {
      id: "sheesh",
      name: "SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESH",
      status: "in-game",
      pending: false,
      avatar: "https://upload.wikimedia.org/wikipedia/commons/3/38/Xavier_Niel004.jpg",
    },
  ];

  const [gridRows, setRows] = useState(init_rows);
  const [search, setSearch] = useState("");

  const filteredRows = gridRows.filter(
    (row: FriendInterface) => row.name.toLowerCase().includes(search)
  );

  // TODO: Fix the ugly percent height ( doesn't look good when screen is resized too much)
  return (
    <Box component="main">
      
      <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto', my: 1 }}>
        <TextField
          id="search-friend"
          label="Search for a friend"
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

export default Friends;
