import React from 'react';
import { Form, Input, Button, DatePicker, Select, Upload, message, Card, Row, Col } from 'antd';
import { DownloadOutlined, UploadOutlined, LogoutOutlined, UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import sample from './Sample.csv';

const { Option } = Select;

const Dashboard = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFormSubmit = (values) => {
    axios.post('https://data.api.saumiccraft.com/api/enroll', values)
      .then(response => {
        message.success('Form submitted successfully');
      })
      .catch(error => {
        if (error.response && error.response.data) {
          message.error(error.response.data.message);
        } else {
          message.error('There was an error submitting the form');
        }
      });
  };
  

  const handleFileUpload = ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
  
    axios.post('https://data.api.saumiccraft.com/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        if (response.data.skippedEntries && response.data.skippedEntries.length > 0) {
          message.warning(`File uploaded successfully, but ${response.data.skippedEntries.length} entries were skipped because they already existed.`);
        } else {
          message.success('File uploaded successfully');
        }
      })
      .catch(error => {
        message.error('File upload failed');
      });
  };
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    message.success("Successfully Logged out");
  };

  const navigateToList = () => {
    navigate('/list');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          
        </Col>
        <Col>
          <Button icon={<UnorderedListOutlined />} onClick={navigateToList}>
            List
          </Button>
        </Col>
      </Row>

      <Card title="Welcome Admin" style={{ marginBottom: '20px' }}>
        <Form
          form={form}
          name="enrollment"
          onFinish={handleFormSubmit}
          layout="vertical"
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select the date!' }]}
            style={{ marginBottom: '12px' }}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="manager"
            label="Manager Name"
            rules={[{ required: true, message: 'Please select a manager!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Select style={{ width: '100%' }}>
              {Array.from({ length: 20 }, (_, i) => (
                <Option key={`TL${i + 1}`} value={`TL${i + 1}`}>
                  TL{i + 1}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="primaryContact"
            label="Primary Contact"
            rules={[{ required: true, message: 'Please input the primary contact!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="secondaryContact"
            label="Secondary Contact"
            style={{ marginBottom: '12px' }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input the email!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="service"
            label="Service"
            rules={[{ required: true, message: 'Please select a service!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Select style={{ width: '100%' }}>
              <Option value="AMAZON">AMAZON</Option>
              <Option value="MEESHO">MEESHO</Option>
              <Option value="WEBSITE">WEBSITE</Option>
              <Option value="FRANCHISE">FRANCHISE</Option>
              <Option value="EBAY">EBAY</Option>
              <Option value="FLIPKART">FLIPKART</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="enrollmentId"
            label="Enrollment ID"
            rules={[{ required: true, message: 'Please input the enrollment ID!' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input />
          </Form.Item>
          <Form.Item style={{ marginBottom: '0px' }}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Download Sample CSV">
        <a href={sample} download="Sample.csv">
          <Button icon={<DownloadOutlined />} style={{ width: '100%' }}>Download Sample CSV</Button>
        </a>
      </Card>

      <Card title="Import CSV Data">
        <Upload
          name="file"
          customRequest={handleFileUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={{ width: '100%' }}>Click to Upload</Button>
        </Upload>
      </Card>
    </div>
  );
};

export default Dashboard;
