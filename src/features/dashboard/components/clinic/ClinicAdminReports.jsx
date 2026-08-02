import React, { useState, useMemo, useRef, useEffect } from 'react'
import { DatePicker, Select, Switch, Card, Button } from 'antd'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  ArrowUpOutlined,
  DollarOutlined,
  CalendarOutlined,
  PercentageOutlined,
  UserAddOutlined,
  WarningOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SlidersOutlined
} from '@ant-design/icons'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import dayjs from 'dayjs'
import { useClinicStore } from '../../../../store/clinicStore'
import { toast } from 'react-hot-toast'

const { RangePicker } = DatePicker
const { Option } = Select

// Mock Data
const MOCK_MONTHLY_REVENUE = [
  { name: 'Jan', current: 12000, previous: 10500 },
  { name: 'Feb', current: 14000, previous: 11000 },
  { name: 'Mar', current: 13500, previous: 12500 },
  { name: 'Apr', current: 15800, previous: 13000 },
  { name: 'May', current: 14250, previous: 12800 },
  { name: 'Jun', current: 16900, previous: 14200 },
]

const MOCK_PRACTITIONER_DATA = [
  { name: 'Dr. Sarah Jenkins', Appointments: 84, Revenue: 15120 },
  { name: 'Dr. James Carter', Appointments: 62, Revenue: 11160 },
  { name: 'Dr. Emily Smith', Appointments: 38, Revenue: 6080 },
]

const MOCK_CLIENT_GROWTH = [
  { name: 'Jan', clients: 45 },
  { name: 'Feb', clients: 60 },
  { name: 'Mar', clients: 82 },
  { name: 'Apr', clients: 110 },
  { name: 'May', clients: 135 },
  { name: 'Jun', clients: 150 },
]

const MOCK_PAYMENT_STATUS = [
  { name: 'Paid', value: 14250, color: '#30D2BE' },
  { name: 'Outstanding', value: 3210, color: '#F59E0B' },
  { name: 'Draft / Uninvoiced', value: 1200, color: '#8C4BFF' },
]

// Specific Reports Map
const SPECIFIC_REPORTS = {
  Overview: [
    { value: 'all_summary', label: 'All Activity Summary' },
    { value: 'exec_dashboard', label: 'Executive Dashboard' }
  ],
  Financial: [
    { value: 'invoices_ledger', label: 'Invoices Ledger' },
    { value: 'rev_by_prac', label: 'Revenue by Practitioner' },
    { value: 'outstanding_bal', label: 'Outstanding Balances' }
  ],
  Clients: [
    { value: 'client_reg', label: 'Client Registrations' },
    { value: 'waitlist_analysis', label: 'Waitlist Analysis' },
    { value: 'client_demo', label: 'Client Demographics' }
  ],
  'Appointments & Utilisation': [
    { value: 'appt_counts', label: 'Appointment Counts' },
    { value: 'cancel_rates', label: 'Cancellation Rates' },
    { value: 'prac_util', label: 'Practitioner Utilisation' }
  ]
}

