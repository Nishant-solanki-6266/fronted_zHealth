import React from 'react'
import { Card, Form, Input, Button, Switch, Divider } from 'antd'
import { toast } from 'react-hot-toast'

export default function SalesSettings() {
  const [form] = Form.useForm()

  const handleSave = (values) => {
    toast.success('Sales rep profile settings updated successfully!')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white m-0">Sales Executive Settings</h2>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
          Manage your personal profile, preferred sales territory, and alert notification triggers.
        </p>
      </div>

      {/* Form Card */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            name: 'Colin Edegbe',
            email: 'sales@example.com',
            phone: '+61 411 992 812',
            territory: 'APAC · Australia, NZ',
            emailAlerts: true,
            smsAlerts: false,
            browserAlerts: true
          }}
        >
          <h3 className="text-xs font-bold text-[#8C4BFF] uppercase tracking-wider mb-4">Account Profile Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label={<span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Full Name</span>}>
              <Input className="rounded-xl h-10 border-slate-200 dark:border-slate-850 dark:bg-slate-950" />
            </Form.Item>
            <Form.Item name="email" label={<span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Email Address</span>}>
              <Input disabled className="rounded-xl h-10 border-slate-200 dark:border-slate-850 dark:bg-slate-950" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="phone" label={<span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Mobile Number</span>}>
              <Input className="rounded-xl h-10 border-slate-200 dark:border-slate-850 dark:bg-slate-950" />
            </Form.Item>
            <Form.Item name="territory" label={<span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Sales Territory</span>}>
              <Input className="rounded-xl h-10 border-slate-200 dark:border-slate-850 dark:bg-slate-950" />
            </Form.Item>
          </div>

          <Divider className="my-6 border-slate-100 dark:border-slate-800" />
          
          <h3 className="text-xs font-bold text-[#8C4BFF] uppercase tracking-wider mb-4">Notification Subscriptions</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Email Payout Alerts</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Get notified immediately when the Head Admin marks your commissions as paid.</span>
              </div>
              <Form.Item name="emailAlerts" valuePropName="checked" className="m-0">
                <Switch />
              </Form.Item>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">SMS Task Reminders</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Receive SMS notifications for hot lead follow-ups and scheduled demo sessions.</span>
              </div>
              <Form.Item name="smsAlerts" valuePropName="checked" className="m-0">
                <Switch />
              </Form.Item>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Browser Alerts</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Receive real-time desktop popups for direct support tickets or Admin chats.</span>
              </div>
              <Form.Item name="browserAlerts" valuePropName="checked" className="m-0">
                <Switch />
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }}
              className="rounded-xl h-10 font-bold text-xs px-6"
            >
              Save Preferences
            </Button>
          </div>

        </Form>
      </Card>

    </div>
  )
}
