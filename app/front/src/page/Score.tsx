import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

import { fetch_opt } from '../dep/fetch'
import UserButton from '../component/UserButton';

const columns: GridColDef[] = [
  {
    field: 'score',
    headerName: 'Score',
    description: 'Le score du match',
    width: 100,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.scores[0]} - ${params.row.scores[1]}`
  },
  {
    field: 'winner',
    headerName: 'Gagnant',
    description: 'Le gagnant du match',
    width: 150,
    renderCell(params: GridRenderCellParams<scoreType, scoreType>) {
      const winner = params.row.players.find(
        (player) => player.id === params.row.winnerId
      );
      return <UserButton noBadge {...winner!} />;
    },
  },
  {
    field: 'winnedAt',
    headerName: 'Le',
    description: 'Date de la victoire',
    width: 175,
    valueGetter: (params: GridValueGetterParams) =>
      new Date(params.row.winnedAt).toLocaleString()
  },
  {
    field: 'players',
    headerName: 'Joueurs',
    width: 370,
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params: GridRenderCellParams<scoreType, scoreType>) => (
      params.row.players.map( (player) =>
        <UserButton key={player.id} noBadge cropName={12} {...player} sx={{mr: 2}} /> )
    )
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

  if (rows.length === 0) {
    fetch(`http://${window.location.hostname}:8190/game/score`, fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setRows(result)
        },
        (error) => { }
      );
  }

  return (
    <Box component="main" sx={{ py: 1, height: '100vh', overflow: 'auto', background: 'white', }}>
      <Box
        sx={{
          minHeight: 300,
          height: '100%',
          maxWidth: 800,
          width: '100%',
          mx: 'auto',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[]}
          disableSelectionOnClick
          disableColumnSelector
        />
      </Box>
    </Box>
  );
}
export default Score;
