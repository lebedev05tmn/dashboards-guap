import React, { useState, useMemo } from 'react';
import { Card, Table, Statistic, Row, Col, Select, Typography } from 'antd';
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
    TooltipItem,
} from 'chart.js';
import birthData from '../../config/birth-statistics.json';
import Alert from 'antd/es/alert/Alert';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { Title: AntTitle, Text } = Typography;

interface BirthData {
    year: number;
    percentage: number;
}

interface ProcessedData extends BirthData {
    change: number;
    isForecast: boolean;
}

// Чистая функция, выносим за компонент
const processHistoricalData = (data: BirthData[]): ProcessedData[] => {
    return data.map((item, index) => ({
        ...item,
        change: index > 0 ? Number((item.percentage - data[index - 1].percentage).toFixed(1)) : 0,
        isForecast: false,
    }));
};

// Чистая функция, выносим за компонент
const generateForecast = (data: ProcessedData[], years: number): ProcessedData[] => {
    const lastValues = data.slice(-3).map((item) => item.percentage);
    const avgChange = Number(((lastValues[2] - lastValues[0]) / 2).toFixed(1));
    const lastYear = data[data.length - 1].year;

    return Array.from({ length: years }, (_, i) => ({
        year: lastYear + i + 1,
        percentage: Number((data[data.length - 1].percentage + avgChange * (i + 1)).toFixed(1)),
        change: 0, // Для прогнозов изменение можно не считать или установить 0
        isForecast: true,
    }));
};

// Вынесенные константы
const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                font: {
                    size: 14,
                },
            },
        },
        tooltip: {
            triggerFocus: true,
        },
    },
    scales: {
        y: {
            title: {
                display: true,
                text: 'Процент (%)',
                font: {
                    size: 14,
                },
            },
            ticks: {
                font: {
                    size: 12,
                },
            },
        },
        x: {
            title: {
                display: true,
                text: 'Год',
                font: {
                    size: 14,
                },
            },
            ticks: {
                font: {
                    size: 12,
                },
            },
        },
    },
} as const;

const tableColumns = [
    {
        title: 'Год',
        dataIndex: 'year',
        key: 'year',
        sorter: (a: ProcessedData, b: ProcessedData) => a.year - b.year,
    },
    {
        title: 'Процент (%)',
        dataIndex: 'percentage',
        key: 'percentage',
        sorter: (a: ProcessedData, b: ProcessedData) => a.percentage - b.percentage,
    },
    {
        title: 'Изменение (%)',
        dataIndex: 'change',
        key: 'change',
        render: (value: number) => (
            <Text style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {value > 0 ? '+' : ''}
                {value}
            </Text>
        ),
    },
];

const historicalData = processHistoricalData(birthData);

const BirthStatistics: React.FC = () => {
    const [forecastYears, setForecastYears] = useState<number>(3);

    const forecastData = useMemo(() => generateForecast(historicalData, forecastYears), [forecastYears]);

    const allData = useMemo(() => [...historicalData, ...forecastData], [forecastData]);

    const chartOptionsWithLabel = useMemo(() => {
        return {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: (ctx: TooltipItem<'line'>) => {
                            const item = allData[ctx.dataIndex];
                            return `${ctx.dataset.label}: ${item.percentage}%${item.isForecast ? ' (прогноз)' : ''}`;
                        },
                    },
                },
                legend: chartOptions.plugins.legend,
            },
        };
    }, [allData]);

    // Максимальное и минимальное изменение среди исторических данных (без прогноза)
    const changes = historicalData.slice(1).map((item) => item.change);
    const maxChange = Math.max(...changes);
    const minChange = Math.min(...changes);

    const chartData = useMemo(
        () => ({
            labels: allData.map((item) => item.year),
            datasets: [
                {
                    label: 'Дети вне брака (%)',
                    data: allData.map((item) => item.percentage),
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: allData.map((item) => (item.isForecast ? '#ff4d4f' : '#1890ff')),
                    tension: 0.3,
                    fill: true,
                },
            ],
        }),
        [allData],
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <AntTitle level={2} style={{ marginBottom: '24px' }}>
                Статистика рождаемости вне брака
            </AntTitle>

            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Statistic title="Максимальный рост" value={maxChange} precision={1} suffix="%" />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Statistic title="Минимальный рост" value={minChange} precision={1} suffix="%" />
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Select
                            style={{ width: '100%' }}
                            value={forecastYears}
                            onChange={setForecastYears}
                            options={[1, 2, 3, 5].map((y) => ({
                                value: y,
                                label: `Прогноз на ${y} ${y === 1 ? 'год' : y < 5 ? 'года' : 'лет'}`,
                            }))}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Динамика показателей" style={{ marginBottom: '24px' }}>
                <div style={{ height: '400px' }}>
                    <Line data={chartData} options={chartOptionsWithLabel} />
                </div>
            </Card>

            <Card
                title="Таблица данных"
                style={{ marginBottom: '24px' }}
                styles={{ header: { backgroundColor: '#fafafa' } }}
            >
                <Table
                    columns={tableColumns}
                    dataSource={historicalData}
                    rowKey="year"
                    pagination={{ pageSize: 5 }}
                    bordered
                />
                <Text type="secondary" style={{ marginTop: '16px', display: 'block' }}>
                    * Данные за последние {historicalData.length} лет
                </Text>
            </Card>

            <Card title="Методология расчета" styles={{ header: { backgroundColor: '#fafafa' } }}>
                <Alert
                    message="Алгоритм прогнозирования"
                    description={
                        <>
                            <Text>
                                Прогноз выполнен методом экстраполяции по скользящей средней за 3 года. На основе
                                среднего изменения показателя рассчитывается тренд на указанное количество лет.
                            </Text>
                            <br />
                            <Text>Исторические данные загружаются из файла birth-statistics.json.</Text>
                        </>
                    }
                    type="info"
                    showIcon
                />
            </Card>
        </div>
    );
};

export default BirthStatistics;
