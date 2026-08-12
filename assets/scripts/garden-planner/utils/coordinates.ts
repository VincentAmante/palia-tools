

export function translateCoordinates(coordinates: Coordinates, translateBy: { x: number; y: number; }): Coordinates {
  const oldCoordsObj = toCoordinateObject(coordinates);

  const newCoordsObj = {
    x: oldCoordsObj.x + translateBy.x,
    y: oldCoordsObj.y + translateBy.y
  };

  return fromCoordinateObject(newCoordsObj);
}

export type CoordinateObject = {
  x: number;
  y: number;
};

export type Coordinates = string;

export const fromCoordinateObject = (coordinates: CoordinateObject): Coordinates => `${coordinates.x},${coordinates.y}`;
export const toCoordinateObject = (key: Coordinates): CoordinateObject => {
  const [x, y] = key.split(',').map(Number);
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Attempted to parse a non-Coordinate string');
  }
  return { x, y };
};
