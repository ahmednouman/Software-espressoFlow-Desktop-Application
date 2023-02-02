import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ROUTES } from '../utils/RouterPath';

export const PublicRoute = props => {
  const { layout: PublicLayout, component: Component, ...restProps } = props;
  return (
    <Route
      {...restProps}
      render={routeRenderProps =>
        window.innerWidth !== 400 ? (
          <PublicLayout {...routeRenderProps}>
            <Component {...routeRenderProps} />
          </PublicLayout>
        ) : (
          <Redirect
            to={{
              pathname: ROUTES.TRAY,
              state: { from: '/' },
            }}
          />
        )
      }
    />
  );
};

export const OneTimeRoutes = props => {
  const { layout: PublicLayout, component: Component, ...restProps } = props;
  return (
    <Route
      {...restProps}
      render={routeRenderProps => (
        <PublicLayout {...routeRenderProps}>
          <Component {...routeRenderProps} />
        </PublicLayout>
      )}
    />
  );
};
