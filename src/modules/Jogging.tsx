import React, { useEffect, useState } from 'react';
import originalData from '../../config/jogging.json';
import { Table, Typography } from 'antd';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
} from 'chart.js';
import Forecast from '../ui/ForecastJogging';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const { Title: AntTitle, Text } = Typography;

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

type StateType = {
    data: JoggingData[];
    distanceChartData: ChartDataType | null;
    speedChartData: ChartDataType | null;
    totalWeekendDistance: number;
};

const columnTitles: { [key in keyof JoggingData]: string } = {
    date: 'Дата',
    startTime: 'Время начала',
    duration: 'Длительность (мин)',
    distance: 'Расстояние (км)',
    maxSpeed: 'Макс. скорость (км/ч)',
    minSpeed: 'Мин. скорость (км/ч)',
    avgSpeed: 'Сред. скорость (км/ч)',
    avgPulse: 'Сред. пульс',
};

const createChartDataset = (
    labels: string[],
    distances: number[],
    label: string,
    borderColor: string,
    backgroundColor: string,
): ChartDataType => {
    return {
        labels,
        datasets: [
            {
                label,
                data: distances,
                borderColor,
                backgroundColor,
                fill: true,
            },
        ],
    };
};

const processData = (data: JoggingData[]): JoggingData[] => {
    return data.map((item) => ({
        key: item.date,
        ...item,
    }));
};

const generateDistanceChartData = (data: JoggingData[]): ChartDataType => {
    const labels = data.map((item) => item.date);
    const distances = data.map((item) => item.distance);
    return createChartDataset(labels, distances, 'Расстояние (км)', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
};

const generateSpeedChartData = (data: JoggingData[]): ChartDataType => {
    const labels = data.map((item) => item.date);
    const avgSpeeds = data.map((item) => item.avgSpeed);
    return createChartDataset(
        labels,
        avgSpeeds,
        'Средняя скорость (км/ч)',
        'rgba(153, 102, 255, 1)',
        'rgba(153, 102, 255, 0.2)',
    );
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

const columns = Object.keys(columnTitles).map((key) => ({
    title: columnTitles[key as keyof JoggingData],
    dataIndex: key as keyof JoggingData,
    key: key,
}));

const Jogging: React.FC = () => {
    const [chartData, setChartData] = useState<StateType>({
        data: [],
        distanceChartData: null,
        speedChartData: null,
        totalWeekendDistance: 0,
    });

    useEffect(() => {
        const processedData = processData(originalData);

        setChartData({
            data: processedData,
            distanceChartData: generateDistanceChartData(processedData),
            speedChartData: generateSpeedChartData(processedData),
            totalWeekendDistance: calculateWeekendDistance(processedData),
        });
    }, []);

    if (!chartData) return null;

    return (
        < div style={{ padding: '24px' }}>
            <AntTitle level={2} style={{ marginBottom: '24px' }}>
                Данные о пробежках
            </AntTitle>
            <Table dataSource={chartData.data} pagination={{ pageSize: 10 }} columns={columns} rowKey="date"/>

            <AntTitle level={3} style={{ marginBottom: '24px' }}>
                Графики пробежек
            </AntTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '50%' }}>
                    {chartData.distanceChartData ? (
                        <Line data={chartData.distanceChartData} />
                    ) : (
                        <Text>Загрузка данных для графика дистанции...</Text>
                    )}
                </div>
                <div style={{ width: '50%' }}>
                    {chartData.speedChartData ? (
                        <Line data={chartData.speedChartData} />
                    ) : (
                        <Text>Загрузка данных для графика скорости...</Text>
                    )}
                </div>
            </div>

            <AntTitle level={3} style={{ marginBottom: '12px' }}>
                Сумма пройденных километров за выходные дни
            </AntTitle>
            <Text style={{ marginBottom: '24px' }}>{`Общая сумма: ${chartData.totalWeekendDistance} км`}</Text>
            <Forecast />
        </div>
    );
};

export default Jogging;