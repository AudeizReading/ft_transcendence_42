import React, { useRef, useEffect, useState } from 'react'
import socketIOClient, { Socket } from "socket.io-client";
import { DataElement, DataGame } from '../dep/minirt_functions'

import { fetch_opt } from '../dep/fetch'

interface pingpongData {
  first: number,
  second: number,
  third: number,
  fourth: number,
  fifth: number
}

export function getPlayerPosition(player: DataElement): number {
  if (player.at !== null && player.dir !== 0) {
    // https://stackoverflow.com/q/153507/
    const time = (+player.at - +new Date()) / 1000;
    const speed = player.speed * (player.dir as number);
    //const delta = player.speed * player.dir * time;
    const delta = (1 / 2) * speed * (time * time);
    return Math.min(300 - player.size, Math.max(0, (player.pos as number) + delta));
  } else {
    return player.pos as number;
  }
}

function LogicGame(props: {
   playable: boolean,
   gameId: string | number,
   data: DataGame,
  }) {
  const loaded = useRef(false);
  const keydowns = useRef({
    '87': false,
    '90': false,
    '83': false,
    '38': false,
    '40': false
  });

  const [data, setData] = useState(props.data)
  if (!loaded.current) {
    setData(data);
    loaded.current = true;
  }

  const gameSocket = useRef(null as any);
  useEffect(() => {
    let socket: Socket;
    if (!gameSocket.current) {
      let latence = 0
      let diff_datetime = 0
      socket = socketIOClient('ws://' + window.location.hostname + ':8192/game?page=game&gameid=' + String(props.gameId), {
        extraHeaders: fetch_opt().headers
      });
      gameSocket.current = socket;

      socket.on('dataGame', (newData: DataGame) => {
        data.players = newData.players;
        data.ball = newData.ball;
        setData(data);
        console.log(data);
      })

      setTimeout(() => {
        socket.emit('ping', {
          first: +new Date(), // client
          second: 0,
          third: 0, // client
          fourth: 0,
          fifth: 0 // client
        }, (data: pingpongData) => {
          data.third = +new Date();
          socket.emit('pong', data, (data: pingpongData) => {
            data.fifth = +new Date();
            latence = (data.fifth - data.first) / 2;
            const [a, b, c, d] = [data.second - data.first, data.third - data.second,
              data.fourth - data.third, data.fifth - data.fourth];
            const diffs = [a - latence, -(b - latence), c - latence, -(d - latence)];
            const diff_datetime = diffs.reduce(function(a, b) { return a + b; }, 0) / diffs.length;
            console.info('latence', latence, 'diff_datetime', diff_datetime); // positif = navigateur en retard, négatif = server en retard
            /*console.log(a, b, c, d, diff_datetime);
            console.log(a - diff_datetime, b + diff_datetime, c - diff_datetime, d + diff_datetime, a + b + c + d, data.fifth - data.first);
            console.log(data.third - data.first, data.fifth - data.third);
            console.log(data.fourth - data.second);
            console.log(diffs);*/
          });
        });
      }, 1000);
      /*socket.on('message', (data) => {
        console.log(data);
      });*/
    } else {
      socket = gameSocket.current;
    }

    const handleKeyEvent = (event: KeyboardEvent) => {
      if (event.repeat)
        return ;
      if (!(event.keyCode === 87 || event.keyCode === 90 || event.keyCode === 83 // W - S
            || event.keyCode === 38 || event.keyCode === 40)) // arrow: ^ - v
        return ;
      if (event.type === 'keydown') {
        const target = event.target as HTMLElement;
        if (target !== null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
              || target.contentEditable === 'TEXTAREA')) // On bloque à l'activation, on laisse désactiver la touche
          return ;
        keydowns.current[event.keyCode] = true;
        const player = props.data.players[0];
        player.pos = Math.round(getPlayerPosition(player));
        player.dir = (event.keyCode === 87 || event.keyCode === 90 || event.keyCode === 38) ? -1 : +1; // if TOP -1 else +1
        player.at = +new Date();
        socket.emit('move', player);
      } else if (event.type === 'keyup') {
        keydowns.current[event.keyCode] = false;
        const player = props.data.players[0];
        let nextdir = 0;
        // TODO: Ajout d'une queue sur les touches enfoncées ? Parce que le dessus à toujours l'avantage sur la touche du bas
        if (keydowns.current['87'] || keydowns.current['90'] || keydowns.current['38'])
          nextdir = -1;
        else if (keydowns.current['83'] || keydowns.current['40'])
          nextdir = 1;
        if (player.dir !== nextdir) {
          player.pos = Math.round(getPlayerPosition(player));
          player.dir = nextdir;
          player.at = +new Date();
          socket.emit('move', player);
        }
      };
      event.stopPropagation();
      event.preventDefault();
    };

    const handleFocus = (event: FocusEvent) => {
      keydowns.current['87'] = false;
      keydowns.current['90'] = false;
      keydowns.current['83'] = false;
      keydowns.current['38'] = false;
      keydowns.current['40'] = false;
      const player = props.data.players[0];
      player.pos = Math.round(getPlayerPosition(player));
      player.dir = 0;
      player.at = +new Date();
      socket.emit('move', player);
    };

    if (props.playable) {
      window.addEventListener('keydown', handleKeyEvent);
      window.addEventListener('keyup', handleKeyEvent);
      window.addEventListener('blur', handleFocus);
    }

    return () => {
      if (socket) {
        //socket.close();
        //gameSocket.current = null;
      }

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
