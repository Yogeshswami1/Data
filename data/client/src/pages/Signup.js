
import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Signup = () => {
  const [form] = Form.useForm();
  
  const onFinish = (values) => {
    axios.post('http://localhost:8000/api/auth/signup', values)
      .then(response => {
        console.log('Signup successful', response);
      })
      .catch(error => {
        console.error('There was an error signing up!', error);
      });
  };

  return (
    <Form
      form={form}
      name="signup"
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
      <Form.Item
        name="usertype"
        label="User Type"
        rules={[{ required: true, message: 'Please select a user type!' }]}
      >
        <Select placeholder="Select a user type">
          <Option value="marketing">Marketing</Option>
          <Option value="telesales">Telesales</Option>
          <Option value="managerwebsite">Manager Website</Option>
          <Option value="manageramazon">Manager Amazon</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Signup
        </Button>

        

      </Form.Item>
    </Form>

  );
};

export default Signup;
