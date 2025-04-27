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
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography; 

interface DataItem {
  year: number;
  percentage: number;
  change?: number;
  isForecast?: boolean;
}

const mockData: DataItem[] = [
  { year: 2010, percentage: 24.5 },
  { year: 2011, percentage: 25.8 },
  { year: 2012, percentage: 26.3 },
  { year: 2013, percentage: 27.1 },
  { year: 2014, percentage: 27.8 },
  { year: 2015, percentage: 28.5 },
  { year: 2016, percentage: 29.2 },
  { year: 2017, percentage: 30.0 },
  { year: 2018, percentage: 30.8 },
  { year: 2019, percentage: 31.5 },
  { year: 2020, percentage: 32.3 },
  { year: 2021, percentage: 33.1 },
  { year: 2022, percentage: 33.9 },
  { year: 2023, percentage: 34.7 },
  { year: 2024, percentage: 35.5 }
];

const BirthStatistics: React.FC = () => {
  const [forecastYears, setForecastYears] = useState<number>(3);

  const dataWithChanges = useMemo(() => {
    return mockData.map((item, index) => ({
      ...item,
      change: index > 0 ? Number((item.percentage - mockData[index - 1].percentage).toFixed(1)) : 0,
    }));
  }, []);

  const forecast = useMemo(() => {
    const lastValues = dataWithChanges.slice(-3).map(item => item.percentage);
    const avgChange = Number(((lastValues[2] - lastValues[0]) / 2).toFixed(1));
    
    return Array.from({ length: forecastYears }, (_, i) => ({
      year: dataWithChanges[dataWithChanges.length - 1].year + i + 1,
      percentage: Number((
        dataWithChanges[dataWithChanges.length - 1].percentage + 
        avgChange * (i + 1)
      ).toFixed(1)),
      isForecast: true
    }));
  }, [dataWithChanges, forecastYears]);

  const allData = [...dataWithChanges, ...forecast];

  const chartData = {
    labels: allData.map(item => item.year),
    datasets: [
      {
        label: 'Дети вне брака (%)',
        data: allData.map(item => item.percentage),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: allData.map(item => 
          item.isForecast ? '#ff4d4f' : '#1890ff'),
        tension: 0.3,
      },
    ],
  };

  const columns = [
    {
      title: 'Год',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: DataItem, b: DataItem) => a.year - b.year,
    },
    {
      title: 'Процент (%)',
      dataIndex: 'percentage',
      key: 'percentage',
      sorter: (a: DataItem, b: DataItem) => a.percentage - b.percentage,
    },
    {
      title: 'Изменение (%)',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
  ];

  const maxChange = useMemo(() => {
    const changes = dataWithChanges.slice(1).map(item => item.change || 0);
    return Math.max(...changes);
  }, [dataWithChanges]);

  const minChange = useMemo(() => {
    const changes = dataWithChanges.slice(1).map(item => item.change || 0);
    return Math.min(...changes);
  }, [dataWithChanges]);

  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Статистика рождаемости вне брака</AntTitle>
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Максимальный рост"
                  value={maxChange}
                  precision={1}
                  suffix="%"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Минимальный рост"
                  value={minChange}
                  precision={1}
                  suffix="%"
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  value={forecastYears}
                  onChange={setForecastYears}
                  options={[1, 2, 3, 5].map(y => ({ 
                    value: y, 
                    label: `Прогноз на ${y} лет` 
                  }))}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const item = allData[ctx.dataIndex];
                        return `${ctx.dataset.label}: ${item.percentage}%${
                          item.isForecast ? ' (прогноз)' : ''
                        }`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Процент (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Год'
                    }
                  }
                }
              }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Таблица данных">
            <Table
              columns={columns}
              dataSource={dataWithChanges}
              rowKey="year"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BirthStatistics;