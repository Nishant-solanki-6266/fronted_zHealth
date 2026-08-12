import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, Avatar } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

export default function SalesMessages({ store: propStore }) {
  const localStore = useClinicStore()
  const store = propStore || localStore
  const { salesMessages } = store
  
  const [activeChannel, setActiveChannel] = useState('Head Admin')
  const [textInput, setTextInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (store.fetchSalesMessages) store.fetchSalesMessages()
  }, [])

  const getLoggedInSalesName = () => {
    if (store.user?.name) return store.user.name
    if (store.salesProfile?.name) return store.salesProfile.name
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName')
      if (storedName) return storedName
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed?.name) return parsed.name
        } catch (e) {}
      }
    }
    return store.userRole === 'sales' ? 'Sales Executive' : ''
  }

  const currentRepName = getLoggedInSalesName() || 'Sales Executive'

  const channels = [
    { name: 'Head Admin', role: 'Platform Owner', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { name: 'Support Team', role: 'Technical Desk', avatar: '' },
    { name: 'Sales Reps Group', role: 'Colleague Forum', avatar: '' }
  ]

  // Filter messages belonging to active thread
  const filteredMessages = salesMessages.filter(m => {
    if (activeChannel === 'Sales Reps Group') {
      return m.recipient === 'Sales Reps Group' || m.sender === 'Sales Reps Group'
    } else {
      return (m.sender === activeChannel || m.recipient === activeChannel)
    }
  })

  const handleSendMessage = () => {
    if (!textInput.trim()) return
    
    store.addSalesMessage({
      sender: currentRepName,
      recipient: activeChannel,
      text: textInput
    })

    setTextInput('')
    toast.success('Message sent!')
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredMessages])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row" style={{ height: '580px' }}>
      
      {/* Sidebar Channels List */}
      <div className="w-full md:w-64 border-r border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider m-0">Conversations</h3>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {channels.map(ch => {
            const isActive = activeChannel === ch.name
            return (
              <div
                key={ch.name}
                onClick={() => setActiveChannel(ch.name)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                  isActive 
                    ? 'bg-purple-500/10 text-[#8C4BFF]' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-350'
                }`}
              >
                <Avatar 
                  src={ch.avatar || null} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: isActive ? '#8C4BFF' : '#64748B' }} 
                  size="small"
                />
                <div>
                  <span className="font-extrabold text-xs block">{ch.name}</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">{ch.role}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="flex-grow flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/20">
        
        {/* Active Channel Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xs m-0">{activeChannel}</h3>
            <span className="text-[9px] text-slate-400 font-semibold">Secure Direct Workspace Connection</span>
          </div>
        </div>

        {/* Message Logs */}
        <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-3.5">
          {filteredMessages.map(msg => {
            const isMe = msg.sender === currentRepName || msg.sender === 'Sales Executive'
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs font-semibold ${
                  isMe 
                    ? 'bg-[#8C4BFF] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                }`}>
                  {!isMe && (
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wide">
                      {msg.sender}
                    </span>
                  )}
                  <p className="m-0 leading-relaxed">{msg.text}</p>
                  <span className={`text-[8px] text-right block mt-1.5 ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>
              </div>
            )}
          )}
          {filteredMessages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
              👋 Start the conversation! Type a message below.
            </div>
          )}
        </div>

        {/* Input Box footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <Input 
            placeholder={`Send message to ${activeChannel}...`}
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onPressEnter={handleSendMessage}
            className="rounded-xl h-10 border-slate-200 dark:border-slate-850 dark:bg-slate-950 flex-grow"
          />
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }}
            className="rounded-xl h-10 w-12 flex items-center justify-center shrink-0"
          />
        </div>

      </div>

    </div>
  )
}
