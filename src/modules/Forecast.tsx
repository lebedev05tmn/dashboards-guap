import React, { useState, useMemo } from 'react';
import { Card, Statistic, Select, Typography, Alert } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import joggingData from '../../config/jogging.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { Title: AntTitle, Text } = Typography;

const DAYS_FOR_FORECAST = 7;
const RANDOM_CHANGE_PERCENTAGE = 0.1;

interface JoggingData {
    date: string;
    startTime: string;
    duration: number;
    distance: number;
    maxSpeed: number;
    minSpeed: number;
    avgSpeed: number;
    avgPulse: number;
}

interface ProcessedData extends JoggingData {
    isForecast?: boolean;
}

const Forecast: React.FC = () => {
    const [forecastDays, setForecastDays] = useState<number>(DAYS_FOR_FORECAST);

    const processHistoricalData = (data: JoggingData[]): ProcessedData[] => {
        return data.map((item) => ({
            ...item,
            isForecast: false
        }));
    };

    const calculateForecastDistance = (avgDistance: number, minDistance: number, maxDistance: number): number => {
        const randomFactor = (Math.random() * (RANDOM_CHANGE_PERCENTAGE * 7) - RANDOM_CHANGE_PERCENTAGE * 3) * avgDistance;
        return Math.max(minDistance, Math.min(maxDistance, avgDistance + randomFactor));
    };

    const generateForecast = (data: ProcessedData[], days: number): ProcessedData[] => {
        const lastDistances = data.slice(-30).map(item => item.distance);
        const minDistance = Math.min(...lastDistances);
        const maxDistance = Math.max(...lastDistances);
        const avgDistance = lastDistances.reduce((sum, value) => sum + value, 0) / lastDistances.length;
        const lastDate = new Date(data[data.length - 1].date);

        return Array.from({ length: days }, (_, i) => {
            const newDate = new Date(lastDate);
            newDate.setDate(lastDate.getDate() + i + 1);

            const predictedDistance = calculateForecastDistance(avgDistance, minDistance, maxDistance);

            return {
                date: newDate.toISOString().split('T')[0],
                startTime: "00:00",
                duration: 0,
                distance: Number(predictedDistance.toFixed(1)),
                maxSpeed: 0,
                minSpeed: 0,
                avgSpeed: 0,
                avgPulse: 0,
                isForecast: true
            };
        });
    };

    const historicalData = useMemo(() => processHistoricalData(joggingData), []);
    const forecastData = useMemo(() => generateForecast(historicalData, forecastDays), [historicalData, forecastDays]);

    const allData = [...historicalData, ...forecastData];

    const chartData = {
        labels: allData.map(item => item.date),
        datasets: [
            {
                label: 'Дистанция (км)',
                data: allData.map(item => item.distance),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: allData.map(item => item.isForecast ? '#ff4d4f' : '#1890ff'),
                tension: 0.3,
                fill: true
            }
        ]
    };

    return (
        <div>
            <AntTitle level={3} style={{ marginBottom: '24px' }}>
                Прогноз дистанции пробежек
            </AntTitle>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Statistic title="Прогноз на" value={forecastDays} suffix={forecastDays === 1 ? 'день' : 'дней'} />
                </div>
                <Select
                    style={{ width: '100%' }}
                    value={forecastDays}
                    onChange={setForecastDays}
                    options={[1, 3, 5, 7, 10].map(d => ({
                        value: d,
                        label: `Прогноз на ${d} ${d === 1 ? 'день' : 'дня'}`
                    }))}
                />
            </Card>

            <Card title="График дистанции с прогнозом" style={{ marginBottom: '24px' }}>
                <div style={{ width: '50%', height: '400px', margin: 'auto'}}>
                    <Line data={chartData} options={{ responsive: true }} />
                </div>
            </Card>

            <Card title="Методология расчета">
                <Alert
                    message="Алгоритм прогнозирования"
                    description={
                        <>
                            <Text>
                                Прогноз выполнен методом экстраполяции с учетом диапазона значений за последние 30 дней.
                                На основе случайных колебаний рассчитывается тренд на указанное количество дней.
                            </Text>
                            <br />
                            <Text>
                                Исторические данные загружаются из файла jogging.json.
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

export default Forecast;