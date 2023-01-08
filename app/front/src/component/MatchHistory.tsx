import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

import { fetch_opt } from '../dep/fetch'
import UserButton from '../component/UserButton';
import GameInterface from '../interface/GameInterface';

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
    renderCell(params: GridRenderCellParams<GameInterface, GameInterface>) {
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
    renderCell: (params: GridRenderCellParams<GameInterface, GameInterface>) => (
      params.row.players.map( (player) =>
        <UserButton key={player.id} noBadge cropName={12} {...player} sx={{mr: 2}} /> )
    )
  },
];

// "deps" corresponds to the React useEffect dependancies. You can add some more
// to trigger re-renders, or leave it empty.
interface MatchHistoryProps {
  userID: number,
  deps: any[],
}

export default function MatchHistory(props: MatchHistoryProps)
{
  const [rows, setRows] = useState([] as GameInterface[]);

  useEffect( () => {
    fetch(`http://${window.location.hostname}:8190/user/${props.userID}/games`, fetch_opt())
      .then(res => res.json())
      .then(res => setRows(res))
      .catch(() => {});
  }, [props.userID, ...props.deps]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoPageSize
      disableSelectionOnClick
      disableColumnSelector
    />
  );
}
