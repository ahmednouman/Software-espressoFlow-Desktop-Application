export const splitDisplayArrangement = displays => {
  const up = displays
    .filter(e => e.location.y <= 0)
    .sort(function (a, b) {
      return a.location.x - b.location.x;
    });
  const down = displays.filter(e => e.location.y > 0);
  return { up, down };
};
