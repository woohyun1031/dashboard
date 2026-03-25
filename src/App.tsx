import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { DashboardGrid } from './components/Dashboard/DashboardGrid';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="controls" replace />,
            },
            {
                path: 'controls',
                element: <DashboardGrid />,
            },
            {
                path: '*',
                element: <div className="p-8 text-neutral-400">Placeholder for this section</div>,
            },
        ],
    },
]);

function App() {
    return (
        <div className="w-full min-h-screen bg-black text-white selection:bg-[#222222] selection:text-white">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
