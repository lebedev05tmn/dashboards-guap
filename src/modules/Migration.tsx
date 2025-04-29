import { FC, useState, useEffect } from 'react';
import { Table, Card, Row, Col, InputNumber, Divider, Typography, Alert } from 'antd';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from 'chart.js';
import { ContextProxy } from 'chart.js/helpers';
import migrationData from '../../config/migration.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type MigrationData = {
    year: number;
    immigrants: number;
    emigrants: number;
    netMigration: number;
    isPredicted?: boolean;
};

const { Title: AntTitle, Text } = Typography;

const MigrationDashboard: FC = () => {
    const [yearsToPredict, setYearsToPredict] = useState<number>(3);
    const [windowSize, setWindowSize] = useState<number>(3);
    const [originalData, setOriginalData] = useState<MigrationData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Преобразуем данные из JSON в нужный формат
        const formattedData = migrationData
            .map((item) => ({
                year: item.year,
                immigrants: item.immigrants,
                emigrants: item.emigrants,
                netMigration: item.netMigration,
            }))
            .sort((a, b) => a.year - b.year);

        setOriginalData(formattedData);
        setLoading(false);
    }, []);

    const columns = [
        {
            title: 'Год',
            dataIndex: 'year',
            key: 'year',
            sorter: (a: MigrationData, b: MigrationData) => a.year - b.year,
        },
        {
            title: 'Иммигранты',
            dataIndex: 'immigrants',
            key: 'immigrants',
            sorter: (a: MigrationData, b: MigrationData) => a.immigrants - b.immigrants,
            render: (value: number, record: MigrationData) => (
                <span style={{ color: record.isPredicted ? 'orange' : 'inherit' }}>{value.toLocaleString()}</span>
            ),
        },
        {
            title: 'Эмигранты',
            dataIndex: 'emigrants',
            key: 'emigrants',
            sorter: (a: MigrationData, b: MigrationData) => a.emigrants - b.emigrants,
            render: (value: number, record: MigrationData) => (
                <span style={{ color: record.isPredicted ? 'orange' : 'inherit' }}>{value.toLocaleString()}</span>
            ),
        },
        {
            title: 'Сальдо миграции',
            dataIndex: 'netMigration',
            key: 'netMigration',
            sorter: (a: MigrationData, b: MigrationData) => a.netMigration - b.netMigration,
            render: (value: number, record: MigrationData) => (
                <span
                    style={{
                        color:
                            value > 0
                                ? record.isPredicted
                                    ? '#ffa940'
                                    : 'green'
                                : record.isPredicted
                                ? '#ffa940'
                                : 'red',
                    }}
                >
                    {value.toLocaleString()}
                </span>
            ),
        },
    ];

    const calculatePercentageChanges = (data: MigrationData[]) => {
        return data.map((item, index) => {
            if (index === 0) return { ...item, immigrantsChange: 0, emigrantsChange: 0 };

            const prevImm = data[index - 1].immigrants;
            const prevEm = data[index - 1].emigrants;

            return {
                ...item,
                immigrantsChange: ((item.immigrants - prevImm) / prevImm) * 100,
                emigrantsChange: ((item.emigrants - prevEm) / prevEm) * 100,
            };
        });
    };

    const findMaxPercentageChange = (data: MigrationData[]) => {
        const changes = calculatePercentageChanges(data).slice(1);
        const maxImm = Math.max(...changes.map((c) => Math.abs(c.immigrantsChange)));
        const maxEm = Math.max(...changes.map((c) => Math.abs(c.emigrantsChange)));
        return Math.max(maxImm, maxEm);
    };

    const predictFutureValues = () => {
        if (windowSize <= 0 || windowSize > originalData.length || originalData.length === 0) {
            return [];
        }

        const lastYears = originalData.slice(-windowSize);
        const predictedData: MigrationData[] = [];
        const lastYear = originalData[originalData.length - 1].year;

        for (let i = 1; i <= yearsToPredict; i++) {
            const avgImm = lastYears.reduce((sum, item) => sum + item.immigrants, 0) / windowSize;
            const avgEm = lastYears.reduce((sum, item) => sum + item.emigrants, 0) / windowSize;

            const newPrediction = {
                year: lastYear + i,
                immigrants: Math.round(avgImm),
                emigrants: Math.round(avgEm),
                netMigration: Math.round(avgImm - avgEm),
                isPredicted: true,
            };

            predictedData.push(newPrediction);

            lastYears.shift();
            lastYears.push(newPrediction);
        }

        return predictedData;
    };

    if (loading) {
        return <div>Загрузка данных...</div>;
    }

    const predictedData = predictFutureValues();
    const combinedData = [...originalData, ...predictedData];
    const maxPercentageChange = findMaxPercentageChange(originalData);

    const chartData = {
        labels: combinedData.map((item) => item.year),
        datasets: [
            {
                label: 'Иммигранты (факт)',
                data: originalData.map((item) => item.immigrants),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Эмигранты (факт)',
                data: originalData.map((item) => item.emigrants),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Иммигранты (прогноз)',
                data: [
                    ...originalData.slice(0, -1).map(() => null),
                    originalData[originalData.length - 1].immigrants,
                    ...predictedData.map((item) => item.immigrants),
                ],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Эмигранты (прогноз)',
                data: [
                    ...originalData.slice(0, -1).map(() => null),
                    originalData[originalData.length - 1].emigrants,
                    ...predictedData.map((item) => item.emigrants),
                ],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ] as ChartOptions['datasets'],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Динамика миграции населения России',
            },
            tooltip: {
                callbacks: {
                    label: function (context: ContextProxy) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString() + ' чел.';
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Количество человек',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Год',
                },
            },
        },
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <AntTitle level={2} style={{ marginBottom: '24px' }}>
                Анализ миграции населения России ({originalData[0]?.year}-{originalData[originalData.length - 1]?.year})
            </AntTitle>

            <Card title="Исторические данные и прогноз" style={{ marginBottom: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={combinedData}
                    rowKey="year"
                    pagination={{ pageSize: 10 }}
                    bordered
                />
                <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
                    * Оранжевым цветом выделены прогнозируемые значения
                </Text>
            </Card>

            <Card title="Визуализация данных" style={{ marginBottom: '24px' }}>
                <div style={{ height: '400px' }}>
                    <Line data={chartData as never} options={chartOptions as never} />
                </div>
            </Card>

            <Card title="Параметры анализа" style={{ marginBottom: '24px' }} headStyle={{ backgroundColor: '#fafafa' }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Размер окна для скользящей средней (лет):</Text>
                            <InputNumber
                                value={windowSize}
                                onChange={(value) => setWindowSize(value ?? 3)}
                                min={1}
                                max={10}
                                style={{ width: '100%', marginTop: '8px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Лет для прогноза:</Text>
                            <InputNumber
                                value={yearsToPredict}
                                onChange={(value) => setYearsToPredict(value ?? 3)}
                                min={1}
                                max={10}
                                style={{ width: '100%', marginTop: '8px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div
                            style={{
                                backgroundColor: '#fff7e6',
                                padding: '16px',
                                borderRadius: '4px',
                                height: '100%',
                            }}
                        >
                            <Text strong>Максимальное годовое изменение:</Text>
                            <AntTitle level={4} style={{ marginTop: '8px', marginBottom: 0 }}>
                                {maxPercentageChange.toFixed(2)}%
                            </AntTitle>
                        </div>
                    </Col>
                </Row>

                <Divider />

                <Alert
                    message="Методология прогнозирования"
                    description={
                        <>
                            <Text>
                                Прогноз выполнен методом скользящей средней с окном в {windowSize} года. На основе
                                последних {windowSize} значений рассчитывается среднее, которое используется для
                                прогноза.
                            </Text>
                            <br />
                            <Text>
                                При прогнозировании на несколько лет вперед, каждый новый прогноз добавляется в окно для
                                расчета следующего.
                            </Text>
                            <br />
                            <Text>
                                Максимальное процентное изменение рассчитывается как наибольшее изменение (по модулю)
                                числа иммигрантов или эмигрантов между соседними годами.
                            </Text>
                        </>
                    }
                    type="info"
                    showIcon
                />
            </Card>
        </div>
    );
};

export default MigrationDashboard;
