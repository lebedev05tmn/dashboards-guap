import React from 'react';
import { Typography } from 'antd';

const { Title: AntTitle } = Typography;

const BirthStatistics: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Статистика рождаемости вне брака</AntTitle>
    </div>
  );
};

export default BirthStatistics;