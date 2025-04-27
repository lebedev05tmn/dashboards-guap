import React, { useMemo } from 'react';
import { Table, Typography, Card, Statistic, Row, Col } from 'antd';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title as ChartTitle, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;

interface DataItem {
  year: number;
  percentage: number;
  change?: number;
}

const mockData: DataItem[] = [
  { year: 2010, percentage: 24.5 },
  { year: 2011, percentage: 26.5 },
  { year: 2012, percentage: 29.5 },
  { year: 2013, percentage: 32 },
  { year: 2014, percentage: 36 },
  { year: 2015, percentage: 33 },
  { year: 2016, percentage: 24 },
];

const BirthStatistics: React.FC = () => {
  const dataWithChanges = useMemo(() => {
    return mockData.map((item, index) => ({
      ...item,
      change: index > 0 ? Number((item.percentage - mockData[index - 1].percentage).toFixed(1)) : 0,
    }));
  }, []);

  const maxChange = useMemo(() => {
    const changes = dataWithChanges.slice(1).map(item => item.change || 0);
    return Math.max(...changes);
  }, [dataWithChanges]);

  const minChange = useMemo(() => {
    const changes = dataWithChanges.slice(1).map(item => item.change || 0);
    return Math.min(...changes);
  }, [dataWithChanges]);

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

  const chartData = {
    labels: dataWithChanges.map(item => item.year),
    datasets: [
      {
        label: 'Дети вне брака (%)',
        data: dataWithChanges.map(item => item.percentage),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Статистика рождаемости вне брака</AntTitle>
      
      <Card style={{ marginBottom: '20px' }}>
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
        </Row>
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <Line 
          data={chartData} 
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
                },
              },
            },
            scales: {
              y: {
                title: { display: true, text: 'Процент (%)' }
              },
              x: {
                title: { display: true, text: 'Год' }
              }
            }
          }}
        />
      </Card>

      <Card title="Таблица данных">
        <Table 
          columns={columns} 
          dataSource={dataWithChanges} 
          rowKey="year" 
          pagination={false} 
        />
      </Card>
    </div>
  );
};

export default BirthStatistics;