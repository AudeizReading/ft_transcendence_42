import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';

import { fetch_opt } from '../dep/fetch'
import UserButton from '../component/UserButton';
import GameInterface from '../interface/GameInterface';
import LoadingButton from '../component/LoadingButton';

const columns: GridColDef[] = [
  {
    field: 'rank',
    headerName: 'Position',
    headerAlign: 'center',
    flex: 0.5,
    // I know, deprecated. RIP.
    valueGetter: (params) => params.api.getRowIndex(params.row.id) + 1,
    align: 'center',
    disableColumnMenu: true,
    disableReorder: true,
    sortable: false,
  },
  {
    field: 'user',
    headerName: 'Joueur',
    flex: 1.5,
    renderCell(params) {
      return <UserButton noBadge {...params.row} />;
    },
    sortable: false,
  },
  {
    field: 'points',
    headerName: 'Points',
    flex: 1,
    valueGetter: (params: GridValueGetterParams<UserInfo, UserInfo>) => {
      const winLoseRatio = (params.row.wins / (params.row.losses || 1));
      const points = (winLoseRatio * (params.row.wins + params.row.losses));
      return (points >= 1e6 ? points.toExponential() : points.toFixed());
    },
    sortable: false,
  },
  {
    field: 'winrate',
    headerName: 'Ratio Victoire/Défaite',
    flex: 1,
    valueGetter: (params: GridValueGetterParams<UserInfo, UserInfo>) =>
      (params.row.wins / (params.row.losses || 1)).toFixed(2),
    sortable: false,
  },
  {
    field: 'played-games',
    headerName: 'Parties jouées',
    flex: 1,
    valueGetter: (params: GridValueGetterParams<UserInfo, UserInfo>) =>
      (params.row.wins + params.row.losses),
    sortable: false,
  }
];

interface UserInfo {
  id: number,
  name: string,
  avatar: string,
  wins: number,
  losses: number,
}

export interface LadderProps {
  users: UserInfo[]
}

// TODO: useState with call to backend, to avoid too many calls when re-rendering
// A refresh button on top should be enough, no need to fetch data
// NOTE: I tried using flex instead of hardcoded width in this one, let's see if it works out
export default function Ladder(props: LadderProps)
{
  const ROW_LIMIT = 10;
  const [rows, setRows] = useState<UserInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  function onRefresh() {
    getTopPlayers(setRows, setRefreshing, ROW_LIMIT);
  }

  useEffect(onRefresh, []);

  return (
    <Box component="main" sx={{ p: 1, display: "flex", flexDirection: "column", height: '100vh', overflow: 'auto', background: 'white', alignItems: 'center'}} >
      <p style={{textAlign: 'center', color: 'black', fontSize: '2em', fontWeight: 'bold', margin: 5}}>
        Meilleurs {ROW_LIMIT} joueurs
      </p>
      <Box display="flex">
        <LoadingButton loading={refreshing} onClick={onRefresh} sx={{my: 1}}>Rafraîchir</LoadingButton>
      </Box>
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
          autoPageSize
          disableSelectionOnClick
          disableColumnSelector
          disableColumnMenu
        />
      </Box>
    </Box>
  );
}

async function getTopPlayers(setRows: Function, setRefresh: Function, limit: number = 10)
{
  // Change this with a .then chain ?
  try {
    setRefresh(true);
    const res = await fetch(`http://${window.location.hostname}:8190/user/best/${limit}`, fetch_opt());
    if (!res.ok)
      throw "yolo";
    const data = await res.json();
    setRows(data);
    setRefresh(false);
  }
  catch (error) {
    // setRefresh(false);
  }
}
