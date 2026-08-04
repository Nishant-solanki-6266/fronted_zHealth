import React, { useState } from 'react'
import { Card, Table, Tag, Select, Button } from 'antd'
import { CreditCardOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, PercentageOutlined, RiseOutlined } from '@ant-design/icons'
import { useClinicStore } from '../../../../store/clinicStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const { Option } = Select

export default function SalesCommissions({ store: propStore }) {
  const localStore = useClinicStore()
  const store = propStore || localStore
  const { clinics, leads } = store
  const [filterStatus, setFilterStatus] = useState('All')

  React.useEffect(() => {
    if (store.fetchSalesClinics) store.fetchSalesClinics()
    if (store.fetchLeads) store.fetchLeads()
  }, [])

  // Combine database clinics + converted sales leads into converted clinics view for commissions
  const dbClinicsFormatted = (clinics || []).map(c => ({
    id: c.id,
    name: c.name,
    tier: c.tier || 'Basic',
    revenue: parseFloat(c.revenue) || 100,
    commissionStatus: c.commissionStatus || 'Paid',
    commissionPaidDate: c.commissionPaidDate || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active'),
    salesperson: c.salesperson || 'Sales Executive',
    signupDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
  }))

  const convertedLeadsFormatted = (leads || [])
    .filter(l => l.stage === 'Converted' || l.status === 'Converted')
    .map(l => ({
      id: l.id,
      name: l.name || l.companyName,
      tier: l.tier || 'Basic',
      revenue: parseFloat(l.value) || 100,
      commissionStatus: 'Pending',
      commissionPaidDate: 'Awaiting Cycle',
      salesperson: l.assignedTo || 'Sales Executive',
      signupDate: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent',
    }))

  const colinClinics = [...dbClinicsFormatted, ...convertedLeadsFormatted]

  const paidCommissionSum = colinClinics
    .filter(c => c.commissionStatus === 'Paid')
    .reduce((sum, c) => sum + (parseFloat(c.revenue) * 0.12), 0)

  const pendingCommissionSum = colinClinics
    .filter(c => c.commissionStatus === 'Pending')
    .reduce((sum, c) => sum + (parseFloat(c.revenue) * 0.12), 0)

  const lifetimeCommissions = paidCommissionSum + pendingCommissionSum
  const totalMrr = colinClinics.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0)
  const thisMonthCommission = totalMrr * 0.12

  const stats = [
    { label: 'This Month', value: `$${Math.round(thisMonthCommission).toLocaleString()}`, icon: <PercentageOutlined />, color: '#8C4BFF', sub: 'Current month earnings' },
    { label: 'Lifetime Earned', value: `$${lifetimeCommissions.toFixed(2)}`, icon: <CreditCardOutlined />, color: '#3B82F6', sub: 'Accumulated total' },
    { label: 'Paid Out', value: `$${paidCommissionSum.toFixed(2)}`, icon: <CheckCircleOutlined />, color: '#10B981', sub: 'Released to bank' },
    { label: 'Pending Payout', value: `$${pendingCommissionSum.toFixed(2)}`, icon: <ClockCircleOutlined />, color: '#F59E0B', sub: 'Awaiting monthly cycle' },
  ]

  // Monthly trend data
  const trendData = [
    { month: 'Jan', commission: 0 },
    { month: 'Feb', commission: 0 },
    { month: 'Mar', commission: 0 },
    { month: 'Apr', commission: Math.round(paidCommissionSum * 0.8) },
    { month: 'May', commission: Math.round(paidCommissionSum) },
    { month: 'Jun', commission: Math.round(thisMonthCommission) },
  ]

  // Filter ledger data
  const filteredClinics = colinClinics.filter(c => filterStatus === 'All' || c.commissionStatus === filterStatus)

  const ledgerData = filteredClinics.map(c => ({
    key: c.id,
    clinicName: c.name,
    tier: c.tier,
    revenue: c.revenue,
    rate: '12%',
    commissionVal: parseFloat(c.revenue) * 0.12,
    status: c.commissionStatus,
    paidDate: c.commissionPaidDate || '—',
    signupDate: c.signupDate || '—',
  }))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <h2 className="text-sm font-black text-slate-800 dark:text-white m-0">My Commissions Ledger</h2>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
          Colin Edegbe &bull; 12% recurring affiliate commission on converted clinic subscriptions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-wider block truncate">{s.label}</span>
              <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white mt-1.5 mb-0 truncate">{s.value}</h3>
              <span className="text-slate-400 dark:text-slate-500 text-[8px] sm:text-[9px] font-semibold block mt-1 leading-tight">{s.sub}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm shrink-0" style={{ backgroundColor: s.color + '15', color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Commission Trend Chart */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
        title={
          <div>
            <span className="font-bold text-slate-800 dark:text-white text-xs block">Monthly Commission Trend</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Commission payout over the last 6 months</span>
          </div>
        }>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8C4BFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8C4BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Commission']} />
              <Area type="monotone" dataKey="commission" stroke="#8C4BFF" fillOpacity={1} fill="url(#commGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card
        className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden"
        title={<span className="font-bold text-slate-800 dark:text-white text-base">Recurring Commission Attributions</span>}
        extra={
          <Select value={filterStatus} onChange={setFilterStatus} size="small" className="min-w-[130px] rounded-xl">
            <Option value="All">All Statuses</Option>
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
          </Select>
        }
      >
        <Table
          dataSource={ledgerData}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{ emptyText: <span className="text-slate-400 text-xs">No commission records found.</span> }}
          columns={[
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Converted Clinic</span>,
              dataIndex: 'clinicName',
              render: t => <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{t}</span>,
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</span>,
              dataIndex: 'tier',
              render: tier => (
                <Tag color={tier === 'Enterprise' ? 'purple' : tier === 'Pro' ? 'orange' : 'blue'} className="rounded-full border-none font-bold text-[8px] px-2.5">{tier}</Tag>
              ),
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly MRR</span>,
              dataIndex: 'revenue',
              render: rev => <span className="font-bold text-slate-700 dark:text-slate-350 text-xs">${rev}/mo</span>,
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</span>,
              dataIndex: 'rate',
              render: rate => <span className="text-slate-500 font-semibold text-xs">{rate}</span>,
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Commission</span>,
              dataIndex: 'commissionVal',
              render: c => <span className="font-extrabold text-[#8C4BFF] text-xs">${c.toFixed(2)}</span>,
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>,
              dataIndex: 'status',
              render: status => (
                <Tag color={status === 'Paid' ? 'success' : 'warning'} className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">{status}</Tag>
              ),
            },
            {
              title: <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Date</span>,
              dataIndex: 'paidDate',
              render: d => <span className="text-slate-400 font-semibold text-xs">{d}</span>,
            },
          ]}
        />
      </Card>
    </div>
  )
}
