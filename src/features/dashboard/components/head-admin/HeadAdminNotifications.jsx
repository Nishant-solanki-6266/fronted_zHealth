import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Modal, Timeline, Checkbox } from 'antd'
import {
  SearchOutlined,
  SendOutlined,
  MailOutlined,
  InfoCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

// Dynamic mock notifications database by role
const getMockNotifications = (role) => {
  switch (role) {
    case 'sales':
      return [
        { id: 'sales_1', title: 'Lead Assigned', message: 'Hobart Spinal Adjustments lead has been assigned to Colin Edegbe.', target: 'Colin Edegbe', date: 'Today, 10:15 AM', type: 'inbox' },
        { id: 'sales_2', title: 'Demo Reminder', message: 'Upcoming Product Demo with Brisbane Kids OT Clinic starts in 2 hours.', target: 'Colin Edegbe', date: 'Today, 12:00 PM', type: 'inbox' },
        { id: 'sales_3', title: 'Commission Paid', message: 'Commission for Zoya Clinic ($2,400) has been approved and paid.', target: 'Colin Edegbe', date: '5 Jun 2026', type: 'inbox' },
        { id: 'sales_4', title: 'Follow-up Task Due', message: 'Task "Call Melbourne Physio back" is marked high-priority and due today.', target: 'Colin Edegbe', date: 'Today, 09:00 AM', type: 'inbox' },
        { id: 's1', title: 'Demo Scheduled Feedback', message: 'Submitted demo session notes for Star Medical onboarding.', target: 'Support Team', date: 'Yesterday, 04:45 PM', type: 'sent' },
        { id: 's2', title: 'Proposal Dispatched', message: 'Pricing proposal PDF sent to Apex Allied Health Network.', target: 'Apex Allied Health Network', date: 'Yesterday, 09:00 AM', type: 'sent' }
      ]
    case 'practitioner':
      return [
        { id: 'prac_1', title: 'New Appointment Booked', message: 'Patient John Miller scheduled a Consultation for Monday, Jun 8 at 9:00 AM.', target: 'Dr. Sarah Jenkins', date: 'Today, 11:30 AM', type: 'inbox' },
        { id: 'prac_2', title: 'Clinical Notes Pending', message: 'SOAP Notes for Bob Johnson (Administrative OT review) are due.', target: 'Dr. Sarah Jenkins', date: 'Yesterday, 06:15 PM', type: 'inbox' },
        { id: 'prac_3', title: 'Patient Uploaded File', message: 'John Miller uploaded "Diagnostic Scan 2026.pdf" to patient records.', target: 'Dr. Sarah Jenkins', date: '2 Jan 2026', type: 'inbox' },
        { id: 'prac_4', title: 'System Broadcast Alert', message: 'Global Assessment Templates updated by Super Admin.', target: 'All Practitioners', date: '1 Jan 2026', type: 'inbox' },
        { id: 's1', title: 'Referral Update', message: 'Shared clinical discharge notes for John Miller with Brisbane OT.', target: 'Brisbane Kids OT Clinic', date: '3 Jan 2026', type: 'sent' }
      ]
    case 'patient':
      return [
        { id: 'pat_1', title: 'Booking Confirmed', message: 'Your Consultation with Dr. Sarah Jenkins is confirmed for Monday, Jun 8 at 9:00 AM.', target: 'John Miller', date: 'Today, 11:30 AM', type: 'inbox' },
        { id: 'pat_2', title: 'New Invoice Issued', message: 'Invoice INV-20831 for $1,200.00 has been generated for NDIS funding.', target: 'John Miller', date: 'Yesterday, 02:00 PM', type: 'inbox' },
        { id: 'pat_3', title: 'Exercise Prescribed', message: 'Dr. Sarah Jenkins assigned a new exercise plan: "Lower Back Stretch".', target: 'John Miller', date: 'Yesterday, 04:30 PM', type: 'inbox' },
        { id: 'pat_4', title: 'Clinic Receptionist Message', message: 'Please bring your copy of the diagnostic scan for Monday\'s visit.', target: 'John Miller', date: '2 Jan 2026', type: 'inbox' },
        { id: 's1', title: 'Payment Receipt Logged', message: 'Submitted online copayment of $120.00 for physiotherapy.', target: 'Billing Admin', date: 'Today, 01:15 PM', type: 'sent' }
      ]
    case 'clinic':
      return [
        { id: 'cli_1', title: 'Outstanding Invoice Warning', message: 'Lakeside Medical invoice INV-20831 ($1,200) is now 8 days overdue.', target: 'Clinic Admin', date: 'Today, 08:30 AM', type: 'inbox' },
        { id: 'cli_2', title: 'New Patient Registration', message: 'Alice Smith registered as a new clinic patient.', target: 'Clinic Admin', date: 'Today, 09:00 AM', type: 'inbox' },
        { id: 'cli_3', title: 'Waitlist Alert', message: 'Patient with Falls Risk added to the waitlist.', target: 'Clinic Admin', date: 'Yesterday, 04:15 PM', type: 'inbox' },
        { id: 'cli_4', title: 'Stripe Integration Active', message: 'Stripe webhook payments sync completed successfully.', target: 'Clinic Admin', date: '2 Jan 2026', type: 'inbox' },
        { id: 's1', title: 'Practitioner Invitation', message: 'Sent branch 3 onboarding invitation to Dr. Aiden Park.', target: 'Dr. Aiden Park', date: '3 Jan 2026', type: 'sent' }
      ]
    case 'head_admin':
    default:
      return [
        { id: 'admin_1', title: 'New Clinic Onboarded', message: 'West Coast Family Care joined on the Advanced plan', target: 'Super Admin', date: 'Today, 08:00 AM', type: 'inbox' },
        { id: 'admin_2', title: 'Subscription Upgraded', message: 'Bayview Family Clinic upgraded from Advanced to Enterprise', target: 'Super Admin', date: 'Yesterday, 04:30 PM', type: 'inbox' },
        { id: 'admin_3', title: 'Failed payment alert', message: 'Admin session: Card ending in 4321 declined (insufficient funds)', target: 'Super Admin', date: 'Yesterday, 02:00 PM', type: 'inbox' },
        { id: 'admin_4', title: 'Compliance Logs Flushed', message: 'System log backup has completed successfully.', target: 'Super Admin', date: '1 Jan 2026', type: 'inbox' },
        { id: 's1', title: 'System Notification Broadcast', message: 'Global system maintenance scheduled for Sunday at 02:00 AM UTC.', target: 'All Clinics', date: 'Yesterday, 10:00 AM', type: 'sent' },
        { id: 's2', title: 'Welcome Invitation', message: 'Welcome packet and onboarding link sent to Wynwood Wellness.', target: 'Wynwood Wellness', date: '2 Jan 2026', type: 'sent' }
      ]
  }
}

export default function HeadAdminNotifications() {
  const store = useClinicStore()
  const userRole = store.userRole
  const darkMode = store.darkMode

  // Initialize notifications state based on the current role
  const [notificationsList, setNotificationsList] = useState(() => getMockNotifications(userRole))
  
  // Re-sync notifications if role changes dynamically
  useEffect(() => {
    setNotificationsList(getMockNotifications(userRole))
  }, [userRole])

  const [activeTab, setActiveTab] = useState('Inbox')
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const handleBroadcast = (values) => {
    const newNotif = {
      id: String(Date.now()),
      title: values.title || 'New Message',
      message: values.message,
      target: values.target || 'All',
      date: 'Today',
      type: 'sent'
    }
    setNotificationsList(prev => [newNotif, ...prev])
    toast.success('Message sent successfully!')
    form.resetFields()
    setIsModalOpen(false)
  }

  // Filter list by tab first
  const tabNotifications = notificationsList.filter(item => 
    activeTab === 'Inbox' ? item.type === 'inbox' : item.type === 'sent'
  )

  // Filter list by search query
  const filteredNotifications = tabNotifications.filter(item => {
    const query = searchText.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query) ||
      item.target.toLowerCase().includes(query)
    )
  })

  // Role based defaults for message modal
  const getDefaultRecipient = () => {
    if (userRole === 'sales') return 'Support Team'
    if (userRole === 'practitioner') return 'Clinic Manager'
    if (userRole === 'patient') return 'Dr. Sarah Jenkins'
    if (userRole === 'clinic') return 'Practitioners / Staff'
    return 'All Members'
  }

  return (
    <div className="space-y-6">
      {/* Search and Broadcast Controls Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors duration-300">
        {/* Left Side: Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-fit border border-slate-100 dark:border-slate-900">
          <button
            onClick={() => {
              setActiveTab('Inbox')
              setSearchText('')
            }}
            className={`px-6 py-2 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${
              activeTab === 'Inbox'
                ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-sm'
                : 'bg-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => {
              setActiveTab('Sent')
              setSearchText('')
            }}
            className={`px-6 py-2 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${
              activeTab === 'Sent'
                ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-sm'
                : 'bg-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Right Side: Filters & Send Button */}
        <div className="flex items-center flex-wrap gap-3 flex-1 md:justify-end">
          <Input
            placeholder="Search notifications..."
            prefix={<SearchOutlined className="text-slate-400 mr-2" />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="rounded-xl h-10 w-full sm:w-64 border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs"
          />

          <Select
            placeholder="Filter Date"
            defaultValue="Date"
            className="rounded-xl h-10 w-32 flex items-center border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs"
          >
            <Option value="Date">Date</Option>
            <Option value="Today">Today</Option>
            <Option value="Yesterday">Yesterday</Option>
          </Select>

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#0E1B33', border: 'none' }}
            className="rounded-xl h-10 px-5 font-bold flex items-center gap-2 text-white"
          >
            {userRole === 'head_admin' ? 'Broadcast Message' : userRole === 'sales' ? 'Message Support' : 'Contact Admin'}
          </Button>
        </div>
      </div>

      {/* Notifications Cards Container */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">No notifications found in {activeTab}</div>
        ) : (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-xs transition-shadow"
            >
              {/* Left Side: Icon & Content */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-[#8C4BFF]/5 dark:bg-[#8C4BFF]/10 border border-[#8C4BFF]/10 rounded-2xl flex items-center justify-center text-[#8C4BFF] flex-shrink-0">
                  <MailOutlined style={{ fontSize: 20 }} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm m-0">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-semibold">
                    {item.message}
                  </p>
                </div>
              </div>

              {/* Right Side: Meta & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                <div className="flex flex-col sm:items-end text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Recipient: {item.target}</span>
                  <span className="mt-0.5">{item.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="text"
                    icon={<InfoCircleOutlined className="text-slate-400 hover:text-slate-600" />}
                    onClick={() => {
                      Modal.info({
                        title: item.title,
                        content: (
                          <div className="space-y-2 text-xs font-semibold mt-3" style={{ color: '#475569' }}>
                            <p style={{ color: '#475569' }}><strong style={{ color: '#0F1B33' }}>Message:</strong> {item.message}</p>
                            <p style={{ color: '#475569' }}><strong style={{ color: '#0F1B33' }}>Recipient:</strong> {item.target}</p>
                            <p style={{ color: '#475569' }}><strong style={{ color: '#0F1B33' }}>Date:</strong> {item.date}</p>
                          </div>
                        ),
                        okButtonProps: { style: { backgroundColor: '#0E1B33', borderRadius: '8px' } }
                      })
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg dark:text-slate-400"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setNotificationsList(prev => prev.filter(n => n.id !== item.id))
                      toast.success('Notification removed')
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination at the bottom */}
        {filteredNotifications.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <div>
              Showing 1-{filteredNotifications.length} out of {filteredNotifications.length}
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer font-bold flex items-center gap-1">
                &lt; Previous
              </button>
              <span className="w-6 h-6 bg-[#0E1B33] text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/20 flex items-center justify-center rounded-full text-[10px] font-bold">
                1
              </span>
              <button className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer font-bold flex items-center gap-1">
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messaging Modal */}
      <Modal
        title={
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-slate-800 dark:text-white">Compose Message</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5 font-semibold font-sans">Send updates directly to the designated department</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handleBroadcast} initialValues={{ target: getDefaultRecipient() }} className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">To :</span>
          </div>
          <Form.Item name="target" rules={[{ required: true, message: 'Required' }]} className="mb-4">
            <Input 
              disabled={userRole !== 'head_admin'}
              placeholder="Add members" 
              className="rounded-xl h-10 pr-12 dark:bg-slate-900 dark:border-slate-800 dark:text-white" 
              suffix={
                <span className="bg-[#EFEEFF] text-[#8C4BFF] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {userRole === 'head_admin' ? 'Broadcast' : 'Direct'}
                </span>
              }
            />
          </Form.Item>

          <Form.Item name="title" label={<span className="font-bold text-xs text-slate-800 dark:text-slate-200">Subject</span>} rules={[{ required: true, message: 'Required' }]} className="mb-4">
            <Input placeholder="Include message topic" className="rounded-xl h-10 dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
          </Form.Item>

          <Form.Item name="message" label={<span className="font-bold text-xs text-slate-800 dark:text-slate-200">Message</span>} rules={[{ required: true, message: 'Required' }]} className="mb-4">
            <Input.TextArea placeholder="Enter message details..." rows={5} className="rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
          </Form.Item>

          <Form.Item name="confirm" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please confirm changes')) }]} className="mb-4">
            <Checkbox className="text-xs text-slate-500 font-semibold dark:text-slate-400">Confirm changes of this message</Checkbox>
          </Form.Item>

          <div className="flex justify-end mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SendOutlined />} 
              style={{ backgroundColor: '#8C4BFF', border: 'none' }} 
              className="rounded-xl h-10 px-6 font-bold flex items-center gap-2 text-white hover:opacity-90"
            >
              Send
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
