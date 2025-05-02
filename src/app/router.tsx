// router.tsx
import { createBrowserRouter } from 'react-router';
import Home from '../modules/Home';
import LayoutWithSidebar from '../ui/LayoutWithSidebar';
import { HomeOutlined, MoneyCollectOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Inflation from '../modules/Inflation';
import BirthStatistics from '../modules/BirthStats'
import Jogging from '../modules/Jogging';

export enum Routes {
    Home = '/',
    Inflation = '/inflation',
    BirthStats  = '/birth-stats',
    Jogging = '/jogging',
    NotFound = '*',
}

export enum RouteNames {
    Home = 'Главная',
    Inflation = 'Инфляция',
    BirthStats  = 'Рождаемость',
    Jogging = 'Бег',
}

export const RoutesConfig = {
    [Routes.Home]: { icon: <HomeOutlined />, name: RouteNames.Home },
    [Routes.Inflation]: { icon: <MoneyCollectOutlined />, name: RouteNames.Inflation },
    [Routes.BirthStats]: { icon: <TeamOutlined />, name: RouteNames.BirthStats },
    [Routes.Jogging]: {icon: <ThunderboltOutlined />, name: RouteNames.Jogging},
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWithSidebar />,
        children: [
            { index: true, element: <Home /> },
            { path: Routes.Inflation, element: <Inflation /> },
            { path: Routes.BirthStats, element: <BirthStatistics /> },
            { path: Routes.Jogging, element: <Jogging />},
            {
                path: Routes.NotFound,
                element: <Result status={404} title="404" subTitle="Такой страницы не существует" />,
            },
        ],
    },
]);

export default router;
