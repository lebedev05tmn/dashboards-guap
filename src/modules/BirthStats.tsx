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

const processHistoricalData = (data: BirthData[]): ProcessedData[] => {
    return data.map((item, index) => ({
        ...item,
        change: index > 0 ? Number((item.percentage - data[index - 1].percentage).toFixed(1)) : 0,
        isForecast: false,
    }));
};

const generateForecast = (data: ProcessedData[], years: number): ProcessedData[] => {
    if (data.length < 3) return [];

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((item, index) => {
        const x = index;
        const y = item.percentage;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const MAX_REASONABLE = 45; 
    const lastValue = data[n-1].percentage;
    
    const stdError = Math.sqrt(data.reduce((sum, item, idx) => {
        const predicted = intercept + slope * idx;
        return sum + Math.pow(item.percentage - predicted, 2);
    }, 0) / n);

    return Array.from({ length: years }, (_, i) => {
        let percentage = intercept + slope * (n + i);
        
        if (percentage > MAX_REASONABLE) {
            const distanceToMax = MAX_REASONABLE - lastValue;
            percentage = lastValue + distanceToMax * (1 - Math.exp(-0.3 * (i + 1))); // Экспоненциальное замедление
        }

        const randomVariation = (Math.random() - 0.5) * stdError * 2;
        percentage += randomVariation;

        return {
            year: data[n-1].year + i + 1,
            percentage: Math.min(MAX_REASONABLE, Number(percentage.toFixed(1))),
            change: 0,
            isForecast: true,
        };
    });
};

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

    const chartOptionsWithLabel = useMemo(() => ({
    ...chartOptions,
    plugins: {
        ...chartOptions.plugins,
        tooltip: {
            callbacks: {
                label: (ctx: TooltipItem<'line'>) => {
                    if (ctx.datasetIndex === 0) {
                        return `История: ${ctx.raw}%`;
                    } else {
                        const year = allData[ctx.dataIndex].year;
                        const isForecast = year > historicalData[historicalData.length - 1].year;
                        return `Прогноз: ${ctx.raw}%${isForecast ? '' : ' (нет данных)'}`;
                    }
                },
            },
        },
    },
}), [allData]);

    const changes = historicalData.slice(1).map((item) => item.change);
    const maxChange = Math.max(...changes);
    const minChange = Math.min(...changes);

    const chartData = useMemo(() => {
    const lastHistoricalYear = historicalData[historicalData.length - 1].year;
    
    return {
        labels: allData.map(item => item.year),
        datasets: [
            {
                label: 'Исторические данные',
                data: allData.map(item => item.isForecast ? null : item.percentage),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: '#1890ff',
                fill: false,
            },
            {
                label: 'Прогноз',
                data: allData.map(item => {
                    if (item.year === lastHistoricalYear) return item.percentage;
                    return item.isForecast ? item.percentage : null;
                }),
                borderColor: '#ff4d4f',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.3,
                pointBackgroundColor: '#ff4d4f',
            },
            {
                label: 'Доверительный интервал',
                data: allData.map(item => item.isForecast ? item.percentage * 1.05 : null),
                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                fill: '-1',
            },
            {
                label: 'Доверительный интервал',
                data: allData.map(item => item.isForecast ? item.percentage * 0.95 : null),
                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
            }
        ],
    };
}, [allData]);

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
