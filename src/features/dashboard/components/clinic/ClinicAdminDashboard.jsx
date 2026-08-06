import React, { useState, useRef, useEffect } from 'react'
import { getClinicDashboardStats } from '../../../calendar/api/clinicAdminApi'
import { Card, Button, Tag, Space, Checkbox, Select, DatePicker, Switch } from 'antd'
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  PercentageOutlined,
  UserAddOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MessageOutlined,
  SendOutlined,
  DownloadOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { useClinicStore } from '../../../../store/clinicStore'

const activityData = []
const revenueData = []
const DUMMY_ACTIVITY_DATA = [
  { name: 'Jan', value: 2200 }, { name: 'Feb', value: 3200 }, { name: 'Mar', value: 2800 },
  { name: 'Apr', value: 5800 }, { name: 'May', value: 5000 }, { name: 'Jun', value: 7800 },
]
const DUMMY_REVENUE_DATA = [
  { name: 'Jan', value: 8000 },  { name: 'Feb', value: 12000 }, { name: 'Mar', value: 10000 },
  { name: 'Apr', value: 22000 }, { name: 'May', value: 20000 }, { name: 'Jun', value: 28000 },
]

export default function ClinicAdminDashboard({ store: propStore }) {
  const localStore = useClinicStore()
  const store = propStore || localStore
  const darkMode = store.darkMode

  const [taskRef, setTaskRef] = useState('')
  const [messageText, setMessageText] = useState('')

  // ── DB Stats State ────────────────────────────────────────────────────────
  const [dbStats, setDbStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const res = await getClinicDashboardStats()
        if (res && res.success) {
          setDbStats(res.data)
        }
      } catch (err) {
        console.error('❌ Dashboard stats fetch error:', err)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

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
  
  // Persisted grid columns layout preference
  const [gridCols, setGridCols] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_dashboard_grid_cols')
      return saved ? Number(saved) : 7
    } catch {
      return 7
    }
  })
  
  // Persisted visible metrics list preference
  const [visibleStats, setVisibleStats] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_dashboard_visible_stats')
      return saved ? JSON.parse(saved) : {
        monthly_revenue: true,
        outstanding_invoices: true,
        active_clients: false,
        payment_rate: false,
        new_clients: true,
        appts_week: true,
        cancellation_rate: true,
        waitlist: false,
        avg_utilisation: true,
        uninvoiced: true,
      }
    } catch {
      return {
        monthly_revenue: true,
        outstanding_invoices: true,
        active_clients: false,
        payment_rate: false,
        new_clients: true,
        appts_week: true,
        cancellation_rate: true,
        waitlist: false,
        avg_utilisation: true,
        uninvoiced: true,
      }
    }
  })
  
  const [customiseOpen, setCustomiseOpen] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const customiseRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('clinic_dashboard_grid_cols', String(gridCols))
  }, [gridCols])

  useEffect(() => {
    localStorage.setItem('clinic_dashboard_visible_stats', JSON.stringify(visibleStats))
  }, [visibleStats])

  useEffect(() => {
    const handler = (e) => {
      if (customiseRef.current && !customiseRef.current.contains(e.target)) {
        setCustomiseOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Check connected states for integrations from clinic settings store
  const isStripeConnected = store.integrations.find(i => i.id === 'stripe')?.connected
  const isXeroConnected = store.integrations.find(i => i.id === 'xero')?.connected
  const isMyobConnected = store.integrations.find(i => i.id === 'myob')?.connected
  const isZoomConnected = store.integrations.find(i => i.id === 'zoom')?.connected
  const isGMeetConnected = store.integrations.find(i => i.id === 'gmeet')?.connected

  const hasFinancials = isStripeConnected || isXeroConnected || isMyobConnected
  const hasVideoConsults = isZoomConnected || isGMeetConnected

  // ── Real DB Stats (from API) with fallback ────────────────────────────────
  const dbRevenue        = dbStats?.monthlyRevenue ?? 0
  const dbOutstanding    = dbStats?.outstandingAmount ?? 0
  const dbWeekAppts      = dbStats?.weekAppointments ?? 0
  const dbCancelRate     = dbStats?.cancellationRate ?? 0
  const dbNewClients     = dbStats?.newClientsThisMonth ?? 0
  const dbUninvoiced     = dbStats?.uninvoicedCount ?? 0
  const dbActiveClients  = dbStats?.activePatients ?? 0
  const dbPaymentRate    = dbStats?.paymentRate ?? 0
  const dbWaitlist       = dbStats?.waitlistCount ?? 0
  const dbUtilisation    = dbStats?.avgUtilisation ?? 0

  // Chart data from DB (last 6 months), fallback to dummy if empty
  const chartActivityData = (dbStats?.activityByMonth?.length > 0) ? dbStats.activityByMonth : DUMMY_ACTIVITY_DATA
  const chartRevenueData  = (dbStats?.revenueByMonth?.length > 0)  ? dbStats.revenueByMonth  : DUMMY_REVENUE_DATA

  const statsList = [
    { 
      id: 'avg_utilisation', label: 'UTILISATION %', icon: null, color: '#10B981', 
      value: statsLoading ? '—' : `${dbUtilisation}%`, 
      change: dbStats ? 'Live from DB' : 'Loading...', pos: true, sub: 'Completed sessions / total' 
    },
    { 
      id: 'monthly_revenue', label: 'REVENUE $', icon: <DollarOutlined />, color: '#8C4BFF',
      value: statsLoading ? '—' : `$${dbRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: dbStats ? 'This month (DB)' : null, pos: true, sub: 'Monthly paid invoices'
    },
    { 
      id: 'appts_week', label: 'APPOINTMENTS', icon: <CalendarOutlined />, color: '#3B82F6',
      value: statsLoading ? '—' : String(dbWeekAppts),
      change: null, pos: null, sub: 'This week (scheduled)'
    },
    { 
      id: 'cancellation_rate', label: 'CANCELLATION', icon: <WarningOutlined />, color: '#EF4444',
      value: statsLoading ? '—' : `${dbCancelRate}%`,
      change: dbStats ? 'This month (DB)' : null, pos: false, sub: 'Cancelled this month'
    },
    { 
      id: 'new_clients', label: 'NEW CLIENTS', icon: <UserAddOutlined />, color: '#30D2BE',
      value: statsLoading ? '—' : String(dbNewClients),
      change: null, pos: null, sub: 'Onboarded this month'
    },
    { 
      id: 'outstanding_invoices', label: 'OUTSTANDING $', icon: <DollarOutlined />, color: '#F59E0B',
      value: statsLoading ? '—' : `$${dbOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: null, pos: null, sub: 'Pending payment'
    },
    { 
      id: 'uninvoiced', label: 'UNINVOICED', icon: <FileTextOutlined />, color: '#8C4BFF',
      value: statsLoading ? '—' : String(dbUninvoiced),
      change: null, pos: null, sub: 'Draft invoice needed'
    },
    { 
      id: 'active_clients', label: 'ACTIVE CLIENTS', icon: <TeamOutlined />, color: '#8C4BFF',
      value: statsLoading ? '—' : String(dbActiveClients),
      change: dbStats ? 'Live from DB' : null, pos: true, sub: 'Active patient status'
    },
    { 
      id: 'payment_rate', label: 'PAYMENT RATE', icon: <PercentageOutlined />, color: '#8C4BFF',
      value: statsLoading ? '—' : `${dbPaymentRate}%`,
      change: dbStats ? 'Paid / total invoices' : null, pos: dbPaymentRate >= 70, sub: 'From total invoices'
    },
    { 
      id: 'waitlist', label: 'WAITLIST CLIENTS', icon: <ClockCircleOutlined />, color: '#F59E0B',
      value: statsLoading ? '—' : String(dbWaitlist),
      change: null, pos: false, sub: 'Awaiting appointment'
    },
  ]

  const getGridClass = () => {
    if (gridCols === 4) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'
    if (gridCols === 5) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4'
    if (gridCols === 6) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4'
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white m-0">Performance Overview Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">Real-time analytics, utilization rates, and financial reports across all locations.</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Last updated: 17 Jun 2026, 8:26 AM</span>
          <div className="relative" ref={customiseRef}>
            <div className="flex gap-2">
              <button
                onClick={() => setCustomiseOpen(!customiseOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-[#8C4BFF] hover:text-[#8C4BFF] transition-colors"
              >
                <SlidersOutlined />
                <span>Customise</span>
              </button>
            </div>

          {customiseOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 z-50 w-[320px] p-5 shadow-xl space-y-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Dashboard Filters</span>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Date Range</label>
                    <div className="flex items-center gap-2">
                      <DatePicker className="h-8 w-full rounded-lg text-xs" placeholder="Start date" getPopupContainer={trigger => trigger.parentNode} />
                      <span className="text-slate-400">-</span>
                      <DatePicker className="h-8 w-full rounded-lg text-xs" placeholder="End date" getPopupContainer={trigger => trigger.parentNode} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Period</label>
                      <Select defaultValue="Monthly" className="w-full h-8 rounded-lg text-xs" getPopupContainer={trigger => trigger.parentNode}>
                        <Select.Option value="Daily">Daily</Select.Option>
                        <Select.Option value="Weekly">Weekly</Select.Option>
                        <Select.Option value="Monthly">Monthly</Select.Option>
                      </Select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
                      <Select defaultValue="All Locations" className="w-full h-8 rounded-lg text-xs" getPopupContainer={trigger => trigger.parentNode}>
                        <Select.Option value="All Locations">All Locations</Select.Option>
                        <Select.Option value="Main Clinic">Main Clinic</Select.Option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Practitioner</label>
                    <Select defaultValue="All Practitioners" className="w-full h-8 rounded-lg text-xs" getPopupContainer={trigger => trigger.parentNode}>
                      <Select.Option value="All Practitioners">All Practitioners</Select.Option>
                      <Select.Option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</Select.Option>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Compare (Prev. Period)</span>
                    <Switch 
                      checked={isComparing} 
                      onChange={(checked) => {
                        setIsComparing(checked)
                        if(checked) toast.success('Comparison mode enabled')
                        else toast.success('Comparison mode disabled')
                      }}
                      size="small"
                      style={{ backgroundColor: isComparing ? '#8C4BFF' : undefined }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Report Grid Layout</span>
                <div className="flex gap-1">
                  {[4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      onClick={() => setGridCols(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        gridCols === num ? 'border-[#8C4BFF] bg-[#F3EEFF] text-[#8C4BFF]' : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      {num} Cols
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Customise Specific Reports</span>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {statsList.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer py-0.5 hover:text-[#8C4BFF]">
                      <Checkbox
                        checked={visibleStats[s.id]}
                        onChange={() => setVisibleStats(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>


      {/* Stats Cards Grid */}
      <div className={getGridClass()}>
        {statsList.filter(s => visibleStats[s.id]).map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 gap-1">
              <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider leading-tight">{s.label}</span>
              {s.icon && (
                <div className="text-[10px] font-bold shrink-0" style={{ color: s.color }}>
                  {s.icon}
                </div>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 mb-1">{s.value}</h3>
            {s.change && (
              <div className={`flex items-center gap-1 text-[9px] font-semibold ${s.pos === null ? 'text-slate-400' : s.pos ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.pos === true && <ArrowUpOutlined style={{ fontSize: 8 }} />}
                {s.pos === false && <ArrowDownOutlined style={{ fontSize: 8 }} />}
                {s.change}
              </div>
            )}
            {s.sub && !s.change && (
              <div className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-tight">
                {s.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main charts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-100 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm" title={<span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">Monthly Clinical Appointments Trend <span className="text-[10px] text-emerald-500 font-semibold ml-2">Live DB</span></span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={false} contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="value" stroke="#30D2BE" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#30D2BE' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm" title={<span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">Financial Revenue Logs <span className="text-[10px] text-emerald-500 font-semibold ml-2">Live DB</span></span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={false} contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="value" fill="#8C4BFF" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
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
            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
              {store.messageBoard && store.messageBoard.length > 0 ? (
                store.messageBoard.map((msg) => {
                  const isAdmin = msg.senderRole === 'Clinic Admin'
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAdmin
                          ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800'
                          : 'bg-[#8C4BFF]/5 dark:bg-[#8C4BFF]/10 border-[#8C4BFF]/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
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
                        <span className="text-[10px] text-slate-450 dark:text-slate-550 font-semibold whitespace-nowrap">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs m-0 font-semibold leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none focus:border-[#8C4BFF] transition-all h-9"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your task instructions or communication message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none focus:border-[#8C4BFF] transition-all resize-none"
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
