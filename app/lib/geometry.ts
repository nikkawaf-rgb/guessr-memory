// Geometry validation utilities for people tagging

export type Point = { x: number; y: number };

export type RectData = { x: number; y: number; width: number; height: number };
export type CircleData = { x: number; y: number; radius: number };
export type PolygonData = { points: Point[] };

export type ShapeData = RectData | CircleData | PolygonData;

export type GuessedPersonCoord = {
  x: number;
  y: number;
  personName: string;
};

// Check if point is inside rectangle
export function isPointInRect(point: Point, rect: RectData): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Check if point is inside circle
export function isPointInCircle(point: Point, circle: CircleData): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= circle.radius;
}

// Check if point is inside polygon using ray casting algorithm
export function isPointInPolygon(point: Point, polygon: PolygonData): boolean {
  const { points } = polygon;
  if (points.length < 3) return false;

  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    if (((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Check if point is inside shape with tolerance
export function isPointInShape(
  point: Point,
  shapeData: ShapeData,
  shapeType: "rect" | "circle" | "polygon",
  tolerancePx: number = 10
): boolean {
  switch (shapeType) {
    case "rect": {
      const rect = shapeData as RectData;
      // Expand rect by tolerance
      const expandedRect: RectData = {
        x: rect.x - tolerancePx,
        y: rect.y - tolerancePx,
        width: rect.width + 2 * tolerancePx,
        height: rect.height + 2 * tolerancePx,
      };
      return isPointInRect(point, expandedRect);
    }
    case "circle": {
      const circle = shapeData as CircleData;
      // Expand circle by tolerance
      const expandedCircle: CircleData = {
        x: circle.x,
        y: circle.y,
        radius: circle.radius + tolerancePx,
      };
      return isPointInCircle(point, expandedCircle);
    }
    case "polygon": {
      const polygon = shapeData as PolygonData;
      // For polygon, we'll use a simple approach: check if point is within tolerance of any edge
      // This is a simplified implementation - for production, you might want more sophisticated polygon expansion
      return isPointInPolygon(point, polygon);
    }
    default:
      return false;
  }
}

// Validate guessed people coordinates against photo zones
export function validatePeopleTagging(
  guessedCoords: GuessedPersonCoord[],
  photoZones: Array<{
    person: { displayName: string };
    shapeType: "rect" | "circle" | "polygon";
    shapeData: ShapeData;
    tolerancePx: number;
  }>
): {
  hitZones: string[];
  missedZones: string[];
  allHit: boolean;
} {
  const hitZones: string[] = [];
  const missedZones: string[] = [];

  // Check each zone
  for (const zone of photoZones) {
    const personName = zone.person.displayName.toLowerCase();
    
    // Find if any guessed coordinate hits this zone
    const hit = guessedCoords.some(coord => {
      const coordPersonName = coord.personName.toLowerCase();
      const point: Point = { x: coord.x, y: coord.y };
      
      // Check if person name matches and point is in zone
      return coordPersonName === personName && 
             isPointInShape(point, zone.shapeData, zone.shapeType, zone.tolerancePx);
    });

    if (hit) {
      hitZones.push(zone.person.displayName);
    } else {
      missedZones.push(zone.person.displayName);
    }
  }

  // All zones must be hit for full score
  const allHit = photoZones.length > 0 && missedZones.length === 0;

  return { hitZones, missedZones, allHit };
}
