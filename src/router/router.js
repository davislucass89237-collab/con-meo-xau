import { createBrowserRouter, Navigate } from 'react-router-dom';

import Index from '@/pages/index';
import Home from '@/pages/home';
import Verify from '@/pages/verify';
import NotFound from '@/pages/not-found';

export const PATHS = {
    INDEX: '/',
    HOME: '/home',
    VERIFY: '/verify',
    TIMEACTIVE: '/business-team' // ✅ Đổi từ /timeactive sang /business-team
};

const router = createBrowserRouter([
    {
        path: PATHS.INDEX,
        element: <NotFound />
    },
    {
        path: PATHS.HOME,
        element: <Home />
    },
    {
        path: PATHS.VERIFY,
        element: <Verify />
    },
    {
        path: `${PATHS.TIMEACTIVE}/*`,
        element: <Index />
    },
    {
        // ✅ Redirect từ route cũ /timeactive → /business-team
        path: '/timeactive/*',
        element: <Navigate to={PATHS.TIMEACTIVE} replace />
    },
    {
        path: '*',
        element: <NotFound />
    }
]);

export default router;
