// router.tsx
import { createBrowserRouter } from 'react-router';
import Home from '../modules/Home';
import LayoutWithSidebar from '../ui/LayoutWithSidebar';
import { HomeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Jogging from '../modules/Jogging';

export enum Routes {
    Home = '/',
    Jogging = '/jogging',
    NotFound = '*',
}

export enum RouteNames {
    Home = 'Главная',
    Jogging = 'Бег',
}

export const RoutesConfig = {
    [Routes.Home]: { icon: <HomeOutlined />, name: RouteNames.Home },
    [Routes.Jogging]: {icon: <ThunderboltOutlined />, name: RouteNames.Jogging},
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWithSidebar />,
        children: [
            { index: true, element: <Home /> },
            { path: Routes.Jogging, element: <Jogging />},
            {
                path: Routes.NotFound,
                element: <Result status={404} title="404" subTitle="Такой страницы не существует" />,
            },
        ],
    },
]);

export default router;
