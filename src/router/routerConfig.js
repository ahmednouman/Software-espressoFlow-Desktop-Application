import { ROUTES } from '../utils/RouterPath';
import ScreenOne from '../container/Screen-1';
import ScreenTwo from '../container/Screen-2';
import ScreenThree from '../container/Screen-3';
import WindowManagement from '../container/Window-Management';
import ScreensPermissions from '../component/Screen-Permissions';
import Login from '../component/Login/index';
import Tray from '../component/TrayMenu/Tray';
import Context from '../component/Context/index';
import Pen from '../component/Pen/Index';
import Gesture from "../component/Gesture/index"
import { PublicLayout, NoLayout } from './routerLayout';

export const oneTimeRoutes = [
  {
    key: 'ScreenOne',
    path: ROUTES.SCREEN_ONE_PATH,
    component: ScreenOne,
    exact: true,
    layout: PublicLayout,
  },
  {
    key: 'ScreenTwo',
    path: ROUTES.SCREEN_TWO_PATH,
    component: ScreenTwo,
    exact: true,
    layout: PublicLayout,
  },
  {
    key: 'ScreenPermissions',
    path: ROUTES.SCREEN_PERMISSIONS,
    component: ScreensPermissions,
    exact: true,
    layout: PublicLayout,
  },
  {
    key: 'WindowManagement',
    path: `${ROUTES.WINDOW_MANAGEMENT}`,
    component: WindowManagement,
    exact: true,
    layout: PublicLayout,
  },
  {
    key: 'Login',
    path: ROUTES.LOGIN,
    component: Login,
    exact: true,
    layout: NoLayout,
  },
  {
    key: 'Tray',
    path: ROUTES.TRAY,
    component: Tray,
    exact: true,
    layout: NoLayout,
  },
  {
    key: 'Context',
    path: ROUTES.CONTEXT,
    component: Context,
    exact: true,
    layout: NoLayout,
  },
  {
    key: 'Pen',
    path: ROUTES.PEN,
    component: Pen,
    exact: true,
    layout: PublicLayout,
  },
  {
    key: 'gesture',
    path: ROUTES.GESTURE,
    component: Gesture,
    exact: true,
    layout: PublicLayout,
  }
];

export const publicRoutes = [
  {
    key: 'ScreenThree',
    path: ROUTES.SCREEN_THREE_PATH,
    component: ScreenThree,
    exact: true,
    layout: PublicLayout,
  },
];
