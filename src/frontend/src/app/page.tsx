'use client'

import { Layout, Typography } from 'antd';
import { Button } from 'antd';

const { Header, Content } = Layout
const { Title } = Typography

export default function Dashboard() {
  const handleConnect = () => {
    console.log('Connect');
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            🤖 Robot Fleet Dashboard
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div>
          <h1>Robot Fleet Dashboard</h1>
          <Button type="primary" onClick={handleConnect}>Connect</Button>
        </div>
      </Content>
    </Layout>
  )
}