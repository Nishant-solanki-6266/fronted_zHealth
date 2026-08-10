import React, { useState } from 'react'
import { Form, Input, Button, Checkbox } from 'antd'
import { MailOutlined, LockOutlined, BankOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../api/axios'

export default function RegisterForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        organization: values.organization,
        fullName: values.fullName,
        email: values.email,
        password: values.password
      })

      if (res.data?.success) {
        toast.success(res.data?.message || 'Organization registered successfully! Welcome to ZealthOS.')
        navigate('/login', { state: { registeredEmail: values.email } })
      } else {
        toast.error(res.data?.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration API Error:', err)
      toast.error(err.response?.data?.message || 'Failed to register clinic in database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-transparent px-4">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create Account</h3>
        <p className="text-slate-500 dark:text-slate-300 text-xs mt-0.5">Set up your clinic workspace in minutes</p>
      </div>

      <Form
        form={form}
        name="register_form"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="w-full space-y-3.5"
        initialValues={{
          organization: '',
          fullName: '',
          email: '',
          password: '',
          agree: false,
        }}
      >
        <Form.Item
          name="organization"
          label={<span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Organization / Clinic Name</span>}
          rules={[{ required: true, message: 'Please enter your clinic name' }]}
          className="mb-1.5"
        >
          <Input
            prefix={<BankOutlined className="text-slate-400 mr-2" />}
            placeholder="e.g. Apex Physiotherapy"
            size="large"
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white focus:bg-white dark:bg-slate-900 focus:border-brand-purple transition-all duration-200"
          />
        </Form.Item>

        <Form.Item
          name="fullName"
          label={<span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Contact Full Name</span>}
          rules={[{ required: true, message: 'Please enter your name' }]}
          className="mb-1.5"
        >
          <Input
            prefix={<UserOutlined className="text-slate-400 mr-2" />}
            placeholder="e.g. Jane Doe"
            size="large"
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white focus:bg-white dark:bg-slate-900 focus:border-brand-purple transition-all duration-200"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Email</span>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
          className="mb-1.5"
        >
          <Input
            prefix={<MailOutlined className="text-slate-400 mr-2" />}
            placeholder="you@organization.com"
            size="large"
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white focus:bg-white dark:bg-slate-900 focus:border-brand-purple transition-all duration-200"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Password</span>}
          rules={[{ required: true, message: 'Please set your password' }]}
          className="mb-1.5"
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400 mr-2" />}
            placeholder="At least 8 characters"
            size="large"
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white focus:bg-white dark:bg-slate-900 focus:border-brand-purple transition-all duration-200"
          />
        </Form.Item>

        <Form.Item
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms & conditions')),
            },
          ]}
          className="mb-4"
        >
          <Checkbox className="text-slate-500 dark:text-slate-300 text-xs font-semibold select-none">
            I agree to the{' '}
            <a href="#terms" className="text-brand-purple hover:underline" onClick={(e) => e.preventDefault()}>
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-brand-purple hover:underline" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
          </Checkbox>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full h-11 bg-brand-purple hover:bg-brand-purple/90 border-none font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <span>Register Clinic</span>
            <span className="text-lg leading-none font-normal">→</span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
