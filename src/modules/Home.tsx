import { Layout, Card, Row, Col, Typography } from 'antd';
import { AppstoreOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { FC } from 'react';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

const Home: FC = () => {
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
                            <div
                                style={{
                                    height: 200,
                                    background: '#f0f2f5',
                                    marginTop: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#888',
                                }}
                            >
                                График статистики
                            </div>
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

                {/* Дополнительный контент */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card>
                            <Title level={5}>Последняя активность</Title>
                            <div
                                style={{
                                    height: 300,
                                    background: '#f0f2f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#888',
                                }}
                            >
                                Лента активности
                            </div>
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
