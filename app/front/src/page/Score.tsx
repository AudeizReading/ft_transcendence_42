import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

import { fetch_opt } from '../dep/fetch'

const columns: GridColDef[] = [
  {
    field: 'score',
    headerName: 'Score',
    description: 'Le score du match',
    width: 150,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.scores[0]} - ${params.row.scores[1]}`
  },
  {
    field: 'winner',
    headerName: 'Gagnant',
    description: 'Le gagnant du match',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => 
      params.row.players.filter((player: any) => player.id === params.row.winnerId)[0].name
  },
  {
    field: 'winnedAt',
    headerName: 'Le',
    description: 'Date de la victoire',
    width: 200,
    valueGetter: (params: GridValueGetterParams) =>
      new Date(params.row.winnedAt).toLocaleString()
  },
  {
    field: 'players',
    headerName: 'Joueurs',
    width: 200,
    renderCell: (params: GridRenderCellParams<any>) =>
      <AvatarGroup max={2}>
      {params.row.players && params.row.players.map((item: any) =>
        <Avatar alt={item.name} src={item.avatar} sx={{ height: 22, width: 22 }} />
      )}
      </AvatarGroup>
  },
];

export interface scoreType {
  id: number;
  players: {
    id: number,
    name: string,
    avatar: string,
  }[];
  scores: number[];
  winnerId: number;
  winnedAt: Date;
}

function Score() {
  const [rows, setRows] = useState([] as scoreType[]);
  rows.length === 0 &&
    fetch('http://' + window.location.hostname + ':8190/game/score', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setRows(result)
        },
        (error) => { }
      )

  return (
    <Box component="main">
      <Box sx={{ height: '100%', maxWidth: 800, width: '100%', mx: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
}
export default Score;
