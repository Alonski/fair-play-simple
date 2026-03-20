import { createRouter, createRoute, createRootRoute, Navigate, lazyRouteComponent } from '@tanstack/react-router';
import App from './App';

const rootRoute = createRootRoute({ component: App });

// Route-level code splitting: each screen is a separate lazy-loaded chunk
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('@components/screens/MyCardsScreen')),
});
const dealRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deal',
  component: lazyRouteComponent(() => import('@components/screens/DealScreen')),
});
const moreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/more',
  component: lazyRouteComponent(() => import('@components/screens/MoreScreen')),
});
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '*', component: () => <Navigate to="/" /> });

const routeTree = rootRoute.addChildren([indexRoute, dealRoute, moreRoute, notFoundRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
