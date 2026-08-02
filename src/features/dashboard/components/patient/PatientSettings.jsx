import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClinicStore } from '../../../../store/clinicStore'
import { Card, Form, Input, Button, Checkbox, Space, Table, Tag, Modal, Divider, Switch, Tooltip, Select } from 'antd'
import {
  UserOutlined,
  BellOutlined,
  LockOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  FireOutlined,
  CalendarOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'

export default function PatientSettings() {
  const navigate = useNavigate()
  const { darkMode } = useClinicStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [activeProfileId, setActiveProfileId] = useState('john')
  const [tfaEnabled, setTfaEnabled] = useState(true)
  const [smsNotify, setSmsNotify] = useState(true)
  const [emailNotify, setEmailNotify] = useState(true)
  const [pushNotify, setPushNotify] = useState(false)

  // AI chat state
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hello John! I am your AI Recovery Assistant. Select one of the coaches below or ask me a question about your care plan, exercises, or funding.' }
  ])
  const [aiInput, setAiInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  const [trustedDevices, setTrustedDevices] = useState([
    { key: '1', device: 'Chrome / Windows (Current)', ip: '103.88.24.12', time: 'Today, 04:30 PM', location: 'Melbourne, VIC', status: 'Active Session' },
    { key: '2', device: 'iPhone App Client', ip: '120.91.4.11', time: 'Today, 10:15 AM', location: 'Sydney, NSW', status: 'Active Session' }
  ])

  const achievementsList = [
    { name: 'First Exercise Completed', status: 'Unlocked', desc: 'Successfully performed your first home care exercise routine.', date: '12 Jan 2026', badge: '🥇' },
    { name: '7-Day Streak', status: 'Unlocked', desc: 'Completed exercises for 7 consecutive days.', date: '19 Jan 2026', badge: '🔥' },
    { name: '30-Day Streak', status: 'Locked', desc: 'Complete daily exercises for 30 days in a row.', progress: '14/30 days', badge: '⭐' },
    { name: 'Treatment Goal Achieved', status: 'Unlocked', desc: 'Reached 80% improvement milestone in Shoulder Mobility.', date: '04 Jun 2026', badge: '🏆' },
    { name: 'Perfect Attendance', status: 'Unlocked', desc: 'Attended all scheduled clinic consultation reviews on time.', date: '12 May 2026', badge: '🎯' }
  ]

  const profilesData = {
    john: {
      name: 'John Miller',
      phone: '+61 411 992 812',
      email: 'john.miller@example.com',
      address: '124 Collins St, Melbourne VIC 3000',
      emergencyName: 'Mary Miller',
      emergencyRelation: 'Spouse',
      emergencyPhone: '+61 412 110 992',
      gpName: 'Dr. Arthur Pendelton',
      gpClinic: 'Collins Street Medical Group',
      gpPhone: '+61 3 9821 4410',
      medicareNum: '3901 88124 1',
      medicareRef: '2',
      medicareExpiry: '11/2028',
      phiProvider: 'Medibank Private',
      phiMemberNum: 'MBI-98214112'
    },
    lily: {
      name: 'Lily Miller',
      phone: '+61 411 992 812',
      email: 'lily.miller@example.com',
      address: '124 Collins St, Melbourne VIC 3000',
      emergencyName: 'John Miller',
      emergencyRelation: 'Father',
      emergencyPhone: '+61 411 992 812',
      gpName: 'Dr. Sarah Jenkins',
      gpClinic: 'Kids Health Clinic',
      gpPhone: '+61 3 9111 2222',
      medicareNum: '3901 88124 1',
      medicareRef: '3',
      medicareExpiry: '11/2028',
      phiProvider: 'Medibank Private',
      phiMemberNum: 'MBI-98214112-L'
    }
  }

  const currentProfile = profilesData[activeProfileId]

  const tabs = [
    { key: 'profile', label: 'Personal Details', icon: <UserOutlined /> },
    { key: 'preferences', label: 'Preferences', icon: <BellOutlined /> },
    { key: 'security', label: 'Security', icon: <LockOutlined /> },
    { key: 'achievements', label: 'Achievements', icon: <CrownOutlined /> },
    { key: 'ai_assistant', label: 'AI Recovery Assistant', icon: <ThunderboltOutlined /> }
  ]

  const handleAiAsk = (promptText) => {
    if (!promptText.trim()) return

    const userMsg = { sender: 'user', text: promptText }
    setAiChatMessages(prev => [...prev, userMsg])
    setAiInput('')
    setIsAiTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = "I am looking into your care data. How else can I assist with your recovery routines?"
      const lowercasePrompt = promptText.toLowerCase()

      if (lowercasePrompt.includes('lumbar') || lowercasePrompt.includes('exercise')) {
        response = "🧘 [AI Exercise Coach]: For lumbar extensions, start by lying flat on your stomach. Slowly press your upper body up onto your elbows while keeping your hips on the floor. Hold for 5-10 seconds. Focus on a gentle lower back stretch and breathe deeply. Do 3 sets of 5 repetitions daily."
      } else if (lowercasePrompt.includes('hurt') || lowercasePrompt.includes('pain')) {
        response = "⚠️ [AI Recovery Assistant]: Mild soreness is expected, but sharp or increasing pain is a sign to rest. I suggest holding off on the hamstring stretches today. Apply ice for 15 minutes and log your pain level in the Progress tab so Dr. Jenkins can review it."
      } else if (lowercasePrompt.includes('gp') || lowercasePrompt.includes('prepare')) {
        response = "📅 [AI Appointment Prep Assistant]: For your upcoming GP review on Tuesday, prepare a summary of your functional recovery: note that pain dropped from 6/10 to 2/10, your shoulder abduction is up 15 degrees, and you are 75% compliant on NDIS exercises."
      } else if (lowercasePrompt.includes('epc') || lowercasePrompt.includes('treatment')) {
        response = "📖 [AI Treatment Explainer]: Under your EPC (Enhanced Primary Care) plan, you are approved for 5 sessions. The goals are: (1) Walk pain-free (currently 70% done), (2) Improve Shoulder Mobility (80% done). Your timeline targets discharge by July 15."
      } else if (lowercasePrompt.includes('ndis') || lowercasePrompt.includes('funding')) {
        response = "💰 [AI Funding FAQ Assistant]: Under ZealthOS, NDIS claims are submitted directly to your Support Coordinator. You currently have $7,400 remaining (65% available). Low-balance notifications will trigger when remaining sessions drop below 2."
      }

      setAiChatMessages(prev => [...prev, { sender: 'ai', text: response }])
      setIsAiTyping(false)
    }, 1200)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            
            {/* Parent / Carer Portal Widget */}
            <Card className="border border-indigo-100 dark:border-indigo-900/50 rounded-2xl shadow-sm bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <UserOutlined style={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 m-0">Parent / Carer Portal (Family Management)</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 font-semibold">You are currently managing accounts for your dependents. Switch profiles below.</p>
                  </div>
                </div>
                <Select value={activeProfileId} className="w-full sm:w-56 h-9" onChange={(v) => { setActiveProfileId(v); toast.success(`Switched to profile: ${v === 'john' ? 'John Miller' : 'Lily Miller (Daughter)'}`) }}>
                  <Select.Option value="john">👨 John Miller (Self)</Select.Option>
                  <Select.Option value="lily">👧 Lily Miller (Daughter)</Select.Option>
                </Select>
              </div>
            </Card>

            <div key={activeProfileId} className="space-y-6">
              <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">My Profile & Contact Details</span>}>
                <Form 
                  layout="vertical"
                  initialValues={{
                    name: currentProfile.name,
                    phone: currentProfile.phone,
                    email: currentProfile.email,
                    address: currentProfile.address,
                    emergencyName: currentProfile.emergencyName,
                    emergencyRelation: currentProfile.emergencyRelation,
                    emergencyPhone: currentProfile.emergencyPhone
                  }}
                onFinish={() => toast.success('Profile details saved successfully!')}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item name="name" label="Full Name" required>
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone Number" required>
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="email" label="Email Address" required>
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                </div>
                <Form.Item name="address" label="Home Address">
                  <Input className="rounded-xl h-9" />
                </Form.Item>
                
                <Divider className="my-4" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Emergency Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item name="emergencyName" label="Contact Name">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="emergencyRelation" label="Relationship">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="emergencyPhone" label="Contact Phone">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold h-9 text-xs text-white">Save Personal Details</Button>
                </div>
              </Form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GP Information */}
              <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">General Practitioner (GP) Information</span>}>
                <Form 
                  layout="vertical"
                  initialValues={{
                    gpName: currentProfile.gpName,
                    gpClinic: currentProfile.gpClinic,
                    gpPhone: currentProfile.gpPhone
                  }}
                  onFinish={() => toast.success('GP records updated!')}
                >
                  <Form.Item name="gpName" label="GP Doctor Name">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="gpClinic" label="GP Clinic Name">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="gpPhone" label="GP Phone Contact">
                    <Input className="rounded-xl h-9" />
                  </Form.Item>
                  <div className="flex justify-end pt-2">
                    <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold h-9 text-xs text-white">Save GP Records</Button>
                  </div>
                </Form>
              </Card>

              {/* Medicare & Insurance details */}
              <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Medicare & Private Health Insurance</span>}>
                <Form 
                  layout="vertical"
                  initialValues={{
                    medicareNum: currentProfile.medicareNum,
                    medicareRef: currentProfile.medicareRef,
                    medicareExpiry: currentProfile.medicareExpiry,
                    phiProvider: currentProfile.phiProvider,
                    phiMemberNum: currentProfile.phiMemberNum
                  }}
                  onFinish={() => toast.success('Insurance records saved!')}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Form.Item name="medicareNum" label="Medicare Card Number">
                        <Input className="rounded-xl h-9 font-mono" />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="medicareRef" label="Ref No">
                        <Input className="rounded-xl h-9 font-mono" />
                      </Form.Item>
                    </div>
                  </div>
                  <Form.Item name="medicareExpiry" label="Card Expiry (MM/YYYY)">
                    <Input className="rounded-xl h-9 font-mono" />
                  </Form.Item>
                  
                  <Divider className="my-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <Form.Item name="phiProvider" label="Private Health Provider">
                      <Input className="rounded-xl h-9" />
                    </Form.Item>
                    <Form.Item name="phiMemberNum" label="Member Policy ID">
                      <Input className="rounded-xl h-9 font-mono" />
                    </Form.Item>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold h-9 text-xs text-white">Save Insurance Details</Button>
                  </div>
                </Form>
              </Card>
            </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-705 dark:text-slate-350">Notifications Preferences</span>}>
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">SMS Notifications</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Receive instant text alerts for appointment scheduling updates and exercise changes.</span>
                </div>
                <Switch checked={smsNotify} onChange={setSmsNotify} />
              </div>
              
              <Divider className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Email Alerts</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Receive clinical receipts, invoice copies, and monthly health progress PDF summaries.</span>
                </div>
                <Switch checked={emailNotify} onChange={setEmailNotify} />
              </div>

              <Divider className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Push Notifications</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Receive system alerts on your browser or phone client when exercises are due.</span>
                </div>
                <Switch checked={pushNotify} onChange={setPushNotify} />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="primary"
                  onClick={() => toast.success('Preferences updated!')}
                  style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
                  className="rounded-xl font-bold h-10 text-xs text-white"
                >
                  Save Notification Toggles
                </Button>
              </div>
            </div>
          </Card>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 2FA Card */}
              <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <SafetyCertificateOutlined className="text-[#8C4BFF]" style={{ fontSize: 20 }} />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white m-0">Two-Factor Authentication (2FA)</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-5">
                  Protect your sensitive clinical health record with an extra security verification layer. We support secure authenticator apps.
                </p>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl mb-5">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">2FA Status</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Enabled (SMS OTP fallback configured)</span>
                  </div>
                  <Switch checked={tfaEnabled} onChange={e => {
                    setTfaEnabled(e)
                    toast.success(`2FA turned ${e ? 'ON' : 'OFF'}!`)
                  }} />
                </div>
              </Card>

              {/* Password update */}
              <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <LockOutlined className="text-[#8C4BFF]" style={{ fontSize: 20 }} />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white m-0">Change password</h3>
                </div>
                <Form
                  layout="vertical"
                  onFinish={() => toast.success('Password updated successfully!')}
                  className="space-y-3"
                >
                  <Form.Item name="oldPass" label="Current Password" required>
                    <Input.Password className="rounded-xl h-9" />
                  </Form.Item>
                  <Form.Item name="newPass" label="New Secure Password" required>
                    <Input.Password className="rounded-xl h-9" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33', width: '100%' }} className="rounded-xl font-bold h-9 text-xs text-white">Change Account Password</Button>
                </Form>
              </Card>

            </div>

            {/* Trusted devices */}
            <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Login History & Device Management</span>}>
              <Table 
                dataSource={trustedDevices}
                pagination={false}
                scroll={{ x: 700 }}
                columns={[
                  { title: 'Connected Device', dataIndex: 'device', render: (t) => <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{t}</span> },
                  { title: 'IP Address', dataIndex: 'ip', render: (t) => <span className="font-mono text-xs text-slate-500">{t}</span> },
                  { title: 'Location', dataIndex: 'location' },
                  { title: 'Status', dataIndex: 'status', render: (t) => <Tag color="purple" className="rounded-full border-none font-bold text-[9px] px-2.5">{t}</Tag> },
                  {
                    title: '',
                    key: 'actions',
                    align: 'right',
                    render: (_, rec) => (
                      rec.key !== '1' ? (
                        <Button 
                          size="small" 
                          danger
                          onClick={() => {
                            setTrustedDevices(prev => prev.filter(d => d.key !== rec.key))
                            toast.success('Session revoked!')
                          }}
                          className="rounded-lg text-[10px] font-bold"
                        >
                          Revoke
                        </Button>
                      ) : null
                    )
                  }
                ]}
              />
            </Card>
          </div>
        )

      case 'achievements':
        return (
          <div className="space-y-6">
            
            {/* Gamification progress overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Unlocked Achievements</span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white m-0">4 out of 5</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Streak</span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white m-0">14 Days Active</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-full flex items-center justify-center text-2xl">
                  🌟
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Rewards Badges</span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white m-0">Gold Care Badge</h3>
                </div>
              </div>
            </div>

            {/* Achievements Card list */}
            <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">My Care Milestones & Achievements</span>}>
              <div className="space-y-4">
                {achievementsList.map(item => (
                  <div key={item.name} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl flex-shrink-0">{item.badge}</span>
                      <div>
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-semibold">{item.desc}</span>
                        {item.progress && (
                          <span className="text-[9px] text-[#8C4BFF] font-black block mt-1">Progress: {item.progress}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {item.status === 'Unlocked' ? (
                        <Tag color="success" className="rounded-full border-none font-bold text-[9px] uppercase px-2.5 py-0.5">Unlocked on {item.date}</Tag>
                      ) : (
                        <Tag color="default" className="rounded-full border-none font-bold text-[9px] uppercase px-2.5 py-0.5">Locked</Tag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      case 'ai_assistant':
        return (
          <div className="space-y-6">
            <Card 
              className="border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
              title={
                <div className="flex items-center gap-2">
                  <RobotOutlined className="text-[#8C4BFF]" style={{ fontSize: 16 }} />
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Interactive AI Patient Recovery Coach (Mock Beta)</span>
                </div>
              }
            >
              <div className="flex flex-col h-[400px] justify-between">
                
                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto space-y-3.5 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 max-h-[250px]">
                  {aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-[80%] ${
                        msg.sender === 'user' 
                          ? 'bg-[#8C4BFF] text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                      }`}>
                        <p className={`m-0 text-xs ${msg.sender === 'user' ? '!text-white' : ''}`} style={msg.sender === 'user' ? { color: '#ffffff' } : {}}>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-white dark:bg-slate-850 text-slate-400 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-800 text-xs italic font-semibold">
                        Coach is typing answers...
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompt Buttons Group */}
                <div className="py-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Frequently Asked Recovery Questions</span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleAiAsk("AI Exercise Coach: How do I perform my lumbar extensions correctly?")}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#8C4BFF]/10 dark:hover:bg-[#8C4BFF]/20 text-slate-600 dark:text-slate-300 hover:text-[#8C4BFF] dark:hover:text-[#8C4BFF] border-none text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                    >
                      🧘 Lumbar extensions instructions
                    </button>
                    <button 
                      onClick={() => handleAiAsk("Recovery Coach: What if I feel hamstring tightness after exercise?")}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#8C4BFF]/10 dark:hover:bg-[#8C4BFF]/20 text-slate-600 dark:text-slate-300 hover:text-[#8C4BFF] dark:hover:text-[#8C4BFF] border-none text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                    >
                      ⚠️ Muscle tightness guidelines
                    </button>
                    <button 
                      onClick={() => handleAiAsk("Treatment Explainer: Explain goals on my active EPC plans")}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#8C4BFF]/10 dark:hover:bg-[#8C4BFF]/20 text-slate-600 dark:text-slate-300 hover:text-[#8C4BFF] dark:hover:text-[#8C4BFF] border-none text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                    >
                      📖 Explain my treatment plan goals
                    </button>
                    <button 
                      onClick={() => handleAiAsk("Funding Coach: Tell me how NDIS claim rebates work in ZealthOS")}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#8C4BFF]/10 dark:hover:bg-[#8C4BFF]/20 text-slate-600 dark:text-slate-300 hover:text-[#8C4BFF] dark:hover:text-[#8C4BFF] border-none text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                    >
                      💰 How NDIS sessions work
                    </button>
                  </div>
                </div>

                {/* Text input */}
                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <Input 
                    placeholder="Ask AI Patient Coach..." 
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onPressEnter={() => handleAiAsk(aiInput)}
                    className="rounded-xl h-10 text-xs flex-1"
                  />
                  <Button 
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleAiAsk(aiInput)}
                    style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
                    className="rounded-xl h-10 text-white font-bold text-xs"
                  >
                    Ask AI
                  </Button>
                </div>

              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="py-2 space-y-6">
      <button 
        onClick={() => navigate('/clinic')}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#8C4BFF] font-semibold text-xs border-none bg-transparent cursor-pointer mb-2 transition-colors w-fit"
      >
        <span className="text-sm">←</span>
        <span>Back to Dashboard</span>
      </button>
      
      {/* Flat inline tabs wrapper */}
      <div 
        className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800"
        style={{ width: 'fit-content' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border-none bg-transparent"
              style={{
                backgroundColor: isActive ? (darkMode ? '#1E293B' : '#FFFFFF') : 'transparent',
                color: isActive ? (darkMode ? '#C4B5FD' : '#8C4BFF') : '#64748B',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

    </div>
  )
}
