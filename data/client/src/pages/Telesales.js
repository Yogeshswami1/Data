import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Input, Select } from 'antd';
import { LogoutOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { CSVLink } from "react-csv";
import './list.css';

const { Option } = Select;

const managers = Array.from({ length: 20 }, (_, i) => `TL${i + 1}`);
const services = ['AMAZON', 'WEBSITE', 'FLIPKART', 'EBAY', 'FRANCHISE', 'MEESHO'];

const Telesales = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(undefined);
  const [selectedService, setSelectedService] = useState(undefined);
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
        const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    applyFilters(manager, selectedService, startEnrollmentId, endEnrollmentId, primaryContact);
  };

  const handleServiceFilter = service => {
    setSelectedService(service);
    applyFilters(selectedManager, service, startEnrollmentId, endEnrollmentId, primaryContact);
  };

  const handlePrimaryContactFilter = contact => {
    setPrimaryContact(contact);
    applyFilters(selectedManager, selectedService, startEnrollmentId, endEnrollmentId, contact);
  };

  const handleEnrollmentIdRangeFilter = () => {
    if (!startEnrollmentId || !endEnrollmentId) {
      message.error('Please enter both start and end enrollment IDs');
      return;
    }
    applyFilters(selectedManager, selectedService, startEnrollmentId, endEnrollmentId, primaryContact);
  };

  const applyFilters = (manager, service, startId, endId, contact) => {
    let filtered = data;

    if (manager) {
      filtered = filtered.filter(item => item.manager === manager);
    }

    if (service) {
      filtered = filtered.filter(item => item.service === service);
    }

    if (startId && endId) {
      filtered = filtered.filter(item => item.enrollmentId >= startId && item.enrollmentId <= endId);
    }

    if (contact) {
      filtered = filtered.filter(item => item.primaryContact === contact);
    }

    setFilteredData(filtered);
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
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    message.success("Successfully Logged out");
  };

  const generateCSVData = () => {
    return filteredData.map(row => ({
      'Enrollment ID': row.enrollmentId,
      'Username': row.username,
      'Manager Name': row.manager,
      'Primary Contact': row.primaryContact,
      'Secondary Contact': row.secondaryContact,
      'Email': row.email,
      'Date': moment(row.date).format('DD/MM/YYYY'),
      'Service': row.service,
    }));
  };

  return (
    <div className="list-container">
      <Card title="Tele Sales" className="table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            <Select
              placeholder="Filter by Service"
              style={{ width: 200 }}
              value={selectedService}
              onChange={handleServiceFilter}
              allowClear
            >
              {services.map(service => (
                <Option key={service} value={service}>
                  {service}
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
          <Space>
            <CSVLink data={generateCSVData()} filename={`enrollments_${selectedService || 'all'}.csv`}>
              <Button icon={<DownloadOutlined />}>Download CSV</Button>
            </CSVLink>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>
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

export default Telesales;
