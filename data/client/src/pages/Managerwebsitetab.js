import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Input, Select } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import './list.css';

const { Option } = Select;

const managers = Array.from({ length: 20 }, (_, i) => `TL${i + 1}`);

const Managerwebsitetab = () => {
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
    axios.get('http://localhost:8000/api/enrollments')
      .then(response => {
        const websiteData = response.data
          .filter(item => item.service === 'WEBSITE')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(websiteData);
        setFilteredData(websiteData);
        setLoading(false);
      })
      .catch(error => {
        message.error('Error fetching data');
        setLoading(false);
      });
  };

  const handleManagerFilter = manager => {
    setSelectedManager(manager);
    filterData(manager, primaryContact, startEnrollmentId, endEnrollmentId);
  };

  const handlePrimaryContactFilter = () => {
    filterData(selectedManager, primaryContact, startEnrollmentId, endEnrollmentId);
  };

  const filterData = (manager, contact, startId, endId) => {
    let filtered = data;

    if (manager) {
      filtered = filtered.filter(item => item.manager === manager);
    }
    if (contact) {
      filtered = filtered.filter(item => item.primaryContact.includes(contact));
    }
    if (startId && endId) {
      filtered = filtered.filter(item => item.enrollmentId >= startId && item.enrollmentId <= endId);
    }

    setFilteredData(filtered);
  };

  const handleStatusChange = (record) => {
    const updatedStatus = record.status === 'done' ? 'pending' : 'done';
    axios.put(`http://localhost:8000/api/enrollments/${record._id}`, { status: updatedStatus })
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

  const handleEnrollmentIdRangeFilter = () => {
    if (!startEnrollmentId || !endEnrollmentId) {
      message.error('Please enter both start and end enrollment IDs');
      return;
    }
    filterData(selectedManager, primaryContact, startEnrollmentId, endEnrollmentId);
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
      <Card title="Welcome Website Manager" className="table-card">
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
            placeholder="Primary Contact"
            value={primaryContact}
            onChange={e => setPrimaryContact(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handlePrimaryContactFilter}>Filter by Contact</Button>
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

export default Managerwebsitetab;
