import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Avatar, AvatarGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import ButtonBase from '@mui/material/ButtonBase';
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
    width: 200,
    hideable: false,
    renderCell: (params: GridRenderCellParams) => <AvatarAndName {...params.row} />,
  },
  {
    field: "games-played",
    headerName: "Nombre de parties",
    width: 200,
    hideable: false,
    valueGetter: () => "TODO",
  },
  {
    field: "win-ratio",
    headerName: "Rapport Victoires/Défaites",
    width: 200,
    hideable: false,
    valueGetter: () => "TODO",
  },
];

// It's here until I figure out what the hell I'm doing
interface FriendInterface {
  id: string,
  name: string,
  status: string,
  avatar?: string,
}

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

function Friends(props: any)
{
  // For debugging only
  const initrows: FriendInterface[] = [
    {
      id: "bob",
      name: "Bob",
      status: "offline",
    },
    {
      id: "brice",
      name: "Brice",
      status: "offline",
    },
    {
      id: "edgar",
      name: "Edgar Hussein",
      status: "online",
    },
    {
      id: "sheesh",
      name: "SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESH",
      status: "in-game",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/3/38/Xavier_Niel004.jpg",
    },
  ];

  const [gridRows, setRows] = useState(initrows);
  const [search, setSearch] = useState("");

  const filteredRows = gridRows.filter(
    (row: FriendInterface) => row.name.toLowerCase().includes(search)
  );

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
