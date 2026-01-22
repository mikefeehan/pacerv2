import type { GPSPoint } from './gps-tracking';

/**
 * Build a GPX file content from GPS points
 * Format compliant with Strava and other GPX readers
 */
export function buildGpx(config: {
  name: string;
  description: string;
  points: GPSPoint[];
}): string {
  const { name, description, points } = config;

  if (points.length === 0) {
    throw new Error('Cannot generate GPX: no GPS points provided');
  }

  const startTime = points[0].timestamp;

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PACER App"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <desc>${escapeXml(description)}</desc>
    <time>${startTime}</time>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <type>running</type>
    <trkseg>
`;

  for (const point of points) {
    gpx += `      <trkpt lat="${point.latitude}" lon="${point.longitude}">
`;
    if (point.altitude !== null && point.altitude !== undefined) {
      gpx += `        <ele>${point.altitude.toFixed(1)}</ele>
`;
    }
    gpx += `        <time>${point.timestamp}</time>
`;
    if (point.accuracy !== null && point.accuracy !== undefined) {
      gpx += `        <extensions><accuracy>${point.accuracy.toFixed(1)}</accuracy></extensions>
`;
    }
    gpx += `      </trkpt>
`;
  }

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
