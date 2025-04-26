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

const createChartDataset = (labels: string[], distances: number[], label: string, borderColor: string, backgroundColor: string): ChartDataType => {
    return {
        labels,
        datasets: [
            {
                label,
                data: distances,
                borderColor,
                backgroundColor,
                fill: true,
            }
        ]
    };
};

const Jogging: React.FC = () => {
    const [data, setData] = useState<JoggingData[]>([]);
    const [distanceChartData, setDistanceChartData] = useState<ChartDataType | null>(null);
    const [speedChartData, setSpeedChartData] = useState<ChartDataType | null>(null);
    const [totalWeekendDistance, setTotalWeekendDistance] = useState<number>(0);

    useEffect(() => {
        const processedData = processData(originalData);
        setData(processedData);
        setDistanceChartData(generateDistanceChartData(processedData));
        setSpeedChartData(generateSpeedChartData(processedData));
        setTotalWeekendDistance(calculateWeekendDistance(processedData));
    }, []);

    const processData = (data: JoggingData[]): JoggingData[] => {
        return data.map(item => ({
            key: item.date,
            ...item
        }));
    };

    const generateDistanceChartData = (data: JoggingData[]): ChartDataType => {
        const labels = data.map(item => item.date);
        const distances = data.map(item => item.distance);
        return createChartDataset(labels, distances, 'Расстояние (км)', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
    };

    const generateSpeedChartData = (data: JoggingData[]): ChartDataType => {
        const labels = data.map(item => item.date);
        const avgSpeeds = data.map(item => item.avgSpeed);
        return createChartDataset(labels, avgSpeeds, 'Средняя скорость (км/ч)', 'rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)');
    };

    const calculateWeekendDistance = (data: JoggingData[]): number => {
        return data.reduce((total, item) => {
            const date = new Date(item.date);
            const day = date.getDay(); // 0 - воскресенье, 6 - суббота
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
                <Table.Column title="Время начала " dataIndex="startTime" />
                <Table.Column title="Длительность (мин)" dataIndex="duration" />
                <Table.Column title="Расстояние (км)" dataIndex="distance" />
                <Table.Column title="Макс. скорость (км/ч)" dataIndex="maxSpeed" />
                <Table.Column title="Мин. скорость (км/ч)" dataIndex="minSpeed" />
                <Table.Column title="Сред. скорость (км/ч)" dataIndex="avgSpeed" />
                <Table.Column title="Сред. пульс" dataIndex="avgPulse" />
            </Table>

            <h2 style={{ marginTop: '24px' }}>Графики пробежек</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '50%' }}>
                    {distanceChartData ? <Line data={distanceChartData} /> : <p>Загрузка данных для графика расстояния...</p>}
                </div>
                <div style={{ width: '50%' }}>
                    {speedChartData ? <Line data={speedChartData} /> : <p>Загрузка данных для графика скорости...</p>}
                </div>
            </div>

            <h2 style={{ marginTop: '24px' }}>Сумма пройденных километров за выходные дни</h2>
            <p>{`Общая сумма: ${totalWeekendDistance} км`}</p>
            <Forecast data={data} />
        </div>
    );
};

export default Jogging;