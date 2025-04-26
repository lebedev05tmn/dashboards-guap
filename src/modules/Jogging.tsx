import React, { useEffect, useState } from 'react';
import originalData from '../../config/jogging.json';
import { Table } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import Forecast from './Forecast';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

type JoggingData = {
    date: string;
    startTime: string;
    duration: number;
    distance: number;
    maxSpeed: number;
    minSpeed: number;
    avgSpeed: number;
    avgPulse: number;
};

type ChartDataType = {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
    }[];
};

const createChartDataset = (labels: string[], data: number[], label: string, borderColor: string, backgroundColor: string): ChartDataType => {
    return {
        labels,
        datasets: [
            {
                label,
                data,
                borderColor,
                backgroundColor,
                fill: true,
            }
        ]
    };
};

const calculateMovingAverage = (data: number[], windowSize: number): number[] => {
    const movingAverages: number[] = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
        const window = data.slice(i, i + windowSize);
        const average = window.reduce((sum, value) => sum + value, 0) / windowSize;
        movingAverages.push(average);
    }
    return movingAverages;
};

const generateForecast = (data: number[], windowSize: number, forecastDays: number): { labels: string[], forecast: number[] } => {
    const movingAverages = calculateMovingAverage(data, windowSize);
    const lastAverage = movingAverages[movingAverages.length - 1];
    const forecast = Array(forecastDays).fill(lastAverage);
    const forecastLabels = Array.from({ length: forecastDays }, (_, i) => `Прогноз ${i + 1} день`);
    return { labels: forecastLabels, forecast };
};

const Jogging: React.FC = () => {
    const [data, setData] = useState<JoggingData[]>([]);
    const [distanceChartData, setDistanceChartData] = useState<ChartDataType | null>(null);
    const [speedChartData, setSpeedChartData] = useState<ChartDataType | null>(null);
    const [totalWeekendDistance, setTotalWeekendDistance] = useState<number>(0);
    const [forecastData, setForecastData] = useState<number[]>([]);
    const [forecastLabels, setForecastLabels] = useState<string[]>([]);

    const windowSize = 3; // Размер окна для скользящей средней
    const forecastDays = 7; // Количество дней для прогноза

    useEffect(() => {
        const processedData = processData(originalData);
        setData(processedData);
        setDistanceChartData(generateDistanceChartData(processedData));
        setSpeedChartData(generateSpeedChartData(processedData));
        setTotalWeekendDistance(calculateWeekendDistance(processedData));

        const { forecast, labels } = generateForecast(processedData.map(item => item.distance), windowSize, forecastDays);
        setForecastData(forecast);
        setForecastLabels(labels);
    }, [windowSize, forecastDays]);

    const processData = (data: JoggingData[]): JoggingData[] => {
        return data.map(item => ({
            key: item.date,
            ...item
        }));
    };

    const generateDistanceChartData = (data: JoggingData[]): ChartDataType => {
        const labels = data.map(item => item.date);
        const distances = data.map(item => item.distance);
        const allLabels = [...labels, ...forecastLabels];

        return {
            labels: allLabels,
            datasets: [
                {
                    label: 'Расстояние (км)',
                    data : distances,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
                {
                    label: 'Прогноз (км)',
                    data: forecastData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                }
            ]
        };
    };

    const generateSpeedChartData = (data: JoggingData[]): ChartDataType => {
        const labels = data.map(item => item.date);
        const avgSpeeds = data.map(item => item.avgSpeed);
        return createChartDataset(labels, avgSpeeds, 'Средняя скорость (км/ч)', 'rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)');
    };

    const calculateWeekendDistance = (data: JoggingData[]): number => {
        return data.reduce((total, item) => {
            const date = new Date(item.date);
            const day = date.getDay();
            if (day === 0 || day === 6) {
                return total + item.distance;
            }
            return total;
        }, 0);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '24px' }}>Данные о пробежках</h1>
            <Table dataSource={data} pagination={{ pageSize: 10 }}>
                <Table.Column title="Дата" dataIndex="date" />
                <Table.Column title="Время начала" dataIndex="startTime" />
                <Table.Column title="Длительность (мин)" dataIndex="duration" />
                <Table.Column title="Расстояние (км)" dataIndex="distance" />
                <Table.Column title="Макс. скорость (км/ч)" dataIndex="maxSpeed" />
                <Table.Column title="Мин. скорость (км/ч)" dataIndex="minSpeed" />
                <Table.Column title="Сред. скорость (км/ч)" dataIndex="avgSpeed" />
                <Table.Column title="Сред. пульс" dataIndex="avgPulse" />
            </Table>
            <h2 style={{ marginTop: '24px' }}>Сумма пройденных километров за выходные дни</h2>
            <p>{`Общая сумма: ${totalWeekendDistance} км`}</p>

            <h2 style={{ marginTop: '24px' }}>Графики пробежек</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '50%' }}>
                    {distanceChartData ? <Line data={distanceChartData} /> : <p>Загрузка данных для графика расстояния...</p>}
                </div>
                <div style={{ width: '50%' }}>
                    {speedChartData ? <Line data={speedChartData} /> : <p>Загрузка данных для графика скорости...</p>}
                </div>
            </div>
            <Forecast data={data} />
        </div>
    );
};

export default Jogging;