import React, { useRef, useState, useEffect } from 'react'
import { v_dot, v_sub, v_scale, pl_intersect, pl_time_to_vector, point, plane } from '../dep/minirt_functions'
import LogicGame, { dataCanvas, getPlayerPosition } from './LogicGame';

function draw(context: CanvasRenderingContext2D, tick: number, data: dataCanvas) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.fillStyle = 'black';
  context.beginPath();
  context.arc(50, 100, 20*Math.sin(+new Date()*0.003)**2, 0, 3*Math.PI);
  context.fill();

  // Centre de terrain
  context.strokeStyle = 'rgba(0,0,0,0.6)';
  context.lineWidth = 3;
  context.setLineDash([6, 4]);
  context.beginPath();
  context.moveTo(200, -3);
  context.lineTo(200, 300);
  context.stroke();

  context.fillStyle = 'black';
  context.strokeStyle = 'black';

  // Score
  context.font = '70px "Qahiri"';
  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.fillText('0',       80, 40);
  context.fillText('0', 400 - 80, 40);

  // Joueurs
  const pl: plane = {
    n: { x: 1, y: 0 },
    pos: { x: 20, y: 140 },
    size: 20
  };

  const pr: plane = {
    n: { x: -1, y: 0 },
    pos: { x: 400 - 20, y: 140 },
    size: 20
  };

  if (data.players) {
    if (data.players.length >= 1) {
      pl.pos.y = getPlayerPosition(data.players[0]);
      pl.size = data.players[0].size;
    }
    if (data.players.length >= 2) {
      pr.pos.y = getPlayerPosition(data.players[1]);
      pl.size = data.players[1].size;
    }
  }

  context.lineWidth = 5;
  context.setLineDash([]);

  const players: plane[] = [pl, pr];
  for (let i = 0; i < players.length; i++) {
    context.beginPath();
    context.moveTo(players[i].pos.x - 2 * players[i].n.x, players[i].pos.y);
    context.lineTo(players[i].pos.x - 2 * players[i].n.x, players[i].pos.y + (players[i].size || 0));
    context.stroke();
  }

  // Balle
  context.fillRect(320, 240, 6, 6);

  const dir: point = {
    x: Math.cos(Math.PI/4 * (+new Date()/10)*0.004),
    y: Math.sin(Math.PI/4 * (+new Date()/10)*0.004)
  };

  /*const dir: point = {
    x: .66,
    y: .34
  };*/

  const bt: plane = {
    n: { x: 0, y: 1 },
    pos: { x: 0, y: 0 }
  };

  const bb: plane = {
    n: { x: 0, y: -1 },
    pos: { x: 0, y: 300 }
  };

  const bl: plane = {
    n: { x: 1, y: 0 },
    pos: { x: 0, y: 0 }
  };

  const br: plane = {
    n: { x: -1, y: 0 },
    pos: { x: 400, y: 0 }
  };

  const start: point = { x: 123, y: 184 };

  //start
  context.fillStyle = 'red';
  context.fillRect(start.x - 3, start.y - 3, 6, 6);
  context.strokeStyle = 'white';
  context.lineWidth = 2;

  let planes: plane[] = [pl, pr, bt, bb];
  let i = -1, a: point, b: point, ray: point, time: number, point: point | null = null, max: number = 0;
  a = {...start};
  ray = {...dir};
  do {
    b = { x: a.x + 20 * ray.x, y: a.y + 20 * ray.y }
    time = -1;
    for (i = 0; i < planes.length; i++)
      if ((time = pl_intersect(a, b, planes[i])) > -1) {
        point = pl_time_to_vector(a, b, time);
        if (planes[i].size && !(planes[i].pos.y <= point.y && point.y <= planes[i].pos.y + (planes[i].size || 0)))
          continue ;
        break ;
      }

    if (time > -1 && point) {
      context.fillStyle = 'orange';
      context.strokeStyle = 'orange';
      context.beginPath();
      context.lineTo(a.x, a.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.fillRect(point.x - 3, point.y - 3, 6, 6);
      ray = v_sub(ray, v_scale(planes[i].n, 2.0 * v_dot(planes[i].n, ray)));
      a = {...point};
    } else {
      context.strokeStyle = 'white';
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  } while(time > -1 && point && 0 <= point.x && point.x <= 400 && ++max < 100)

  planes = [pl, pr, bl, br];
  a = {...start};
  ray = {...dir};
  b = { x: a.x + 20 * ray.x, y: a.y + 20 * ray.y }
  time = -1;
  for (i = 0; i < planes.length; i++)
    if ((time = pl_intersect(a, b, planes[i])) > -1) {
      point = pl_time_to_vector(a, b, time);
      if (!(0 <= point.y && point.y <= 300)) {
        point.y = Math.abs(point.y);
        const pair = Math.floor(point.y / 300) % 2;
        point.y = point.y % 300;
        if (pair) 
          point.y = 300 - point.y;
      }
      if (planes[i].size && !(planes[i].pos.y <= point.y && point.y <= planes[i].pos.y + (planes[i].size || 0)))
        continue ;
      break ;
    }
  point = pl_time_to_vector(a, b, time);

  if (time > -1) {
    if (!(0 <= point.y && point.y <= 300)) {
      point.y = Math.abs(point.y);
      const pair = Math.floor(point.y / 300) % 2;
      point.y = point.y % 300;
      if (pair) 
        point.y = 300 - point.y;
    }
    context.fillStyle = 'white';
    context.fillRect(point.x - 3, point.y - 3, 6, 6);
  }
}

function CanvasGame(props: {
   playable?: boolean,
   border?: string
  }) {
  const canvasEl: { current: HTMLElement | null } = useRef(null);
  const [data/*, setData*/] = useState({} as dataCanvas);

  useEffect(() => {
    if (!canvasEl.current)
      canvasEl.current = document.getElementById('canvas-game');

    const canv: any = canvasEl.current;
    const context = canv.getContext('2d');
    let tick = 0;
    let animationFrameId: number;

    const render = () => {
      tick++;
      draw(context, tick, data);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  });

  return (
    <React.Fragment>
      <canvas id="canvas-game" width="400" height="300" style={{
        border: props.border,
        margin: 20
      }}></canvas>
      <LogicGame data={data} playable={props.playable?true:false} />
    </React.Fragment>
  );
}

export default CanvasGame;

/*
const canvas = (draw: Function) => {
  
  useEffect(() => {

  }, [draw])
  
  return <canvas ref={canvasRef} />
}

export default useCanvas;*/