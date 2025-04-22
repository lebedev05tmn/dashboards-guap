import { Layout, Menu, theme } from 'antd';
import { FC, useState } from 'react';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { RoutesConfig } from '../app/router';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const LayoutWithSidebar: FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();

    const getItem = (
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
    ): MenuItem => {
        return {
            key,
            icon,
            children,
            label,
            onClick: (item) => navigate(item.key),
        } as MenuItem;
    };

    const items: MenuItem[] = Object.entries(RoutesConfig).map(([key, value]) => getItem(value.name, key, value.icon));

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu
                    theme="dark"
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    items={items}
                    style={{ marginTop: '16px' }}
                />
            </Sider>
            <Layout>
                <Content style={{ margin: '16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: '95vh',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutWithSidebar;
