import React, { useEffect, useState } from 'react';

type JoggingData = {
    date: string; // Дата пробежки
    distance: number; // Расстояние пробежки
};

type ForecastProps = {
    data: JoggingData[]; // Данные о пробежках
};

// Функция для вычисления скользящей средней
const calculateMovingAverage = (data: number[], windowSize: number): number[] => {
    const movingAverages: number[] = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
        const window = data.slice(i, i + windowSize);
        const average = window.reduce((sum, value) => sum + value, 0) / windowSize;
        movingAverages.push(average);
    }
    return movingAverages;
};

// Компонент Forecast
const Forecast: React.FC<ForecastProps> = ({ data }) => {
    const [forecastData, setForecastData] = useState<{ date: string; forecast: number }[]>([]);

    useEffect(() => {
        const distances = data.map(item => item.distance);
        const windowSize = 3; // Размер окна для скользящей средней
        const movingAverages = calculateMovingAverage(distances, windowSize);
        
        // Проверяем, есть ли данные для прогнозирования
        if (movingAverages.length === 0) {
            return; // Если нет данных, выходим из useEffect
        }

        const lastAverage = movingAverages[movingAverages.length - 1]; // Последнее значение скользящей средней

        // Генерируем прогноз на 5 будущих дней
        const today = new Date();
        const newForecastData = [];
        for (let i = 1; i <= 5; i++) {
            const forecastDate = new Date(today);
            forecastDate.setDate(today.getDate() + i);
            newForecastData.push({
                date: forecastDate.toISOString().split('T')[0], // Форматируем дату в строку
                forecast: lastAverage // Используем последнее значение скользящей средней как прогноз
            });
        }

        setForecastData(newForecastData);
    }, [data]);

    return (
        <div>
            <h2>Прогноз дистанции на следующие 5 дней</h2>
            <ul>
                {forecastData.map(item => (
                    <li key={item.date}>
                        {item.date}: {item.forecast ? item.forecast.toFixed(2) : 'Нет данных'} км
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Forecast;