function closestPointOnSegment(x0, y0, x1, y1, px, py) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lengthSquared = dx * dx + dy * dy;
  let t = ((px - x0) * dx + (py - y0) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return { x: x0 + t * dx, y: y0 + t * dy };
}

function cos(i, n) {
  return Math.cos((2 * Math.PI * i) / n - Math.PI / 2);
}
function sin(i, n) {
  return Math.sin((2 * Math.PI * i) / n - Math.PI / 2);
}

function fibSquareData() {
  let signsX = [1, 1, -1, -1];
  let signsY = [1, -1, -1, 1];

  let signsArcX = [1, 0, -1, 0];
  let signsArcY = [0, -1, 0, 1];

  let pSize = 0;
  let cSize = 10;
  let pSizeFinal = 0;
  let cSizeFinal = 140;
  let x = 0;
  let y = 0;
  let xFinal = 0;
  let yFinal = 0;

  let data = [];
  let cumDelay = 0;
  for (let i = 0; i < 13; ++i) {
    let nx = x + signsX[i % 4] * cSize;
    let ny = y + signsY[i % 4] * cSize;
    let nxFinal = xFinal + signsX[i % 4] * cSizeFinal;
    let nyFinal = yFinal + signsY[i % 4] * cSizeFinal;

    let delay = 400;

    data.push({
      ax: x + signsArcX[i % 4] * cSize,
      ay: y + signsArcY[i % 4] * cSize,
      x: Math.min(nx, x),
      y: Math.min(ny, y),
      xFinal: Math.min(nxFinal, xFinal),
      yFinal: Math.min(nyFinal, yFinal),
      size: cSize,
      sizeFinal: cSizeFinal,
      delayArc: cumDelay,
      durationArc: delay,
      delayRect: cumDelay + 100,
      durationRect: delay,
      color: getColor(1, i),
      endAngle: Math.PI - ((i % 4) * Math.PI) / 2,
      startAngle: (Math.PI * 3) / 2 - ((i % 4) * Math.PI) / 2,
    });
    x = nx;
    y = ny;
    xFinal = nxFinal;
    yFinal = nyFinal;
    cumDelay += delay;
    [pSize, cSize] = [cSize, cSize + pSize];
    [pSizeFinal, cSizeFinal] = [cSizeFinal, cSizeFinal + pSizeFinal];
  }
  for (let i = 0; i < 13; ++i) {
    data[i].cumDelay = cumDelay;
  }
  return data;
}