// Data generator for report tables
const getReportTableData = (reportType, filters, scale) => {
  const { practitioner, location } = filters
  let data = null

  switch (reportType) {
    case 'all_summary':
      data = {
        headers: ['Month', 'Appointments Completed', 'New Clients', 'Total Revenue ($)', 'Outstanding Balance ($)'],
        rows: [
          { month: 'January', appts: 150, clients: 45, rev: 12000, out: 1500 },
          { month: 'February', appts: 162, clients: 60, rev: 14000, out: 1200 },
          { month: 'March', appts: 175, clients: 82, rev: 13500, out: 2100 },
          { month: 'April', appts: 190, clients: 110, rev: 15800, out: 1800 },
          { month: 'May', appts: 182, clients: 135, rev: 14250, out: 3210 },
          { month: 'June', appts: 195, clients: 150, rev: 16900, out: 2400 }
        ]
      }
      break;
    case 'exec_dashboard':
      data = {
        headers: ['Metric Name', 'Current Value', 'Target Value', 'Status', 'Performance vs Target'],
        rows: [
          { metric: 'Monthly Revenue', current: 16900, target: 15000, status: 'Exceeded', perf: '+12.6%' },
          { metric: 'New Client Registrations', current: 150, target: 120, status: 'Exceeded', perf: '+25.0%' },
          { metric: 'Practitioner Utilisation', current: 78, target: 80, status: 'On Track', perf: '-2.0%' },
          { metric: 'Appointment Cancellation Rate', current: 5.8, target: 5.0, status: 'Action Needed', perf: '+0.8%' }
        ]
      }
      break;
    case 'invoices_ledger':
      data = {
        headers: ['Invoice #', 'Invoice Date', 'Client Name', 'Practitioner', 'Amount ($)', 'Status'],
        rows: [
          { inv: 'INV-001', date: '2026-06-01', client: 'John Miller', prac: 'Dr. Sarah Jenkins', amount: 180, status: 'Paid' },
          { inv: 'INV-002', date: '2026-06-02', client: 'Alice Brown', prac: 'Dr. James Carter', amount: 220, status: 'Paid' },
          { inv: 'INV-003', date: '2026-06-05', client: 'Bob Wilson', prac: 'Dr. Emily Smith', amount: 160, status: 'Outstanding' },
          { inv: 'INV-004', date: '2026-06-08', client: 'Clara Oswald', prac: 'Dr. Sarah Jenkins', amount: 180, status: 'Draft' },
          { inv: 'INV-005', date: '2026-06-12', client: 'David Tennant', prac: 'Dr. James Carter', amount: 220, status: 'Paid' }
        ]
      }
      break;
    case 'rev_by_prac':
      data = {
        headers: ['Practitioner', 'Specialty', 'Completed Appointments', 'Total Revenue ($)', 'Average Fee ($)'],
        rows: [
          { name: 'Dr. Sarah Jenkins', specialty: 'Physiotherapist', appts: 84, revenue: 15120, avg: 180 },
          { name: 'Dr. James Carter', specialty: 'Occupational Therapist', appts: 62, revenue: 11160, avg: 180 },
          { name: 'Dr. Emily Smith', specialty: 'Speech Pathologist', appts: 38, revenue: 6080, avg: 160 }
        ]
      }
      break;
    case 'outstanding_bal':
      data = {
        headers: ['Client Name', 'Contact Number', 'Last Visit', 'Overdue Days', 'Balance Due ($)'],
        rows: [
          { name: 'Bob Wilson', contact: '+61 491 570 156', last: '2026-06-05', overdue: 19, balance: 160 },
          { name: 'Frank Castle', contact: '+61 491 570 231', last: '2026-05-20', overdue: 35, balance: 320 },
          { name: 'Pepper Potts', contact: '+61 491 570 882', last: '2026-06-10', overdue: 14, balance: 180 }
        ]
      }
      break;
    case 'client_reg':
      data = {
        headers: ['Date Registered', 'Client Name', 'Email Address', 'Phone Number', 'Status'],
        rows: [
          { date: '2026-06-01', name: 'John Miller', email: 'john.miller@gmail.com', phone: '+61 412 100 001', status: 'Active' },
          { date: '2026-06-03', name: 'Clara Oswald', email: 'clara.o@yahoo.com', phone: '+61 422 182 990', status: 'Active' },
          { date: '2026-06-05', name: 'Bruce Banner', email: 'hulk@avengers.com', phone: '+61 433 998 122', status: 'Active' },
          { date: '2026-06-08', name: 'Tony Stark', email: 'ironman@stark.com', phone: '+61 444 881 229', status: 'Inactive' }
        ]
      }
      break;
    case 'waitlist_analysis':
      data = {
        headers: ['Client Name', 'Specialty Requested', 'Priority Level', 'Date Added', 'Days on Waitlist'],
        rows: [
          { name: 'Diana Prince', specialty: 'Physiotherapist', priority: 'High', date: '2026-06-12', wait: 12 },
          { name: 'Clark Kent', specialty: 'Speech Pathologist', priority: 'Medium', date: '2026-06-15', wait: 9 },
          { name: 'Bruce Wayne', specialty: 'Occupational Therapist', priority: 'Low', date: '2026-06-18', wait: 6 }
        ]
      }
      break;
    case 'client_demo':
      data = {
        headers: ['Age Group', 'Total Clients Count', 'Percentage (%)', 'Primary Clinic Location'],
        rows: [
          { group: '0-18 Years', count: 65, pct: '43.3%', loc: 'Melbourne' },
          { group: '19-50 Years', count: 48, pct: '32.0%', loc: 'Sydney' },
          { group: '51+ Years', count: 37, pct: '24.7%', loc: 'Brisbane' }
        ]
      }
      break;
    case 'appt_counts':
      data = {
        headers: ['Week Starting', 'Completed Appointments', 'Cancelled Appointments', 'No Shows Count', 'Total Scheduled'],
        rows: [
          { week: '2026-06-01', completed: 42, cancelled: 3, noshow: 1, total: 46 },
          { week: '2026-06-08', completed: 48, cancelled: 2, noshow: 0, total: 50 },
          { week: '2026-06-15', completed: 45, cancelled: 5, noshow: 2, total: 52 },
          { week: '2026-06-22', completed: 49, cancelled: 1, noshow: 1, total: 51 }
        ]
      }
      break;
    case 'cancel_rates':
      data = {
        headers: ['Month Name', 'Completed Appointments', 'Cancelled Appointments', 'Cancellation Rate (%)'],
        rows: [
          { month: 'January', completed: 142, cancelled: 10, rate: '6.5%' },
          { month: 'February', completed: 155, cancelled: 8, rate: '4.9%' },
          { month: 'March', completed: 160, cancelled: 12, rate: '6.9%' },
          { month: 'April', completed: 172, cancelled: 15, rate: '8.0%' },
          { month: 'May', completed: 184, cancelled: 11, rate: '5.6%' },
          { month: 'June', completed: 195, cancelled: 12, rate: '5.8%' }
        ]
      }
      break;
    case 'prac_util':
      data = {
        headers: ['Practitioner Name', 'Hours Scheduled', 'Available Hours', 'Utilisation Rate (%)'],
        rows: [
          { name: 'Dr. Sarah Jenkins', scheduled: 34, available: 40, rate: '85.0%' },
          { name: 'Dr. James Carter', scheduled: 29.6, available: 40, rate: '74.0%' },
          { name: 'Dr. Emily Smith', scheduled: 27.2, available: 40, rate: '68.0%' }
        ]
      }
      break;
    default:
      return null;
  }

  // Filter & Scale the data dynamically based on selections
  if (data && data.rows) {
    if (practitioner !== 'All Practitioners' && practitioner !== 'All') {
      // Keep only rows related to the practitioner if applicable
      data.rows = data.rows.filter(r => !r.prac && !r.name || (r.prac && r.prac.includes(practitioner)) || (r.name && r.name.includes(practitioner)))
    }
    
    // Scale numeric values for generic tables
    data.rows = data.rows.map(r => {
      const newRow = { ...r }
      if (typeof newRow.appts === 'number') newRow.appts = Math.max(1, Math.round(newRow.appts * scale))
      if (typeof newRow.clients === 'number') newRow.clients = Math.max(1, Math.round(newRow.clients * scale))
      if (typeof newRow.rev === 'number') newRow.rev = Math.round(newRow.rev * scale)
      if (typeof newRow.out === 'number') newRow.out = Math.round(newRow.out * scale)
      if (typeof newRow.amount === 'number') newRow.amount = Math.round(newRow.amount * scale)
      if (typeof newRow.revenue === 'number') newRow.revenue = Math.round(newRow.revenue * scale)
      if (typeof newRow.completed === 'number') newRow.completed = Math.max(1, Math.round(newRow.completed * scale))
      if (typeof newRow.total === 'number') newRow.total = Math.max(1, Math.round(newRow.total * scale))
      
      // Formatting
      if (reportType === 'exec_dashboard') {
        if (newRow.metric.includes('Revenue')) newRow.current = `$${Math.round(newRow.current * scale).toLocaleString()}`
        else if (newRow.metric.includes('Utilisation') || newRow.metric.includes('Rate')) newRow.current = `${newRow.current}%`
        else newRow.current = Math.round(newRow.current * scale)
      }
      return newRow
    })
  }

  return data;
}

