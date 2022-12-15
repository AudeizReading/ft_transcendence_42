export interface point {
  x: number;
  y: number;
}

export interface plane {
  n: point;
  pos: point;
  size?: number;
}

export function v_dot(vector1: point, vector2: point): number {
  return (vector1.x * vector2.x
    + vector1.y * vector2.y
  );
}

export function v_add(vector1: point, vector2: point): point {
  return ({
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y
  });
}

export function v_sub(vector1: point, vector2: point): point {
  return ({
    x: vector1.x - vector2.x,
    y: vector1.y - vector2.y
  });
}

export function v_multiplication(vector1: point, vector2: point): point {
  return ({
    x: vector1.x * vector2.x,
    y: vector1.y * vector2.y
  });
}

export function v_scale(vector1: point, factor: number): point {
  return ({
    x: vector1.x * factor,
    y: vector1.y * factor
  });
}

export function v_length(vector: point): number
{
  return (Math.sqrt(vector.x * vector.x
      + vector.y * vector.y
    ));
}

export function v_norm(vector: point): point
{
  const length = v_length(vector);
  if (length > 0.0) {
    const ratio = 1.0 / length;
    vector.x *= ratio;
    vector.y *= ratio;
  }
  return (vector);
}

export function pl_intersect(origin: point, dest: point, pl: { n: point, pos: point }): number {
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

export function  pl_time_to_vector(origin: point, dest: point, time: number): point
{
  const ray: point = v_sub(dest, origin);
  return (v_add(origin, v_scale(ray, time)));
}
