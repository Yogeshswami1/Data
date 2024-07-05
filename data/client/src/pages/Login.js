import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';
import './login.css';
import vid from './bg.mp4';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    axios.post('https://data.api.saumiccraft/api/auth/login', values)
      .then(response => {
        const { token, usertype } = response.data;
        // Save the token to localStorage or state
        localStorage.setItem('token', token);

        switch(usertype) {
          case 'admin':
            navigate('/dashboard');
            break;
          case 'marketing':
            navigate('/marketing');
            break;
          case 'telesales':
            navigate('/telesales');
            break;
          case 'managerwebsite':
            navigate('/managerwebsitetab');
            break;
          case 'manageramazon':
            navigate('/manageramazontab');
            break;
          default:
            message.success('Login successful');
        }
      })
      .catch(error => {
        console.error('There was an error logging in!', error);
        message.error('Login failed. Please check your credentials.');
      });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <video autoPlay muted loop>
          <source src={vid} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
      <Card title="SAUMIC CRAFT LOGIN" className="login-card">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
