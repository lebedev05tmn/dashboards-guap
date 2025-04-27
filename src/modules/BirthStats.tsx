import React from 'react';
import { Table, Typography, Card } from 'antd';

const { Title: AntTitle } = Typography;

interface DataItem {
  year: number;
  percentage: number;
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
  ];

  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Статистика рождаемости вне брака</AntTitle>
      <Card title="Таблица данных">
        <Table 
          columns={columns} 
          dataSource={mockData} 
          rowKey="year" 
          pagination={false} 
        />
      </Card>
    </div>
  );
};

export default BirthStatistics;