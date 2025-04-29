import { FC } from 'react';
import originalData from '../../config/inflation.json';
import { useState } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type InflationData = {
    year: number;
    inflationRate: number;
    comment: string;
};

const getYearsToPredictLabel = (yearsToPredict: number) => {
    const plural = new Intl.PluralRules('ru-RU').select(yearsToPredict);

    switch (plural) {
        case 'one':
            return `${yearsToPredict} год`;
        case 'few':
            return `${yearsToPredict} года`;
        default:
            return `${yearsToPredict} лет`;
    }
};

const columns = [
    {
        title: 'Год',
        dataIndex: 'year',
        key: 'year',
        sorter: (a: InflationData, b: InflationData) => a.year - b.year,
    },
    {
        title: 'Инфляция (%)',
        dataIndex: 'inflationRate',
        key: 'inflationRate',
        sorter: (a: InflationData, b: InflationData) => a.inflationRate - b.inflationRate,
    },
    {
        title: 'Комментарий',
        dataIndex: 'comment',
        key: 'comment',
    },
];

const { Title: AntTitle, Text } = Typography;

const Inflation: FC = () => {
    const [yearsToPredict, setYearsToPredict] = useState(3);
    const [initialPrice, setInitialPrice] = useState(1000);

    const calculateMovingAverage = (data: InflationData[], windowSize = 3) => {
        const result = [];
        for (let i = 0; i <= data.length - windowSize; i++) {
            const window = data.slice(i, i + windowSize);
            const average = window.reduce((sum, item) => sum + item.inflationRate, 0) / windowSize;
            result.push(average);
        }
        return result;
    };

    // Прогнозирование на N лет вперед
    const predictFutureValues = () => {
        const windowSize = 3;
        const movingAverages = calculateMovingAverage(originalData, windowSize);

        // Берем последние значения для прогноза
        const lastValues = movingAverages.slice(-windowSize);
        const avgLastValues = lastValues.reduce((sum, val) => sum + val, 0) / lastValues.length;

        const predictedData = [];
        const lastYear = originalData[originalData.length - 1].year;

        for (let i = 1; i <= yearsToPredict; i++) {
            predictedData.push({
                year: lastYear + i,
                inflationRate: avgLastValues * (1 - 0.05 * i), // Немного уменьшаем с каждым годом
                comment: `Прогноз на основе скользящей средней`,
                isPredicted: true,
            });
        }

        return predictedData;
    };

    const predictedData = predictFutureValues();
    const combinedData = [...originalData, ...predictedData];

    // Расчет будущей стоимости товара
    const calculateFuturePrice = () => {
        let futurePrice = initialPrice;
        predictedData.forEach((year) => {
            futurePrice *= 1 + year.inflationRate / 100;
        });
        return futurePrice.toFixed(2);
    };

    const futurePrice = calculateFuturePrice();

    const chartData = {
        labels: combinedData.map((item) => item.year),
        datasets: [
            {
                label: 'Фактическая инфляция',
                data: originalData.map((item) => item.inflationRate),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Прогнозируемая инфляция',
                data: [...originalData.map(() => null), ...predictedData.map((item) => item.inflationRate)],
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
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
                text: 'Динамика инфляции с прогнозом',
            },
            tooltip: {
                callbacks: {
                    label: function (context: ContextProxy) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(1) + '%';
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Уровень инфляции (%)',
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
                Анализ инфляции
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
                    * Прогнозируемые значения
                </Text>
            </Card>

            <Card title="Визуализация данных" style={{ marginBottom: '24px' }}>
                <div style={{ height: '400px' }}>
                    <Line data={chartData as never} options={chartOptions as never} />
                </div>
            </Card>

            <Card
                title="Калькулятор будущей стоимости"
                style={{ marginBottom: '24px' }}
                headStyle={{ backgroundColor: '#fafafa' }}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Текущая цена товара (₽):</Text>
                            <InputNumber
                                value={initialPrice}
                                onChange={(value) => setInitialPrice(value!)}
                                min={1}
                                style={{ width: '100%', marginTop: '8px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Лет для прогноза:</Text>
                            <InputNumber
                                value={yearsToPredict}
                                onChange={(value) => setYearsToPredict(value!)}
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
                            <Text strong>
                                Через {yearsToPredict} {getYearsToPredictLabel(yearsToPredict)}:
                            </Text>
                            <AntTitle level={4} style={{ marginTop: '8px', marginBottom: 0 }}>
                                {futurePrice} ₽
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
                                Прогноз выполнен методом экстраполяции по скользящей средней (окно = 3 года). Последние
                                значения инфляции усредняются, а затем применяется коэффициент снижения 5% в год.
                            </Text>
                            <br />
                            <Text>
                                Для расчета будущей стоимости товара применяется сложный процент на основе
                                прогнозируемой инфляции.
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

export default Inflation;