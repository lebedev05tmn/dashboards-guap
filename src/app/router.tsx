// router.tsx
import { createBrowserRouter } from 'react-router';
import Home from '../modules/Home';
import LayoutWithSidebar from '../ui/LayoutWithSidebar';
import { HomeOutlined, MoneyCollectOutlined, TeamOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Inflation from '../modules/Inflation';
import BirthStatistics from '../modules/BirthStats'

export enum Routes {
    Home = '/',
    Inflation = '/inflation',
    BirthStats  = '/birth-stats',
    NotFound = '*',
}

export enum RouteNames {
    Home = 'Главная',
    Inflation = 'Инфляция',
    BirthStats  = 'Статистика Рождаемости',
}

export const RoutesConfig = {
    [Routes.Home]: { icon: <HomeOutlined />, name: RouteNames.Home },
    [Routes.Inflation]: { icon: <MoneyCollectOutlined />, name: RouteNames.Inflation },
    [Routes.BirthStats]: { icon: <TeamOutlined />, name: RouteNames.BirthStats },
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWithSidebar />,
        children: [
            { index: true, element: <Home /> },
            { path: Routes.Inflation, element: <Inflation /> },
            { path: Routes.BirthStats, element: <BirthStatistics /> },
            {
                path: Routes.NotFound,
                element: <Result status={404} title="404" subTitle="Такой страницы не существует" />,
            },
        ],
    },
]);

export default router;
