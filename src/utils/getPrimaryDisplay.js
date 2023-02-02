export const getPrimaryDisplay = get => {
  const displays = get().displays;
  const primaryIndex = displays.findIndex(display => display.is_main === true);
  return displays[primaryIndex];
};
