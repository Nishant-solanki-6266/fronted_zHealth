import React, { useState } from 'react'
import { Card, Input, Button, Avatar, Select, Upload, Tag, Space, Divider } from 'antd'
import {
  SendOutlined,
  PaperClipOutlined,
  MailOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'

const { Option } = Select

export default function PatientMessages() {
  const [activeContact, setActiveContact] = useState('sarah')
  const [messageCategory, setMessageCategory] = useState('Treatment Questions')
  const [inputText, setInputText] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  const contacts = [
    { id: 'sarah', name: 'Dr. Sarah Jenkins', role: 'Primary Physiotherapist', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', online: true },
    { id: 'reception', name: 'Clinic Reception', role: 'Administrative Staff', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', online: true },
    { id: 'billing', name: 'Billing & Accounts', role: 'Practice Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', online: false },
    { id: 'support', name: 'ZealthOS Support Team', role: 'Platform Support', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', online: true }
  ]

  const [chatHistories, setChatHistories] = useState({
    sarah: [
      { id: '1', sender: 'doctor', text: 'Hi John, how is your pain level after completing the calf raises yesterday?', timestamp: 'Yesterday, 4:15 PM', category: 'Treatment Questions' },
      { id: '2', sender: 'patient', text: 'Hi Sarah, it felt slightly tight during the exercises but the soreness faded within an hour. Functional mobility is improving!', timestamp: 'Yesterday, 5:00 PM', category: 'Treatment Questions' },
      { id: '3', sender: 'doctor', text: 'Excellent progress. Make sure you keep your chest lifted during hamstring stretches to avoid rounding the lower back.', timestamp: 'Today, 9:30 AM', category: 'Exercise Questions' }
    ],
    reception: [
      { id: '1', sender: 'reception', text: 'Hello John, we have received your booking request for Friday. We are confirming details with Dr. Jenkins.', timestamp: 'Yesterday, 11:00 AM', category: 'Appointment Requests' }
    ],
    billing: [
      { id: '1', sender: 'billing', text: 'Hi John, just a reminder that INV-1829 is due in 3 days. Let us know if you need assistance with claim rebates.', timestamp: '2 days ago', category: 'Billing Questions' }
    ],
    support: [
      { id: '1', sender: 'support', text: 'Welcome to ZealthOS. You can control clinical file sharing permissions in the health record panel.', timestamp: '1 week ago', category: 'General Questions' }
    ]
  })

  const handleSend = () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return

    const newMsg = {
      id: Date.now().toString(),
      sender: 'patient',
      text: inputText || `Sent ${uploadedFiles.map(f => f.name).join(', ')}`,
      timestamp: 'Just now',
      category: messageCategory,
      files: [...uploadedFiles]
    }

    setChatHistories(prev => ({
      ...prev,
      [activeContact]: [...prev[activeContact], newMsg]
    }))

    setInputText('')
    setUploadedFiles([])
    toast.success('Message sent securely!')

    // Simulate clinical response
    setTimeout(() => {
      let responseText = "Thank you for the update. I will review this and get back to you shortly during my clinic hours."
      if (activeContact === 'reception') {
        responseText = "Your message has been received. Our clinic coordination staff will process your request shortly."
      } else if (activeContact === 'billing') {
        responseText = "Thank you for your response. Our billing team will update your account ledger."
      }

      const replyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: responseText,
        timestamp: 'Just now',
        category: messageCategory
      }

      setChatHistories(prev => ({
        ...prev,
        [activeContact]: [...prev[activeContact], replyMsg]
      }))
    }, 2000)
  }

  const selectedContactObj = contacts.find(c => c.id === activeContact)

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white m-0">Secure Provider Messaging</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              End-to-end encrypted chats with clinical practitioners, reception coordinators, and billing coordinators.
            </p>
          </div>
          <Tag color="green" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
            <CheckCircleOutlined className="mr-1" />
            E2E Encrypted Active
          </Tag>
        </div>
      </Card>

      {/* Messaging Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '24px' }}>
        
        {/* Left Side: Contact List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Active Conversations</span>
          <div className="space-y-2">
            {contacts.map(c => {
              const active = c.id === activeContact
              const lastMsg = chatHistories[c.id][chatHistories[c.id].length - 1]
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveContact(c.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    active 
                      ? 'border-[#8C4BFF] bg-[#8C4BFF]/5 text-[#8C4BFF]' 
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar src={c.avatar} size={40} className="border border-slate-200 dark:border-slate-700" />
                      {c.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col text-left">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold truncate">{c.role}</span>
                      {lastMsg && (
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate mt-1">
                          {lastMsg.sender === 'patient' ? 'You: ' : ''}{lastMsg.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Chat Feed */}
        <div className="lg:col-span-2">
          {selectedContactObj ? (
            <Card 
              className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden"
              bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-805 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedContactObj.avatar} size={36} />
                  <div>
                    <span className="font-extrabold text-xs text-slate-808 dark:text-white block">{selectedContactObj.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">{selectedContactObj.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Topic:</span>
                  <Select 
                    value={messageCategory} 
                    onChange={setMessageCategory}
                    className="w-40 rounded-xl"
                    size="small"
                  >
                    <Option value="General Questions">General Questions</Option>
                    <Option value="Treatment Questions">Treatment Questions</Option>
                    <Option value="Appointment Requests">Appointment Requests</Option>
                    <Option value="Exercise Questions">Exercise Questions</Option>
                    <Option value="Billing Questions">Billing Questions</Option>
                  </Select>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[300px]">
                {chatHistories[activeContact].map(msg => {
                  const isPatient = msg.sender === 'patient'
                  return (
                    <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] space-y-1`}>
                        <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                          isPatient 
                            ? 'bg-[#8C4BFF] text-white rounded-br-none' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}>
                          <div className="flex justify-between items-center gap-4 mb-1.5 opacity-80">
                            <span className="text-[9px] font-black uppercase tracking-wider">{msg.category}</span>
                            <span className="text-[8px] font-semibold">{msg.timestamp}</span>
                          </div>
                          <div className="m-0 text-xs font-semibold" style={{ color: isPatient ? '#ffffff' : undefined }}>{msg.text}</div>
                          {msg.files && msg.files.map(f => (
                            <div key={f.name} className="mt-2 p-2 bg-black/10 rounded-xl flex items-center gap-2 text-[10px] font-bold">
                              {f.type.includes('image') ? <PictureOutlined /> : <FileTextOutlined />}
                              <span>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Text Input & Controls */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map(f => (
                      <Tag 
                        key={f.name} 
                        closable 
                        onClose={() => setUploadedFiles(prev => prev.filter(x => x.name !== f.name))}
                        className="rounded-full bg-slate-100 dark:bg-slate-800 border-none font-bold text-[10px]"
                      >
                        {f.name}
                      </Tag>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Upload
                    beforeUpload={(file) => {
                      setUploadedFiles(prev => [...prev, { name: file.name, type: file.type }])
                      toast.success(`Attached: ${file.name}`)
                      return false
                    }}
                    showUploadList={false}
                  >
                    <Button 
                      shape="circle" 
                      icon={<PaperClipOutlined style={{ fontSize: 16 }} />} 
                      className="flex items-center justify-center dark:bg-slate-900 dark:border-slate-800"
                    />
                  </Upload>
                  
                  <Input 
                    placeholder={`Write your secure message to ${selectedContactObj.name}...`} 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onPressEnter={handleSend}
                    className="rounded-xl h-10 text-xs flex-1"
                  />
                  
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={handleSend}
                    style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
                    className="rounded-xl h-10 px-4 flex items-center justify-center text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-400">
              Select a clinical practitioner or support staff to begin secure messaging.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
