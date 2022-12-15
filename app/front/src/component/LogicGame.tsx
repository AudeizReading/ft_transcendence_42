import React, { useRef, useEffect } from 'react'

export interface dataPlayer {
  dir: number;
  pos: number;
  speed: number;
  size: number;
  at: Date | null;
}

export interface dataCanvas {
  players: dataPlayer[];
}

export function getPlayerPosition(player: dataPlayer) {
  if (player.at !== null && player.dir !== 0) {
    // https://stackoverflow.com/q/153507/
    const time = (+player.at - +new Date()) / 1000;
    const speed = player.speed * player.dir;
    //const delta = player.speed * player.dir * time;
    const delta = (1 / 2) * speed * (time * time);
    console.log(delta);
    return Math.min(300 - player.size, Math.max(0, player.pos + delta));
  } else {
    return player.pos;
  }
}

function LogicGame(props: {
   playable: boolean,
   data: dataCanvas,
  }) {
  const loaded = useRef(false);
  const keydowns = useRef({
    '90': false,
    '83': false,
    '38': false,
    '40': false
  });

  if (!loaded.current) {
    props.data.players = [
      { dir: 0, pos: 164, speed: 250, size: 20, at: null },
      { dir: 0, pos: 210, speed: 250, size: 20, at: null },
    ];
    loaded.current = true;
  }

  useEffect(() => {

    const handleKeyEvent = (event: KeyboardEvent) => {
      if (event.repeat)
        return ;
      if (!(event.keyCode === 90 || event.keyCode === 83 // Z - S
            || event.keyCode === 38 || event.keyCode === 40)) // arrow: ^ - v
        return ;
      if (event.type === 'keydown') {
        const target = event.target as HTMLElement;
        if (target !== null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
              || target.contentEditable === 'TEXTAREA')) // On bloque à l'activation, on laisse désactiver la touche
          return ;
        keydowns.current[event.keyCode] = true;
        const player = props.data.players[0];
        player.pos = getPlayerPosition(player);
        player.dir = (event.keyCode === 90 || event.keyCode === 38) ? -1 : +1; // if TOP -1 else +1
        player.at = new Date();
      } else if (event.type === 'keyup') {
        keydowns.current[event.keyCode] = false;
        const player = props.data.players[0];
        let nextdir = 0;
        // TODO: Ajout d'une queue sur les touches enfoncées ? Parce que le dessus à toujours l'avantage sur la touche du bas
        if (keydowns.current['90'] || keydowns.current['38'])
          nextdir = -1;
        else if (keydowns.current['83'] || keydowns.current['40'])
          nextdir = 1;
        if (player.dir !== nextdir) {
          player.pos = getPlayerPosition(player);
          player.dir = nextdir;
          player.at = new Date();
        }
      };
      event.stopPropagation();
      event.preventDefault();
    };

    const handleFocus = (event: FocusEvent) => {
      keydowns.current['90'] = false;
      keydowns.current['83'] = false;
      keydowns.current['38'] = false;
      keydowns.current['40'] = false;
      const player = props.data.players[0];
      player.pos = getPlayerPosition(player);
      player.dir = 0;
      player.at = new Date();
    };

    if (props.playable) {
      window.addEventListener('keydown', handleKeyEvent);
      window.addEventListener('keyup', handleKeyEvent);
      window.addEventListener('blur', handleFocus);
    }

    return () => {
      if (props.playable) {
        window.removeEventListener('keydown', handleKeyEvent);
        window.removeEventListener('keyup', handleKeyEvent);
        window.removeEventListener('blur', handleFocus);
      }
    }
  }, [props.data, props.playable]);

  return (
    <React.Fragment>
    </React.Fragment>
  );
}

export default LogicGame;
