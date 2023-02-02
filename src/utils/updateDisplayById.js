export const updateDisplayById = (get, id, keyValue) => {
  const displays = get().displays;
  const displayIndex = displays.findIndex(display => display.id === id);
  const updatedDisplay = {
    ...displays[displayIndex],
    ...keyValue,
  };
  const updatedDisplays = [
    ...displays.slice(0, displayIndex),
    updatedDisplay,
    ...displays.slice(displayIndex + 1),
  ];

  return updatedDisplays;
};
