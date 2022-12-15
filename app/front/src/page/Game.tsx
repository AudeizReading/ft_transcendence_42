import Box from '@mui/material/Box';
import CanvasGame from '../component/CanvasGame';

function Game() {
  return (
    <Box component="main" style={{ backgroundColor: "blue", height:"400px", overflow:"hidden" }}>
      <CanvasGame playable border="3px solid black" />
    </Box>
  );
}
export default Game;
