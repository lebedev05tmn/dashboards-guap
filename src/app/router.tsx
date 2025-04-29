import { createBrowserRouter } from 'react-router';
import Home from '../modules/Home';
import LayoutWithSidebar from '../ui/LayoutWithSidebar';
import { HomeOutlined, MoneyCollectOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Inflation from '../modules/Inflation';
import Migration from '../modules/Migration';
import Jogging from '../modules/Jogging';

export enum Routes {
    Home = '/',
    Inflation = '/inflation',
    Migration = '/migration',
    Jogging = '/jogging',
    NotFound = '*',
}

export enum RouteNames {
    Home = 'Главная',
    Inflation = 'Инфляция',
    Migration = 'Миграции',
    Jogging = 'Бег',
}

export const RoutesConfig = {
    [Routes.Home]: { icon: <HomeOutlined />, name: RouteNames.Home },
    [Routes.Inflation]: { icon: <MoneyCollectOutlined />, name: RouteNames.Inflation },
    [Routes.Migration]: { icon: <TeamOutlined />, name: RouteNames.Migration },
    [Routes.Jogging]: { icon: <ThunderboltOutlined />, name: RouteNames.Jogging },
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWithSidebar />,
        children: [
            { index: true, element: <Home /> },
            { path: Routes.Inflation, element: <Inflation /> },
            { path: Routes.Migration, element: <Migration /> },
            { path: Routes.Jogging, element: <Jogging /> },
            {
                path: Routes.NotFound,
                element: <Result status={404} title="404" subTitle="Такой страницы не существует" />,
            },
        ],
    },
]);

export default router;
