import { useRef, useEffect } from 'react'

interface point {
  x: number;
  y: number;
}

interface plane {
  n: point;
  pos: point;
  size?: number;
}


function v_dot(vector1: point, vector2: point): number {
  return (vector1.x * vector2.x
    + vector1.y * vector2.y
  );
}

function v_add(vector1: point, vector2: point): point {
  return ({
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y
  });
}

function v_sub(vector1: point, vector2: point): point {
  return ({
    x: vector1.x - vector2.x,
    y: vector1.y - vector2.y
  });
}

/*function v_multiplication(vector1: point, vector2: point): point {
  return ({
    x: vector1.x * vector2.x,
    y: vector1.y * vector2.y
  });
}*/

function v_scale(vector1: point, factor: number): point {
  return ({
    x: vector1.x * factor,
    y: vector1.y * factor
  });
}

/*function v_length(vector: point): number
{
  return (Math.sqrt(vector.x * vector.x
      + vector.y * vector.y
    ));
}

function v_norm(vector: point): point
{
  const length = v_length(vector);
  if (length > 0.0) {
    const ratio = 1.0 / length;
    vector.x *= ratio;
    vector.y *= ratio;
  }
  return (vector);
}*/

function pl_intersect(origin: point, dest: point, pl: { n: point, pos: point }): number {
  const ray: point = v_sub(dest, origin);
  const denominator = v_dot(pl.n, ray);
  if (Math.abs(denominator) > 0.0) {
    const pl_cam = v_sub(pl.pos, origin);
    const t = v_dot(pl_cam, pl.n) / denominator;
    if (t >= 0.000001)
      return (t);
  }
  return (-1);
}

function  pl_time_to_vector(origin: point, dest: point, time: number): point
{
  const ray: point = v_sub(dest, origin);
  return (v_add(origin, v_scale(ray, time)));
}

function draw(context: CanvasRenderingContext2D, tick: number) {
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
    pos: { x: 20, y: 164 },
    size: 20
  };

  const pr: plane = {
    n: { x: -1, y: 0 },
    pos: { x: 400 - 20, y: 210 },
    size: 20
  };

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
   border?: string
  }) {
  const canvasEl: { current: HTMLElement | null } = useRef(null);

  useEffect(() => {
    if (!canvasEl.current)
      canvasEl.current = document.getElementById('canvas-game');

    const canv: any = canvasEl.current;
    const context = canv.getContext('2d');
    let tick = 0;
    let animationFrameId: number;

    const render = () => {
      tick++;
      draw(context, tick);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  });

  return (
    <canvas id="canvas-game" width="400" height="300" style={{
      border: props.border,
      margin: 20
    }}></canvas>

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
