import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';
import './list.css';

const { Option } = Select;

const services = ['AMAZON', 'MEESHO', 'FLIPKART', 'EBAY', 'WEBSITE', 'FRANCHISE'];

const servicePrefixes = {
  AMAZON: 'AZ',
  MEESHO: 'M',
  FLIPKART: 'FL',
  EBAY: 'EB',
  WEBSITE: 'WB',
  FRANCHISE: 'F',
};

const managers = Array.from({ length: 20 }, (_, i) => `TL${i + 1}`);

const List = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editRecord, setEditRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedManager, setSelectedManager] = useState(undefined);
  const [startEnrollmentId, setStartEnrollmentId] = useState('');
  const [endEnrollmentId, setEndEnrollmentId] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://data.api.saumiccraft.com/api/enrollments')
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

  const handleFilter = (service) => {
    const prefix = servicePrefixes[service];
    const filtered = data.filter(item => item.enrollmentId.startsWith(prefix));
    setFilteredData(filtered);
  };

  const handleManagerFilter = manager => {
    setSelectedManager(manager);
    filterData(manager, primaryContact, startEnrollmentId, endEnrollmentId);
  };

  const handleStatusChange = (record) => {
    const updatedStatus = record.status === 'done' ? 'pending' : 'done';
    axios.put(`https://data.api.saumiccraft.com/api/enrollments/${record._id}`, { status: updatedStatus })
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

  const handleEdit = (record) => {
    setEditRecord(record);
    editForm.setFieldsValue({
      ...record,
      date: moment(record.date, 'YYYY-MM-DD'),
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields()
      .then(values => {
        values.date = values.date.format('YYYY-MM-DD');
        axios.put(`https://data.api.saumiccraft.com/api/enrollments/${editRecord._id}`, values)
          .then(response => {
            message.success('Enrollment updated successfully');
            setEditModalVisible(false);
            fetchData();
          })
          .catch(error => {
            message.error('Failed to update enrollment');
          });
      })
      .catch(error => {
        message.error('Validation failed');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`https://data.api.saumiccraft.com/api/enrollments/${id}`)
      .then(response => {
        message.success('Enrollment deleted successfully');
        fetchData();
      })
      .catch(error => {
        message.error('Failed to delete enrollment');
      });
  };

  const handleDeleteSelected = () => {
    const promises = selectedRowKeys.map(id => axios.delete(`https://data.api.saumiccraft.com/api/enrollments/${id}`));
    Promise.all(promises)
      .then(() => {
        message.success('Selected enrollments deleted successfully');
        fetchData();
        setSelectedRowKeys([]);
      })
      .catch(error => {
        message.error('Failed to delete selected enrollments');
      });
  };

  const handleEnrollmentIdRangeFilter = () => {
    if (!startEnrollmentId || !endEnrollmentId) {
      message.error('Please enter both start and end enrollment IDs');
      return;
    }
    filterData(selectedManager, primaryContact, startEnrollmentId, endEnrollmentId);
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
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="list-container">
      <Card title="Service Filter" className="filter-card">
        <Space>
          {services.map(service => (
            <Button key={service} onClick={() => handleFilter(service)}>
              {service}
            </Button>
          ))}
        </Space>
      </Card>
      <Card title="Enrollment List" className="table-card">
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={handleDeleteSelected}
            disabled={selectedRowKeys.length === 0}
          >
            Delete Selected
          </Button>
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
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Enrollment"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select the date' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="manager" label="Manager Name" rules={[{ required: true, message: 'Please select manager' }]}>
            <Select>
              {Array.from({ length: 20 }, (_, i) => (
                <Option key={`TL${i + 1}`} value={`TL${i + 1}`}>
                  TL{i + 1}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="primaryContact" label="Primary Contact" rules={[{ required: true, message: 'Please enter primary contact' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="secondaryContact" label="Secondary Contact">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="service" label="Service" rules={[{ required: true, message: 'Please select service' }]}>
            <Select>
              {services.map(service => (
                <Option key={service} value={service}>
                  {service}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default List;
