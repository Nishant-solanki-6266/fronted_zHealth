import React, { useState } from 'react'
import { Card, Tag, Select } from 'antd'
import { RiseOutlined, TeamOutlined, CheckCircleOutlined, DollarOutlined, PercentageOutlined, ApartmentOutlined, ArrowRightOutlined } from '@ant-design/icons'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

export default function SalesReports({ store: propStore }) {
  const localStore = useClinicStore()
  const store = propStore || localStore
  const { leads, clinics } = store
  const [dateRange, setDateRange] = useState('6m')

  const colinClinics = clinics.filter(c => c.salesperson === 'Colin Edegbe')

  // MRR & Commission monthly data
  const monthlyData = [
    { name: 'Jan', revenue: 0, commissions: 0, leads: 2, demos: 0 },
    { name: 'Feb', revenue: 0, commissions: 0, leads: 3, demos: 1 },
    { name: 'Mar', revenue: 0, commissions: 0, leads: 5, demos: 2 },
    { name: 'Apr', revenue: 247500, commissions: 29700, leads: 8, demos: 4 },
    { name: 'May', revenue: 0, commissions: 0, leads: 6, demos: 3 },
    { name: 'Jun', revenue: 116500, commissions: 13980, leads: 9, demos: 5 },
  ]

  // Add dynamic conversions
  const dynamicJuneRevenue = colinClinics
    .filter(c => c.signupDate?.includes('-06-'))
    .reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0)
  monthlyData[5].revenue += dynamicJuneRevenue
  monthlyData[5].commissions += dynamicJuneRevenue * 0.12

  // Lead funnel
  const stageData = [
    { name: 'New Lead', count: leads.filter(l => l.stage === 'New Lead').length },
    { name: 'Discovery', count: leads.filter(l => l.stage === 'Discovery Call').length },
    { name: 'Demo', count: leads.filter(l => l.stage === 'Demo Scheduled').length },
    { name: 'Proposal', count: leads.filter(l => l.stage === 'Proposal Sent').length },
    { name: 'Negotiation', count: leads.filter(l => l.stage === 'Negotiating').length },
    { name: 'Trial', count: leads.filter(l => l.stage === 'Trial Started').length },
    { name: 'Converted', count: leads.filter(l => l.stage === 'Converted').length },
  ]

  const totalLeads = leads.length
  const converted = leads.filter(l => l.stage === 'Converted').length
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0
  const demosCompleted = monthlyData.reduce((s, m) => s + m.demos, 0)
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalCommission = monthlyData.reduce((s, m) => s + m.commissions, 0)
  const activeClinics = colinClinics.filter(c => c.status === 'Active').length

  // Pie data — clinic tier breakdown
  const tierData = [
    { name: 'Basic', value: colinClinics.filter(c => c.tier === 'Basic').length, color: '#3B82F6' },
    { name: 'Pro', value: colinClinics.filter(c => c.tier === 'Pro').length, color: '#F59E0B' },
    { name: 'Enterprise', value: colinClinics.filter(c => c.tier === 'Enterprise').length, color: '#8C4BFF' },
  ].filter(d => d.value > 0)

  const summaryStats = [
    { label: 'Leads Generated', value: totalLeads, color: '#3B82F6', icon: <TeamOutlined /> },
    { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#10B981', icon: <RiseOutlined /> },
    { label: 'Demos Completed', value: demosCompleted, color: '#F59E0B', icon: <CheckCircleOutlined /> },
    { label: 'Revenue Generated', value: `$${totalRevenue.toLocaleString()}`, color: '#8C4BFF', icon: <DollarOutlined /> },
    { label: 'Commission Earned', value: `$${Math.round(totalCommission).toLocaleString()}`, color: '#EC4899', icon: <PercentageOutlined /> },
    { label: 'Clinics Onboarded', value: activeClinics, color: '#06B6D4', icon: <ApartmentOutlined /> },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-white m-0">Performance Analytics Reports</h2>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
            Visual breakdown of leads, conversions, revenue, and commission earnings.
          </p>
        </div>
        <Select value={dateRange} onChange={setDateRange} className="rounded-xl min-w-[130px]">
          <Option value="3m">Last 3 Months</Option>
          <Option value="6m">Last 6 Months</Option>
          <Option value="1y">Last 12 Months</Option>
        </Select>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryStats.map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-wider">{s.label}</span>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: s.color + '18', color: s.color }}>{s.icon}</div>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white m-0">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MRR Chart */}
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-xs block">Monthly Recurring Revenue (MRR)</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Value of signed clinic subscriptions</span>
            </div>
          }>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C4BFF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8C4BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'MRR']} />
                <Area type="monotone" dataKey="revenue" stroke="#8C4BFF" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Commission Chart */}
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-xs block">Commission Earned</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Monthly commission payouts at 12% rate</span>
            </div>
          }>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Commission']} />
                <Area type="monotone" dataKey="commissions" stroke="#EC4899" fillOpacity={1} fill="url(#colorComm)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Lead Funnel */}
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-xs block">Lead Funnel Distribution</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Prospects in each pipeline stage</span>
            </div>
          }>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Deals']} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leads Generated per Month */}
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-xs block">Leads Generated</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">New leads acquired per month</span>
            </div>
          }>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Leads']} />
                <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tier Breakdown (only if clinics exist) */}
      {tierData.length > 0 && (
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={<span className="font-bold text-slate-800 dark:text-white text-xs">Clinic Subscription Tier Breakdown</span>}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value + ' clinics', name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {tierData.map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{d.name} Plan</span>
                  </div>
                  <span className="font-extrabold text-sm" style={{ color: d.color }}>{d.value} clinic{d.value !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
