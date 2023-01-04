import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { User } from '../interface/User'
import CanvasGame from '../component/CanvasGame';

function Game(props: {
    loaded: boolean,
    user: User
  }) {
  const [ message, setMessage ] = useState('Chargement…')
  const [ gameid, setGameId ] = useState(useParams().gameid)

  useEffect(() => {
    if (!gameid) {
      if (props.user.is_playing) {
        setGameId('mygame');
      } else {
        setMessage("Vous n'avez pas de partie en cours."); // TODO: Improve css
      }
    }
  }, [props, gameid, message]);

  return (
    <Box component="main" style={{ backgroundColor: "blue", height:"400px", overflow:"hidden" }}>
      {props.loaded && (gameid
        ? <CanvasGame gameId={gameid} playable border="3px solid black" />
        : <Box component="p">{message || 'loading…'}</Box>
      )}
    </Box>
  );
}
export default Game;