export default function ClinicAdminReports() {
  const store = useClinicStore()
  const darkMode = store.darkMode

  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()])
  const [period, setPeriod] = useState('Monthly')
  const [practitioner, setPractitioner] = useState('All Practitioners')
  const [location, setLocation] = useState('All Locations')
  const [compare, setCompare] = useState(false)
  const [reportCategory, setReportCategory] = useState('Overview')
  const [specificReport, setSpecificReport] = useState('all_summary')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeDataTable, setIncludeDataTable] = useState(true)

  // Sync category transitions
  const handleCategoryChange = (val) => {
    setReportCategory(val)
    const options = SPECIFIC_REPORTS[val] || []
    if (options.length > 0) {
      setSpecificReport(options[0].value)
    }
  }

  // Handle specific report change and scroll to table
  const handleReportTypeChange = (val) => {
    setSpecificReport(val)
    // Scroll down to the Detailed Reports table so the user sees the update
    setTimeout(() => {
      document.getElementById('detailed-reports-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Compute scale based on active filters
  const filterScale = useMemo(() => {
    let scale = 1
    if (practitioner === 'Sarah Jenkins') scale *= 0.45
    else if (practitioner === 'James Carter') scale *= 0.34
    else if (practitioner === 'Emily Smith') scale *= 0.21

    if (location === 'Melbourne') scale *= 0.5
    else if (location === 'Sydney') scale *= 0.35
    else if (location === 'Brisbane') scale *= 0.15

    const daysDiff = dateRange && dateRange[0] && dateRange[1] ? dateRange[1].diff(dateRange[0], 'day') : 30
    const timeScale = Math.min(Math.max(daysDiff / 30, 0.1), 5)
    scale *= timeScale

    return scale
  }, [practitioner, location, dateRange])

  // Exports Handlers
  const handleDownloadPDF = () => {
    const tableData = getReportTableData(specificReport, { practitioner, location }, filterScale)
    if (!tableData || tableData.rows.length === 0) {
      toast.error('No data available to generate PDF.')
      return
    }

    const doc = new jsPDF()
    const reportTitle = SPECIFIC_REPORTS[reportCategory]?.find(r => r.value === specificReport)?.label || 'Report'
    
    // Add title
    doc.setFontSize(18)
    doc.text(`Health Clinic - ${reportTitle}`, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, hh:mm A')}`, 14, 30)

    // Generate table
    const tableColumn = tableData.headers
    const tableRows = tableData.rows.map(row => Object.values(row))

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [140, 75, 255] }
    })

    doc.save(`${specificReport}_report_${dayjs().format('YYYY-MM-DD')}.pdf`)
    toast.success('PDF downloaded successfully!')
  }

  const handleExportCSV = () => {
    const tableData = getReportTableData(specificReport, { practitioner, location }, filterScale)
    if (!tableData) {
      toast.error('No data available to export.')
      return
    }

    const { headers, rows } = tableData
    
    // Format as CSV content
    const csvRows = []
    // 1. Add headers
    csvRows.push(headers.join(','))
    // 2. Add data rows
    rows.forEach(row => {
      const values = Object.values(row).map(value => {
        const escaped = ('' + value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    })
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${specificReport}_report_${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Successfully exported report data as CSV!')
  }

  // Dynamically compute card metrics based on selected filters (mocked logic)
  const metrics = useMemo(() => {
    let baseRevenue = 14250
    let baseAppts = 184
    let baseNewClients = 15
    let baseOutstanding = 3210
    let baseUtilisation = 78
    let baseCancellation = 6.2
    let baseUninvoiced = 8

    return {
      revenue: Math.round(baseRevenue * filterScale),
      appointments: Math.max(1, Math.round(baseAppts * filterScale)),
      newClients: Math.max(1, Math.round(baseNewClients * filterScale)),
      outstanding: Math.round(baseOutstanding * filterScale),
      utilisation: baseUtilisation, // Usually utilisation % doesn't just multiply
      cancellation: baseCancellation,
      uninvoiced: Math.max(1, Math.round(baseUninvoiced * filterScale))
    }
  }, [filterScale])

  // Dynamically compute charts data based on filters
  const chartRevenueData = useMemo(() => {
    return MOCK_MONTHLY_REVENUE.map(d => ({
      name: d.name,
      current: Math.round(d.current * filterScale),
      previous: Math.round(d.previous * filterScale)
    }))
  }, [filterScale])

  const chartPractitionerData = useMemo(() => {
    return MOCK_PRACTITIONER_DATA
      .filter(d => practitioner === 'All Practitioners' || practitioner === 'All' || d.name.includes(practitioner))
      .map(d => ({
        name: d.name,
        Appointments: Math.max(1, Math.round(d.Appointments * filterScale)),
        Revenue: Math.round(d.Revenue * filterScale)
      }))
  }, [practitioner, filterScale])

  // Filters cards depending on reportCategory
  const statsList = [
    { id: 'utilisation', label: 'Utilisation', icon: '%', value: `${metrics.utilisation}%`, sub: '+2.4% vs last period', cat: 'Appointments & Utilisation' },
    { id: 'revenue', label: 'Revenue', icon: <DollarOutlined className="border border-slate-600 rounded-full p-0.5" />, value: `$${metrics.revenue.toLocaleString()}`, sub: '+5.8% vs last period', cat: 'Financial' },
    { id: 'appointments', label: 'Appointments', icon: <CalendarOutlined />, value: String(metrics.appointments), sub: 'Scheduled visits', cat: 'Appointments & Utilisation' },
    { id: 'cancellation', label: 'Cancellation', icon: <WarningOutlined />, value: `${metrics.cancellation}%`, sub: '-0.4% improvement', cat: 'Appointments & Utilisation' },
    { id: 'newClients', label: 'New Clients', icon: <UserAddOutlined />, value: String(metrics.newClients), sub: 'Onboarded this period', cat: 'Clients' },
    { id: 'outstanding', label: 'Outstanding', icon: <DollarOutlined className="border border-slate-600 rounded-full p-0.5" />, value: `$${metrics.outstanding.toLocaleString()}`, sub: 'Pending payment', cat: 'Financial' },
    { id: 'uninvoiced', label: 'Uninvoiced', icon: <FileTextOutlined />, value: String(metrics.uninvoiced), sub: 'Draft invoice needed', cat: 'Financial' }
  ]

  const visibleStats = statsList

  return (
    <div className="w-full min-h-full p-8 transition-colors duration-300" style={{ backgroundColor: darkMode ? '#0B1120' : '#F8FAFC' }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 no-print mb-6">
        <div>
          <h1 className="text-3xl font-extrabold m-0 tracking-tight" style={{ color: darkMode ? '#FFFFFF' : '#0E1B33' }}>
            Performance Overview Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: darkMode ? '#94A3B8' : '#475569' }}>
            Real-time analytics, utilization rates, and financial reports across all locations.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-xs font-semibold text-slate-400">
            Last updated: 17 Jun 2026, 8:34 AM
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <DownloadOutlined />
              <span>CSV</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold bg-[#8C4BFF] hover:bg-[#7b3fe0] text-white border-none cursor-pointer transition-colors"
            >
              <FileTextOutlined />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Filters Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm no-print">
        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-4">Dashboard Filters</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1.5 lg:col-span-1 xl:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Date Range</label>
            <div className="flex items-center gap-2">
              <DatePicker 
                className="h-9 w-full rounded-lg text-xs text-slate-800 dark:text-slate-200" 
                placeholder="Start date" 
                value={dateRange[0]}
                onChange={val => setDateRange([val, dateRange[1]])}
              />
              <span className="text-slate-400">-</span>
              <DatePicker 
                className="h-9 w-full rounded-lg text-xs text-slate-800 dark:text-slate-200" 
                placeholder="End date" 
                value={dateRange[1]}
                onChange={val => setDateRange([dateRange[0], val])}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Period</label>
            <Select value={period} onChange={setPeriod} className="w-full h-9 rounded-lg text-xs [&_.ant-select-selection-item]:!text-slate-800 dark:[&_.ant-select-selection-item]:!text-slate-200">
              <Option value="Daily">Daily</Option>
              <Option value="Weekly">Weekly</Option>
              <Option value="Monthly">Monthly</Option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Practitioner</label>
            <Select value={practitioner} onChange={setPractitioner} className="w-full h-9 rounded-lg text-xs [&_.ant-select-selection-item]:!text-slate-800 dark:[&_.ant-select-selection-item]:!text-slate-200">
              <Option value="All Practitioners">All Practitioners</Option>
              <Option value="Sarah Jenkins">Sarah Jenkins</Option>
              <Option value="James Carter">James Carter</Option>
              <Option value="Emily Smith">Emily Smith</Option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Clinic Location</label>
            <Select value={location} onChange={setLocation} className="w-full h-9 rounded-lg text-xs [&_.ant-select-selection-item]:!text-slate-800 dark:[&_.ant-select-selection-item]:!text-slate-200">
              <Option value="All Locations">All Locations</Option>
              <Option value="Main Clinic">Main Clinic</Option>
              <Option value="Melbourne">Melbourne</Option>
              <Option value="Sydney">Sydney</Option>
              <Option value="Brisbane">Brisbane</Option>
            </Select>
          </div>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg h-9">
            <span className="text-[10px] font-bold text-slate-500 uppercase mr-2">Compare (Prev. Period)</span>
            <Switch 
              checked={compare}
              onChange={setCompare}
              size="small" 
              style={{ backgroundColor: compare ? '#8C4BFF' : undefined }} 
            />
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Report Category</label>
            <Select value={reportCategory} onChange={handleCategoryChange} className="w-full h-9 rounded-lg text-xs [&_.ant-select-selection-item]:!text-slate-800 dark:[&_.ant-select-selection-item]:!text-slate-200">
              {Object.keys(SPECIFIC_REPORTS).map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Report Type</label>
            <Select value={specificReport} onChange={handleReportTypeChange} className="w-full h-9 rounded-lg text-xs [&_.ant-select-selection-item]:!text-slate-800 dark:[&_.ant-select-selection-item]:!text-slate-200">
              {(SPECIFIC_REPORTS[reportCategory] || []).map(r => (
                <Option key={r.value} value={r.value}>{r.label}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>


      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {visibleStats.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[16px] p-4 shadow-sm flex flex-col justify-between h-[104px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
              <div className="text-slate-600 dark:text-slate-400 text-[14px]">
                {s.icon}
              </div>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              {s.id === 'utilisation' || s.id === 'revenue' ? (
                <>
                  <ArrowUpOutlined style={{ fontSize: '8px' }} /> {s.sub}
                </>
              ) : s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Recharts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Revenue Graph */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[20px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white m-0">Revenue Trend</h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total period revenue</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '' : val} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="current" stroke="#A855F7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Practitioner Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[20px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white m-0">Practitioner Performance</h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Revenue & appointment counts</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPractitionerData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '' : val} />
                <Tooltip cursor={{ fill: darkMode ? '#1E293B' : '#F3F4F6' }} contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Revenue" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div id="detailed-reports-section" className="mt-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white m-0">Detailed Reports ({SPECIFIC_REPORTS[reportCategory]?.find(r => r.value === specificReport)?.label || 'Report'})</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-0">View the detailed breakdown for the selected report type.</p>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {getReportTableData(specificReport, { practitioner, location }, filterScale)?.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getReportTableData(specificReport, { practitioner, location }, filterScale)?.rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {Object.values(r).map((val, j) => (
                    <td key={j} className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {j === Object.keys(r).length - 1 && (val === 'Paid' || val === 'Active' || val === 'On Track' || val === 'Exceeded') ? (
                        <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                          {val}
                        </span>
                      ) : j === Object.keys(r).length - 1 && (val === 'Outstanding' || val === 'Action Needed' || val === 'Inactive') ? (
                        <span className="bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                          {val}
                        </span>
                      ) : j === Object.keys(r).length - 1 && val === 'Draft' ? (
                        <span className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                          {val}
                        </span>
                      ) : (
                        val
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!getReportTableData(specificReport, { practitioner, location }, filterScale) || getReportTableData(specificReport, { practitioner, location }, filterScale).rows.length === 0) && (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No data available for the selected period.
            </div>
          )}
        </div>
      </div>

      {/* Global overrides for this specific layout */}
      <style jsx global>{`
        .custom-dark-select .ant-select-selector {
          background-color: ${darkMode ? '#1E293B' : '#EEF2F6'} !important;
          border: none !important;
          color: ${darkMode ? '#E2E8F0' : '#334155'} !important;
          border-radius: 12px !important;
          height: 36px !important;
          align-items: center !important;
          font-size: 13px !important;
        }
        .custom-dark-dropdown {
          background-color: ${darkMode ? '#1E293B' : '#FFFFFF'} !important;
          border: 1px solid ${darkMode ? '#334155' : '#E2E8F0'} !important;
        }
        .custom-dark-dropdown .ant-select-item {
          color: ${darkMode ? '#E2E8F0' : '#334155'} !important;
        }
        .custom-dark-dropdown .ant-select-item-option-active {
          background-color: ${darkMode ? '#334155' : '#F1F5F9'} !important;
        }
      `}</style>
    </div>
  )
}


