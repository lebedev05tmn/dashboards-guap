import { Layout, Card, Row, Col, Typography, List, Space, Tag } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CommentOutlined,
    FileAddOutlined,
} from '@ant-design/icons';
import { FC, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartTypeRegistry } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

ChartJS.register(ArcElement, Tooltip, Legend);

const activityData = [
    {
        id: 1,
        user: 'Иван Петров',
        action: 'завершил задачу',
        target: 'Проект Альфа',
        time: '10 минут назад',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        type: 'success',
    },
    {
        id: 2,
        user: 'Анна Сидорова',
        action: 'добавила новый документ',
        target: 'Техническое задание',
        time: '1 час назад',
        icon: <FileAddOutlined style={{ color: '#1890ff' }} />,
        type: 'info',
    },
    {
        id: 3,
        user: 'Сергей Иванов',
        action: 'добавил нового участника',
        target: 'Максим Кузнецов',
        time: '2 часа назад',
        icon: <FileAddOutlined style={{ color: '#722ed1' }} />,
        type: 'team',
    },
    {
        id: 4,
        user: 'Елена Смирнова',
        action: 'оставила комментарий',
        target: 'Дизайн макеты',
        time: '5 часов назад',
        icon: <CommentOutlined style={{ color: '#faad14' }} />,
        type: 'comment',
    },
    {
        id: 5,
        user: 'Дмитрий Васильев',
        action: 'завершил задачу',
        target: 'Интеграция API',
        time: 'вчера',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        type: 'success',
    },
];

const Home: FC = () => {
    const chartRef = useRef<ChartJS<keyof ChartTypeRegistry, number[], string> | null>(null);

    const data = {
        labels: ['Завершено', 'В работе', 'На паузе'],
        datasets: [
            {
                data: [65, 25, 10],
                backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
                borderWidth: 1,
            },
        ],
    };

    const getTagColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'green';
            case 'info':
                return 'blue';
            case 'team':
                return 'purple';
            case 'comment':
                return 'gold';
            default:
                return 'blue';
        }
    };

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                chartRef.current.destroy();
            }
        };
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ margin: '24px 16px 0' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Title level={5}>
                                <BarChartOutlined /> Статистика
                            </Title>
                            <Text>Ваша эффективность за месяц</Text>
                            <Doughnut data={data} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Title level={5}>
                                <AppstoreOutlined /> Последние проекты
                            </Title>
                            <div style={{ marginTop: 16 }}>
                                <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>Проект Альфа</div>
                                <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>Проект Бета</div>
                                <div style={{ padding: '8px 0' }}>Проект Гамма</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Card>
                            <Title level={5}>
                                <CalendarOutlined /> Ближайшие события
                            </Title>
                            <div style={{ marginTop: 16 }}>
                                <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Text strong>Совещание команды</Text>
                                    <br />
                                    <Text type="secondary">Сегодня, 15:00</Text>
                                </div>
                                <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Text strong>Демонстрация продукта</Text>
                                    <br />
                                    <Text type="secondary">Завтра, 10:00</Text>
                                </div>
                                <div style={{ padding: '8px 0' }}>
                                    <Text strong>Квартальный обзор</Text>
                                    <br />
                                    <Text type="secondary">В следующий понедельник, 09:00</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card>
                            <Title level={5}>Последняя активность</Title>
                            <List
                                itemLayout="horizontal"
                                dataSource={activityData}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={item.icon}
                                            title={
                                                <Space>
                                                    <Text strong>{item.user}</Text>
                                                    <Text>{item.action}</Text>
                                                    <Text strong>{item.target}</Text>
                                                </Space>
                                            }
                                            description={
                                                <Space>
                                                    <Tag color={getTagColor(item.type)}>
                                                        {item.type === 'success' && 'Задача'}
                                                        {item.type === 'info' && 'Документ'}
                                                        {item.type === 'team' && 'Команда'}
                                                        {item.type === 'comment' && 'Комментарий'}
                                                    </Tag>
                                                    <Text type="secondary">{item.time}</Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Панель Управления ©{new Date().getFullYear()} Создано с использованием Ant Design
            </Footer>
        </Layout>
    );
};

export default Home;
