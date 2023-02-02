export const findDisplayById = (get, id) => {
  const displays = get().displays;
  const displayIndex = displays.findIndex(display => display.id === id);
  if (displayIndex === -1) return null;
  return displays[displayIndex];
};
