import React, { useState } from 'react'
import { Card, Select, Tag } from 'antd'
import {
  ApartmentOutlined, TeamOutlined, UserOutlined, CreditCardOutlined, DollarOutlined, PieChartOutlined,
  ArrowUpOutlined, ArrowDownOutlined, CloseCircleOutlined, ThunderboltOutlined, InfoCircleOutlined, SyncOutlined,
  MessageOutlined, SendOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'

const { Option } = Select

export default function HeadAdminDashboard({ store, navigate }) {
  const darkMode = store.darkMode
  const [selectedYear, setSelectedYear] = useState('2026')
  const [taskRef, setTaskRef] = useState('')
  const [messageText, setMessageText] = useState('')

  const handleSendMessage = () => {
    if (!messageText.trim()) return
    store.addMessageBoardItem({
      sender: 'Alex Sadman',
      senderRole: 'Clinic Admin',
      message: messageText.trim(),
      taskRef: taskRef.trim() || null,
    })
    toast.success('Message posted to clinic board!')
    setMessageText('')
    setTaskRef('')
  }

  // Metric Cards
  const stats = [
    { label: 'Total Clinics', value: '12', change: '+4.0%', pos: true, sub: 'from last month', icon: <ApartmentOutlined /> },
    { label: 'Total Practitioners', value: '348', change: '+6.0%', pos: true, sub: 'from last month', icon: <TeamOutlined /> },
    { label: 'Total Patients', value: '12,536', change: '+2.0%', pos: true, sub: 'from last month', icon: <UserOutlined /> },
    { label: 'Active Subscriptions', value: '592', change: '+4.0%', pos: true, sub: 'from last month', icon: <CreditCardOutlined /> },
    { label: 'MRR', value: '$52,400', change: '+12.8%', pos: true, sub: 'from last month', icon: <DollarOutlined /> },
    { label: 'ARR', value: '$628,800', change: '+10.5%', pos: true, sub: 'YoY', icon: <PieChartOutlined /> },
  ]

  // Revenue Trend Chart Data (matches the wave in the reference)
  const revenueTrendData = [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 24000 },
    { name: 'Apr', value: 18000 },
    { name: 'May', value: 22000 },
    { name: 'Jun', value: 32000 },
    { name: 'Jul', value: 48000 },
    { name: 'Aug', value: 42000 },
    { name: 'Sep', value: 38000 },
    { name: 'Oct', value: 46000 },
    { name: 'Nov', value: 44000 },
    { name: 'Dec', value: 55000 },
  ]

  // Subscription Monthly Distribution (1 year bar chart)
  const subMonthlyData = [
    { name: 'Jan', value: 80 },
    { name: 'Feb', value: 140 },
    { name: 'Mar', value: 180 },
    { name: 'Apr', value: 130 },
    { name: 'May', value: 280 },
    { name: 'Jun', value: 310 },
    { name: 'Jul', value: 240 },
    { name: 'Aug', value: 410 },
    { name: 'Sep', value: 360 },
    { name: 'Oct', value: 200 },
    { name: 'Nov', value: 180 },
    { name: 'Dec', value: 360 },
  ]

  // Live Activity Log
  const liveActivities = [
    { id: '1', title: 'New clinic onboarded', desc: 'West Coast Family Care joined on the Advanced plan', time: '3m ago', icon: <ApartmentOutlined className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { id: '2', title: 'Subscription upgraded', desc: 'Bayview Family Clinic upgraded from Advanced -> Enterprise', time: '27m ago', detail: '$240', icon: <ArrowUpOutlined className="text-purple-500" />, bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { id: '3', title: 'Failed payment', desc: 'Admin session: Card ending in 4321 declined (insufficient funds)', time: '1h ago', detail: '$145', icon: <CloseCircleOutlined className="text-rose-500" />, bg: 'bg-rose-50 dark:bg-rose-950/20' },
    { id: '4', title: 'AI usage spike', desc: 'Clinic sync: Cardiology API experienced high load request rates', time: '2h ago', icon: <ThunderboltOutlined className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { id: '5', title: 'New support ticket', desc: "TKT-30457: 'Cannot upload patient documents' - High priority", time: '3h ago', icon: <InfoCircleOutlined className="text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { id: '6', title: 'Annual switch', desc: 'Northside Dental switched from monthly to annual Advanced', time: '1d ago', icon: <SyncOutlined className="text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  ]

  // Outstanding Invoices
  const outstandingInvoices = [
    { name: 'Lakeside Medical', inv: 'INV-20831', due: '18 Jun', amount: '$1,200', status: 'Extension' },
    { name: 'Riverstone Cardiology', inv: 'INV-20828', due: '15 Jun', amount: '$1,800', status: 'Extension' },
    { name: 'Brookside Orthodontics', inv: 'INV-20822', due: '24 Jun', amount: '$899', status: 'Succeeded' },
    { name: 'Rosewood Physiotherapy', inv: 'INV-20814', due: '28 Jun', amount: '$349', status: 'Extension' },
  ]

  // Churn Risk
  const churnRisk = [
    { name: 'Cedar Hill Clinic', days: 'Overdue 8d', status: 'Basic' },
    { name: 'Hillcrest Rehab', days: 'Overdue 11d', status: 'Basic' },
    { name: 'Wynwood Wellness', days: 'Overdue 14d', status: 'Premium' },
    { name: 'Greenfield Health', days: 'Overdue 18d', status: 'Advanced' },
  ]

  // Failed Payments
  const failedPayments = [
    { name: 'Bayview Family Clinic', days: '3 days ago', amount: '$499' },
    { name: 'Northside Dental', days: '5 days ago', amount: '$299' },
    { name: 'Hillcrest Rehab', days: '7 days ago', amount: '$199' },
  ]

  // AI Usage Overview
  const aiStats = [
    { label: 'Active chats/month', value: '318K', change: '+15.2% vs last month', pos: true },
    { label: 'Dictation minutes', value: '24.8K', change: '+9.0% vs last month', pos: true },
    { label: 'AI cost/month', value: '$5,720', change: '+1.4% vs last month', pos: true },
    { label: 'Cost vs revenue', value: '4.0%', change: 'of $142,300 revenue', pos: false },
  ]

  // Top AI Consuming Clinics
  const topAiClinics = [
    { name: 'Bayview Family Clinic', plan: 'Enterprise', pct: 38, val: '8.2K / wk', color: 'bg-purple-600' },
    { name: 'Riverstone Cardiology', plan: 'Enterprise', pct: 22, val: '4.8K / wk', color: 'bg-indigo-600' },
    { name: 'Westend Wellness', plan: 'Premium', pct: 10, val: '2.2K / wk', color: 'bg-pink-600' },
    { name: 'Northside Dental', plan: 'Advanced', pct: 9, val: '2K / wk', color: 'bg-blue-600' },
    { name: 'Maplewood Dermatology', plan: 'Advanced', pct: 8, val: '1.6K / wk', color: 'bg-sky-600' },
  ]

  // System Health Services
  const systemHealthNodes = [
    { name: 'Core API', status: 'Operational', color: 'text-emerald-500 bg-emerald-500/10', uptime: '99.88%', latency: '142ms (us-east-1)', desc: 'REST & GraphQL gateway' },
    { name: 'Web App', status: 'Operational', color: 'text-emerald-500 bg-emerald-500/10', uptime: '99.91%', latency: '280ms (global)', desc: 'Owner Dashboard and client portal' },
    { name: 'Mobile App', status: 'Degraded', color: 'text-amber-500 bg-amber-500/10', uptime: '95.30%', latency: '410ms (global)', desc: 'iOS & Android clinician app' },
    { name: 'Primary Database', status: 'Operational', color: 'text-emerald-500 bg-emerald-500/10', uptime: '100.00%', latency: '15ms (us-east-1)', desc: 'PostgreSQL cluster (1 read + 3 read replicas)' },
    { name: 'AI Inference', status: 'Operational', color: 'text-emerald-500 bg-emerald-500/10', uptime: '99.92%', latency: '1670ms (asia-east-1)', desc: 'Hosted models serving' },
    { name: 'Billing jobs', status: 'Maintenance', color: 'text-blue-500 bg-blue-500/10', uptime: '99.60%', latency: '— (us-east-1)', desc: 'Nightly invoice + subscription workers' },
  ]

  // Recent Error Logs
  const recentErrors = [
    { type: 'Error', title: 'OutOfMemory on dashboard load — iOS 15 devices', source: 'Mobile App', time: '21h ago', count: '22 occurrences' },
    { type: 'Warning', title: 'Stripe webhook timeout (10s) — invoice.payment_failed', source: 'Core API', time: '23h ago', count: '5 occurrences' },
    { type: 'API Warning', title: 'Token budget exceeded for clinic CL-008 — request throttled', source: 'AI Inference', time: '27h ago', count: '18 occurrences' },
    { type: 'Error', title: 'Retry worker partial failure — 2 invoices not re-attempted', source: 'Billing jobs', time: '27h ago', count: '1 occurrence' },
  ]

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Platform Overview</h1>
          <p className="text-slate-400 dark:text-slate-350 text-xs font-semibold mt-1">Clinics, subscribers, revenue, AI usage, and system health at a glance</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">{s.label}</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-655 dark:text-slate-300 text-xs">
                {s.icon}
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white m-0 tracking-tight">{s.value}</h3>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
              {s.pos ? <ArrowUpOutlined style={{ fontSize: 8 }} /> : <ArrowDownOutlined style={{ fontSize: 8 }} />}
              <span>{s.change}</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium ml-0.5">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Trend & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2">
          <Card 
            className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-full bg-white dark:bg-slate-900"
            title={<span className="font-extrabold text-sm text-slate-700 dark:text-white">Revenue Trend</span>}
            extra={
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">1 year's revenue growth</span>
                <Select value={selectedYear} onChange={setSelectedYear} size="small" className="w-20 rounded-lg">
                  <Option value="2026">2026</Option>
                  <Option value="2025">2025</Option>
                </Select>
              </div>
            }
          >
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#30D2BE" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#30D2BE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                  <XAxis dataKey="name" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="value" stroke="#30D2BE" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{ r: 4, strokeWidth: 2, fill: darkMode ? '#1E293B' : '#fff', stroke: '#30D2BE' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Live Activity Column */}
        <div className="lg:col-span-1">
          <Card 
            className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-full bg-white dark:bg-slate-900"
            title={
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-700 dark:text-white">Live Activity</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full select-none">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
            }
            extra={<span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">Real-time updates</span>}
          >
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {liveActivities.map(act => (
                <div key={act.id} className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800/50 pb-3 last:border-b-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${act.bg} text-xs font-bold`}>
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate">{act.title}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">{act.desc}</p>
                    {act.detail && (
                      <span className="inline-block bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5">
                        {act.detail}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Financial Snapshot Row */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Financial Snapshot</h2>
          <p className="text-slate-455 dark:text-slate-400 text-xs font-semibold mt-0.5">Revenue, receivables, and risk</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Revenue today', value: '$8,420', change: '+12.4%', color: 'text-emerald-500', sub: 'vs yesterday' },
            { label: 'Revenue this month', value: '$142,300', change: '+8.1%', color: 'text-emerald-500', sub: 'vs last month' },
            { label: 'Outstanding invoices', value: '$12,440', change: '7 invoices', color: 'text-amber-500', sub: 'in process' },
            { label: 'Failed payments', value: '$2,995', change: '5 this week', color: 'text-rose-500', sub: 'needs attention' },
            { label: 'Churn risk', value: '4 clinics', change: '$8,900 MRR', color: 'text-rose-600', sub: 'at risk' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
              <span className="text-slate-400 dark:text-slate-500 text-[9px] font-bold block uppercase tracking-wider">{item.label}</span>
              <h4 className="text-lg font-black text-slate-800 dark:text-white m-0 mt-2">{item.value}</h4>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-bold">
                <span className={item.color}>{item.change}</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-white">Outstanding Invoices</span>}>
              <div className="space-y-3.5">
                {outstandingInvoices.map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 dark:border-slate-800 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{inv.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{inv.inv} &bull; Due {inv.due}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 dark:text-white">{inv.amount}</span>
                      <Tag color={inv.status === 'Succeeded' ? 'purple' : 'default'} className="m-0 border-none font-bold text-[8px] px-2 py-0.5 rounded-full uppercase">{inv.status}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-white">Churn Risk</span>}>
              <div className="space-y-3.5">
                {churnRisk.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 dark:border-slate-800 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{c.name}</span>
                      <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{c.days}</span>
                    </div>
                    <Tag color={c.status === 'Premium' ? 'purple' : c.status === 'Advanced' ? 'blue' : 'default'} className="m-0 border-none font-bold text-[8px] px-2 py-0.5 rounded-full uppercase">{c.status}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-white">Failed Payments</span>}>
              <div className="space-y-3.5">
                {failedPayments.map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 dark:border-slate-800 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{f.days}</span>
                    </div>
                    <span className="font-extrabold text-rose-500">{f.amount}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Usage Overview Row */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">AI Usage Overview</h2>
          <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold mt-0.5">Platform AI consumption and cost vs revenue</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiStats.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
              <span className="text-slate-400 dark:text-slate-500 text-[9px] font-bold block uppercase tracking-wider">{item.label}</span>
              <h4 className="text-lg font-black text-slate-800 dark:text-white m-0 mt-2">{item.value}</h4>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-bold">
                <span className={item.pos ? 'text-emerald-500' : 'text-slate-500'}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-white">Top AI-consuming clinics</span>}>
          <div className="space-y-4">
            {topAiClinics.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                    <Tag color={c.plan === 'Enterprise' ? 'purple' : 'default'} className="m-0 border-none font-bold text-[8px] px-2 py-0.5 rounded-full uppercase">{c.plan}</Tag>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{c.pct}%</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.val}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subscription Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-sm text-slate-700 dark:text-white">Subscription Distribution</span>}>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subMonthlyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                 <XAxis dataKey="name" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={9} tickLine={false} axisLine={false} />
                 <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={9} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none' }} />
                 <Bar dataKey="value" fill="#8C4BFF" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-sm text-slate-700 dark:text-white">Subscription Distribution</span>}>
          <div className="space-y-6 mt-4">
            {[
              { tier: 'Enterprise ($499/year)', value: '310 clinics (52%)', pct: 52, color: 'bg-indigo-600' },
              { tier: 'Premium ($249/year)', value: '180 clinics (30%)', pct: 30, color: 'bg-purple-650' },
              { tier: 'Standard ($99/year)', value: '102 clinics (18%)', pct: 18, color: 'bg-sky-550' },
            ].map((t, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">{t.tier}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t.value}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Health Row */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">System Health</h2>
            <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold mt-0.5">Service status, uptime, and recent error logs</p>
          </div>
          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full select-none">
            Partial degradation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemHealthNodes.map((node, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-xs m-0">{node.name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{node.desc}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full select-none ${node.color}`}>
                  {node.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-5 text-[10px] font-bold text-slate-500 dark:text-slate-450">
                <span>{node.uptime} uptime &bull; 30d</span>
                <span className="text-slate-400 dark:text-slate-500">{node.latency}</span>
              </div>
            </div>
          ))}
        </div>

        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-white">Recent errors</span>}>
          <div className="space-y-3">
            {recentErrors.map((err, idx) => (
              <div key={idx} className="flex gap-3 items-center justify-between text-xs pb-3 border-b border-slate-50 dark:border-slate-800 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                    err.type === 'Error' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {err.type}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{err.title}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex-shrink-0">
                  <span>{err.source}</span>
                  <span>{err.time}</span>
                  <span className="text-slate-500 dark:text-slate-450 font-bold">{err.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Clinic Message Board & Tasks Communication */}
      <Card
        className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 mt-6"
        title={
          <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
            <MessageOutlined style={{ color: '#8C4BFF' }} /> Clinic Message Board & Task Communication
          </span>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Board Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '650px', minHeight: '450px' }}>
              {store.messageBoard && store.messageBoard.length > 0 ? (
                store.messageBoard.map((msg) => {
                  const isAdmin = msg.senderRole === 'Clinic Admin'
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAdmin
                          ? 'bg-slate-50/50 dark:bg-slate-955/20 border-slate-100 dark:border-slate-800'
                          : 'bg-[#8C4BFF]/5 dark:bg-[#8C4BFF]/10 border-[#8C4BFF]/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-850 dark:text-slate-200">
                            {msg.sender}
                          </span>
                          <Tag
                            color={isAdmin ? 'blue' : 'purple'}
                            className="border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-full m-0"
                          >
                            {msg.senderRole}
                          </Tag>
                          {msg.taskRef && (
                            <Tag
                              color="cyan"
                              className="border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-full m-0"
                            >
                              Task: {msg.taskRef}
                            </Tag>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-350 text-xs m-0 font-semibold leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No messages posted yet.
                </div>
              )}
            </div>
          </div>

          {/* Message Composer */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <h4 className="font-bold text-xs text-slate-700 dark:text-white uppercase tracking-wider mb-4">Post Announcement / Task</h4>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Task Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Miller Assessment"
                  value={taskRef}
                  onChange={(e) => setTaskRef(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#8C4BFF] transition-all h-9"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write details..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#8C4BFF] transition-all resize-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="w-full bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 text-white font-bold h-10 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm text-xs transition-colors"
              >
                <SendOutlined />
                <span>Post Message</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
