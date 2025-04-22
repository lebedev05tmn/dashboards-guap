// router.tsx
import { createBrowserRouter } from 'react-router';
import Home from '../modules/Home';
import LayoutWithSidebar from '../ui/LayoutWithSidebar';
import { HomeOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Inflation from '../modules/Inflation';

export enum Routes {
    Home = '/',
    Inflation = '/inflation',
    NotFound = '*',
}

export enum RouteNames {
    Home = 'Главная',
    Inflation = 'Инфляция',
}

export const RoutesConfig = {
    [Routes.Home]: { icon: <HomeOutlined />, name: RouteNames.Home },
    [Routes.Inflation]: { icon: <MoneyCollectOutlined />, name: RouteNames.Inflation },
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWithSidebar />,
        children: [
            { index: true, element: <Home /> },
            { path: Routes.Inflation, element: <Inflation /> },
            {
                path: Routes.NotFound,
                element: <Result status={404} title="404" subTitle="Такой страницы не существует" />,
            },
        ],
    },
]);

export default router;
