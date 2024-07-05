import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Input, Select } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import './list.css';

const { Option } = Select;

const managers = Array.from({ length: 20 }, (_, i) => `TL${i + 1}`);

const ManagerAmazonTab = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(undefined);
  const [startEnrollmentId, setStartEnrollmentId] = useState('');
  const [endEnrollmentId, setEndEnrollmentId] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://data.api.saumiccraft/api/enrollments')
      .then(response => {
        const amazonData = response.data.filter(item => item.service === 'AMAZON');
        const sortedData = amazonData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(sortedData);
        setFilteredData(sortedData);
        setLoading(false);
      })
      .catch(error => {
        message.error('Error fetching data');
        setLoading(false);
      });
  };

  const handleManagerFilter = manager => {
    setSelectedManager(manager);
    filterData({ manager, startEnrollmentId, endEnrollmentId, primaryContact });
  };

  const handlePrimaryContactFilter = contact => {
    setPrimaryContact(contact);
    filterData({ selectedManager, startEnrollmentId, endEnrollmentId, contact });
  };

  const handleEnrollmentIdRangeFilter = () => {
    if (!startEnrollmentId || !endEnrollmentId) {
      message.error('Please enter both start and end enrollment IDs');
      return;
    }
    filterData({ selectedManager, startEnrollmentId, endEnrollmentId, primaryContact });
  };

  const filterData = ({ manager, startEnrollmentId, endEnrollmentId, contact }) => {
    let filtered = [...data];

    if (manager) {
      filtered = filtered.filter(item => item.manager === manager);
    }

    if (contact) {
      filtered = filtered.filter(item => item.primaryContact === contact);
    }

    if (startEnrollmentId && endEnrollmentId) {
      filtered = filtered.filter(item => item.enrollmentId >= startEnrollmentId && item.enrollmentId <= endEnrollmentId);
    }

    setFilteredData(filtered);
  };

  const handleStatusChange = (record) => {
    const updatedStatus = record.status === 'done' ? 'pending' : 'done';
    axios.put(`https://data.api.saumiccraft/api/enrollments/${record._id}`, { status: updatedStatus })
      .then(response => {
        message.success('Status updated successfully');
        record.status = updatedStatus;
        setData([...data]);
        setFilteredData([...filteredData]);
      })
      .catch(error => {
        message.error('Failed to update status');
      });
  };

  const columns = [
    {
      title: 'Enrollment ID',
      dataIndex: 'enrollmentId',
      key: 'enrollmentId',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Manager Name',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Primary Contact',
      dataIndex: 'primaryContact',
      key: 'primaryContact',
    },
    {
      title: 'Secondary Contact',
      dataIndex: 'secondaryContact',
      key: 'secondaryContact',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <Button
          type={record.status === 'done' ? 'primary' : 'default'}
          style={{ backgroundColor: record.status === 'done' ? 'green' : '' }}
          onClick={() => handleStatusChange(record)}
        >
          {record.status === 'done' ? 'Done' : 'Pending'}
        </Button>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    message.success("Successfully Logged out");
  };

  return (
    <div className="list-container">
      <Card title="Welcome Amazon Manager" className="table-card">
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter by Manager"
            style={{ width: 200 }}
            value={selectedManager}
            onChange={handleManagerFilter}
            allowClear
          >
            {managers.map(manager => (
              <Option key={manager} value={manager}>
                {manager}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Filter by Primary Contact"
            value={primaryContact}
            onChange={e => handlePrimaryContactFilter(e.target.value)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Start Enrollment ID"
            value={startEnrollmentId}
            onChange={e => setStartEnrollmentId(e.target.value)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="End Enrollment ID"
            value={endEnrollmentId}
            onChange={e => setEndEnrollmentId(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleEnrollmentIdRangeFilter}>Filter by Range</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ManagerAmazonTab;
