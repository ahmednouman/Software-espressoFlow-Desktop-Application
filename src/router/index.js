/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { ROUTES } from '../utils/RouterPath';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory as createHistory } from 'history';
import { oneTimeRoutes, publicRoutes } from './routerConfig';
import { PublicRoute, OneTimeRoutes } from './routes';
import DisplayWrapper from '../component/DisplayWrapper';
import useStore from '../store';
import Context from '../component/Context/index';
import Pen from '../component/Pen/Index';

const setVersionSelector = state => state.setVersion;
const startFlowHelperSelector = state => state.startFlowHelper;

const Main = () => {
  const history = createHistory();
  history.listen(_ => {
    window.scrollTo(0, 0);
  });

  const setHistory = useStore(state => state.setHistory);
  const setUser = useStore(state => state.setUser);
  const setVersion = useStore(setVersionSelector);
  const setPermission = useStore(state => state.setPermission);
  const startFlowHelper = useStore(startFlowHelperSelector);
  const checkFlowWindowPermissions = useStore(
    state => state.checkFlowWindowPermissions,
  );
  const onFlowWindowPermissions = useStore(
    state => state.onFlowWindowPermissions,
  );
  const getWorkspaceEnabled = useStore(state => state.getWorkspaceEnabled);
  const setWorkspaceEnabled = useStore(state => state.setWorkspaceEnabled);

  const getUpdatedFlag = useStore(state => state.getUpdatedFlag);
  const setUpdatedFlag = useStore(state => state.setUpdatedFlag);

  setHistory(history);

  if (window && window.electron) {
    window.electron.permission(arg => {
      if (arg === 0) {
        startFlowHelper();
        setPermission(true);
      }
    });

    checkFlowWindowPermissions();
    onFlowWindowPermissions();

    
    window.electron.onUpdatedFlag(arg => {
      setUpdatedFlag(arg);
    });
    getUpdatedFlag();

    window.electron.onWorkspaceEnabled(arg => {
      if (arg !== undefined) {
        setWorkspaceEnabled({value: arg});
      } else {
        setWorkspaceEnabled({value: false});
      }
    });
    getWorkspaceEnabled();

    window.electron.version(setVersion);
    window.electron.auth(user => {
      if (!user) return;
      setUser(user);
    });

    window.addEventListener('keydown', function (e) {
      if (e.keyCode === 88 && e.metaKey) {
        document.execCommand('cut');
      } else if (e.keyCode === 67 && e.metaKey) {
        document.execCommand('copy');
      } else if (e.keyCode === 86 && e.metaKey) {
        document.execCommand('paste');
      } else if (e.keyCode === 65 && e.metaKey) {
        document.execCommand('selectAll');
      } else if (e.keyCode === 90 && e.metaKey) {
        document.execCommand('undo');
      } else if (e.keyCode === 89 && e.metaKey) {
        document.execCommand('redo');
      }
    });
  }

  const search = history.location.search || '';

  return (
    <DisplayWrapper>
      <Router history={history}>
        <Switch>
          {oneTimeRoutes.map(publicRouteProps => (
            <OneTimeRoutes {...publicRouteProps} />
          ))}
          {publicRoutes.map(publicRouteProps => (
            <PublicRoute {...publicRouteProps} />
          ))}

          <Route path={ROUTES.CONTEXT} component={Context} />
          <Route path={ROUTES.PEN} component={Pen} />
          <Route
            render={() => {
              return search.includes('login') ? (
                <Redirect
                  to={{
                    pathname: ROUTES.LOGIN,
                    state: { from: '/' },
                  }}
                />
              ) : search.includes('tray') ? (
                <Redirect
                  to={{
                    pathname: ROUTES.TRAY,
                    state: { from: '/' },
                  }}
                />
              ) : search.includes('context') ? (
                <Redirect
                  to={{
                    pathname: ROUTES.CONTEXT,
                    state: { from: '/' },
                  }}
                />
              ) : (
                <Redirect
                  to={{
                    pathname: ROUTES.SCREEN_ONE_PATH,
                    state: { from: '/' },
                  }}
                />
              );
            }}
          />
        </Switch>
      </Router>
    </DisplayWrapper>
  );
};

export default Main;
