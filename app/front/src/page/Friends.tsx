import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Avatar, AvatarGroup } from '@mui/material';
import StyledBadge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

const gridColums: GridColDef[] = [
  {
    field: "name",
    headerName: "Nom",
    width: 200,
    hideable: false,
    renderCell: (params: GridRenderCellParams) => <AvatarChip {...params.row} />,
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
  avatar?: string,
}

function AvatarChip(props: FriendInterface)
{
  const avatar = <Avatar alt={props.name} src={props.avatar}>{props.name[0]}</Avatar>;
  return (
    <Chip
      avatar={avatar}
      label={props.name}
      variant="outlined"
      component="a"
      href={`http://${window.location.hostname}:3000/user/${props.id}`}
      clickable
    />
  );
}

function FriendsTable(props: any)
{
  const initrows: FriendInterface[] = [
    {
      id: "bob",
      name: "Bob",
    },
    {
      id: "brice",
      name: "Brice",
    },
    {
      id: "edgar",
      name: "Edgar Hussein",
    },
    {
      id: "sheesh",
      name: "SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESH",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/3/38/Xavier_Niel004.jpg",
    },
  ];

  const [gridRows, setRows] = useState(initrows);

  return (
    <Box component="main">
      <Box sx={{ height: '100%', maxWidth: 800, width: '100%', mx: 'auto' }}>
        <DataGrid
          rows={gridRows}
          columns={gridColums}
          pageSize={50}
          rowsPerPageOptions={[]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
}

export default FriendsTable;
