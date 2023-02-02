import { BehaviorSubject } from 'rx';


export const SNAPPING_WALKTHROUGH = {
  START: 0,
  SNAPPING_GIF_KEYBOARD: 1,
  SNAPPING_KEYBOARD_SHORTCUTS: 2,
  SNAPPING_DRAG_GIF: 3,
  WORKSPACE_START: 4,
  WORKSPACE_ADD_NEW_WORKSPACE: 5,
  WORKSPACE_APP_TRAY: 6,
  WORKSPACE_ADD_BUTTON: 7,
  WORKSPACE_SELECT_APP: 8,
  WORKSPACE_DRAG_APP: 9,
  WORKSPACE_ENTER_NAME: 10,
  WORKSPACE_SAVE: 11,
  WORKSPACE_HOLDER: 12,
  WORKSPACE_LAUNCH_NEW: 13,
  FINISH: 14
};

export const ARRANGEMENT_WALKTHROUGH = {
  START: 0,
  CONNECT_ESPRESSO: 1,
  ARRANGE_ICONS: 2,
  CLICK_ON_ESPRESSO: 3,
  ADJUST_SETTINGS: 4,
  MANUAL_ROTATE: 5,
  AUTO_ROTATE: 6,
  FINISH: 7
};

export const baseImagePath = path_url => {
  try {
    return process.env.NODE_ENV === 'development'
      ? require(`../assets/sass/images/${path_url}`).default
      : window.electron.fileAPI.getPath(path_url);
  } catch (error) {
    console.log(error)
    return ""
  }

};

export const TextTruncate = (str, limit) => {
  if (str && str.length >= limit) return str.substring(0, limit) + '...';
  return str;
};

export const isDialogOpen = new BehaviorSubject(false);

export const osFinder = platform => {
  return navigator.platform.indexOf(platform) > -1;
};

export const generateRandomColor = () => {
  var firstColor =
    '#' + (Math.random().toString(16) + '000000').substring(2, 8);
  var secondColor =
    '#' + (Math.random().toString(16) + '000000').substring(2, 8);
  return [firstColor, secondColor];
};

export const generateGradient = (color1, color2) => {
  const directions = ['top', 'bottom', 'left', 'right'];
  const randomIndex = Math.floor(Math.random() * 4 - 0 + 1) + 0;
  return `linear-gradient(to ${directions[randomIndex]}, ${color1}, ${color2})`;
};

export const generateRandomGradient = () => {
  const gradients = [
    'linear-gradient(191.46deg, #01ABDE -51.7%, #FED8CE -11.84%, #8115CC 33.85%, #401D8F 75.21%)',
    'linear-gradient(227.23deg, #01ABDE 25.32%, #401D8F 76.6%)',
    'linear-gradient(65.06deg, #E85E48 4.51%, #FFFFFF 106.08%)',
    'linear-gradient(65.06deg, #87E878 4.51%, #FFFFFF 106.08%)',
    'linear-gradient(120.17deg, #6B1CB5 58.66%, #0095E5 101.67%)',
    'radial-gradient(79.44% 142.16% at 79.44% 75%, rgba(196, 196, 196, 0.7) 0%, #FFFFFF 90%)',
    'linear-gradient(54.23deg, #7B61FF 23.28%, #D5FD5E 88.4%)',
    'linear-gradient(54.23deg, #87E878 23.28%, #D5FD5E 88.4%)',
    'linear-gradient(245.69deg, #FF5C35 14.94%, #D5FD5E 91.49%)',
  ];

  const randomIndex = Math.floor(Math.random() * gradients.length + 1);
  return gradients[randomIndex];
};

export const generateTransparentColor = (color, newAlpha) => {
  const indexAlpha = color.lastIndexOf(',') + 1;
  const hue = color.substring(0, indexAlpha);

  const tint = hue + newAlpha + ")";

  // console.log("in generateTransparentColor: ", color, newAlpha, hue, tint);

  return tint;
};

export const ColorPalette = {
  espresso: 'rgba(48, 48, 48, 1)',
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(16, 24, 40, 1)',
  purple: 'rgba(96, 38, 158, 1)',
  orange: 'rgba(255, 92, 53, 1)',
  yellow: 'rgba(204, 255, 51, 1)',
  darkgrey: 'rgba(90, 90, 90, 1)',
  lilac: 'rgba(201, 157, 248, 1)',
  green: 'rgba(113, 255, 1, 1)',
};

export const textLight = ColorPalette.white;
export const textDark = ColorPalette.espresso;

export const ColorCombinations = [
  { backgroundColor: ColorPalette.purple, textColor: textLight },
  { backgroundColor: ColorPalette.orange, textColor: textLight },
  { backgroundColor: ColorPalette.yellow, textColor: textDark },
  { backgroundColor: ColorPalette.black, textColor: textLight },

  { backgroundColor: ColorPalette.darkgrey, textColor: textLight },
  { backgroundColor: ColorPalette.white, textColor: textDark },
  { backgroundColor: ColorPalette.lilac, textColor: textDark },
  { backgroundColor: ColorPalette.green, textColor: textDark },
];

export default SNAPPING_WALKTHROUGH;

