import { createRouter, createRoute, createRootRoute, Navigate } from '@tanstack/react-router';
import App from './App';
import MyCardsScreen from '@components/screens/MyCardsScreen';
import DealScreen from '@components/screens/DealScreen';
import MoreScreen from '@components/screens/MoreScreen';

const rootRoute = createRootRoute({ component: App });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: MyCardsScreen });
const dealRoute = createRoute({ getParentRoute: () => rootRoute, path: '/deal', component: DealScreen });
const moreRoute = createRoute({ getParentRoute: () => rootRoute, path: '/more', component: MoreScreen });
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '*', component: () => <Navigate to="/" /> });

const routeTree = rootRoute.addChildren([indexRoute, dealRoute, moreRoute, notFoundRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
