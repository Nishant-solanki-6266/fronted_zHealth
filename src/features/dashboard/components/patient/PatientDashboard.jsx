import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Progress, Space } from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  MailOutlined,
  LineChartOutlined,
  UploadOutlined,
  RightOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import api from '../../../../api/axios'

export default function PatientDashboard({ store, navigate }) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    appointments: [],
    careTeam: [],
    treatmentPlans: [],
    funding: { accounts: [], claims: [] },
    formsDocs: { forms: [], documents: [] },
    exercises: [],
    invoices: []
  })
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchAllDashboardData = async () => {
      setLoading(true)
      setHasError(false)

      try {
        const [
          profileRes,
          appointmentsRes,
          careTeamRes,
          treatmentPlansRes,
          fundingRes,
          formsDocsRes,
          exercisesRes,
          invoicesRes
        ] = await Promise.all([
          api.get('/api/patient/profile').catch(err => ({ error: err })),
          api.get('/api/patient/appointments').catch(err => ({ error: err })),
          api.get('/api/patient/care-team').catch(err => ({ error: err })),
          api.get('/api/patient/treatment-plans').catch(err => ({ error: err })),
          api.get('/api/patient/funding-claims').catch(err => ({ error: err })),
          api.get('/api/patient/forms-documents').catch(err => ({ error: err })),
          api.get('/api/patient/exercises').catch(err => ({ error: err })),
          api.get('/api/patient/invoices').catch(err => ({ error: err }))
        ])

        if (!isMounted) return

        let networkOrServerError = false

        const getResData = (res) => {
          if (res?.error) {
            networkOrServerError = true
            return null
          }
          if (res?.data?.success) {
            return res.data.data
          }
          return null
        }

        const profile = getResData(profileRes)
        const appointments = getResData(appointmentsRes) || []
        const careTeam = getResData(careTeamRes) || []
        const treatmentPlans = getResData(treatmentPlansRes) || []
        const funding = getResData(fundingRes) || { accounts: [], claims: [] }
        const formsDocs = getResData(formsDocsRes) || { forms: [], documents: [] }
        const exercises = getResData(exercisesRes) || []
        const invoices = getResData(invoicesRes) || []

        if (networkOrServerError) {
          setHasError(true)
          toast.error('Could not load some live dashboard data from server')
        }

        setDashboardData({
          profile,
          appointments: Array.isArray(appointments) ? appointments : [],
          careTeam: Array.isArray(careTeam) ? careTeam : [],
          treatmentPlans: Array.isArray(treatmentPlans) ? treatmentPlans : [],
          funding: funding || { accounts: [], claims: [] },
          formsDocs: formsDocs || { forms: [], documents: [] },
          exercises: Array.isArray(exercises) ? exercises : [],
          invoices: Array.isArray(invoices) ? invoices : []
        })
      } catch (err) {
        if (isMounted) {
          setHasError(true)
          toast.error('Failed to load dashboard data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAllDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  const patientName = dashboardData.profile?.fullName || dashboardData.profile?.name || store?.userName || 'Patient'
  
  const upcomingAppts = dashboardData.appointments.filter(a => (a.status || 'Scheduled').toLowerCase() === 'scheduled')
  const nextAppt = upcomingAppts[0] || dashboardData.appointments[0]
  const nextApptTime = nextAppt ? `${nextAppt.date || ''} ${nextAppt.startTime || ''}`.trim() : 'No upcoming appointment'

  const primaryDocObj = dashboardData.careTeam[0]
  const primaryDoctor = nextAppt?.practitionerName || primaryDocObj?.name || 'No assigned practitioner'
  const primaryDoctorSpecialty = primaryDocObj?.specialty || 'Specialist'
  const primaryClinic = nextAppt?.branchName || primaryDocObj?.clinic || 'Melbourne Allied Health'

  const activePlans = dashboardData.treatmentPlans.filter(p => (p.status || 'Active').toLowerCase() === 'active')
  const activePlanAdherence = activePlans[0]?.overallProgress !== undefined ? activePlans[0].overallProgress : 0
  const plansSummaryText = activePlans.length > 0 ? activePlans.map(p => p.condition).filter(Boolean).join(' & ') : 'No active treatment plans'

  const doctorsCount = dashboardData.careTeam.length
  const activePlansCount = activePlans.length
  const scheduledCount = upcomingAppts.length

  const epcAccount = (dashboardData.funding.accounts || []).find(a => (a.type || '').toLowerCase().includes('epc') || (a.type || '').toLowerCase().includes('medicare'))
  const ndisAccount = (dashboardData.funding.accounts || []).find(a => (a.type || '').toLowerCase().includes('ndis'))

  const epcPercent = epcAccount?.percent !== undefined ? epcAccount.percent : 0
  const epcUsedText = epcAccount ? `${epcAccount.used || '0'} (${epcAccount.remaining || '0 remaining'})` : '0 of 0 used'

  const ndisPercent = ndisAccount?.percent !== undefined ? ndisAccount.percent : 0
  const ndisRemainingText = ndisAccount ? `${ndisAccount.remaining || '$0 remaining'} (${ndisPercent}% available)` : '$0 remaining'

  const pendingForms = (dashboardData.formsDocs.forms || []).filter(f => (f.status || '').toLowerCase() === 'pending')
  const pendingExercises = dashboardData.exercises.filter(e => !e.done)
  const completedExercises = dashboardData.exercises.filter(e => e.done)
  const totalExercises = dashboardData.exercises.length

  const totalOutstandingTasks = pendingForms.length + pendingExercises.length

  const pendingFormItem = pendingForms[0]
  const unpaidInvoice = dashboardData.invoices.find(i => (i.status || '').toLowerCase() === 'unpaid' || (i.status || '').toLowerCase() === 'overdue')
  const latestReport = (dashboardData.formsDocs.documents || [])[0]

  return (
    <div className="space-y-6">
      
      {/* ── Grid Row 1: Welcome & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Card */}
        <div 
          className="lg:col-span-2 rounded-2xl shadow-sm overflow-hidden text-white bg-gradient-to-br from-[#8C4BFF] via-[#9F66FF] to-[#30D2BE] dark:from-[#8C4BFF] dark:via-[#7B3DE8] dark:to-[#0E1B33] p-6"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start h-full gap-4">
            <div className="space-y-4">
              <div>
                <span className="block uppercase font-black tracking-wider" style={{ fontSize: '10px', color: '#e9d5ff' }}>Personal Health Portal</span>
                <div className="font-black m-0 mt-1" style={{ fontSize: '24px', lineHeight: '32px', color: '#ffffff' }}>Welcome Back, {patientName}</div>
                <div className="font-semibold mt-1" style={{ fontSize: '12px', color: '#e9d5ff' }}>Your healthcare journey is securely managed across clinics.</div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 font-semibold" style={{ fontSize: '12px' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-slate-900/20 flex items-center justify-center text-white">
                    <CalendarOutlined style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className="block uppercase font-bold" style={{ fontSize: '9px', color: '#e9d5ff' }}>Next Appointment</span>
                    <span style={{ color: '#ffffff' }}>{nextApptTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-slate-900/20 flex items-center justify-center text-white">
                    <UserOutlined style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className="block uppercase font-bold" style={{ fontSize: '9px', color: '#e9d5ff' }}>{primaryDoctorSpecialty}</span>
                    <span style={{ color: '#ffffff' }}>{primaryDoctor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-slate-900/20 flex items-center justify-center text-white">
                    <HomeOutlined style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className="block uppercase font-bold" style={{ fontSize: '9px', color: '#e9d5ff' }}>Primary Clinic</span>
                    <span style={{ color: '#ffffff' }}>{primaryClinic}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 dark:bg-slate-900/20 p-4 rounded-xl border border-white/15 backdrop-blur-sm md:w-56 space-y-2 flex-shrink-0 self-center">
              <span className="uppercase font-black block" style={{ fontSize: '9px', color: '#e9d5ff' }}>Active Plan Adherence</span>
              <div className="flex items-center gap-3">
                <Progress 
                  type="circle" 
                  percent={activePlanAdherence} 
                  size={50} 
                  strokeColor="#30D2BE" 
                  trailColor="rgba(255, 255, 255, 0.15)"
                  strokeWidth={10}
                  format={(p) => <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: '900' }}>{p}%</span>}
                />
                <div>
                  <span className="font-extrabold block" style={{ fontSize: '12px', color: '#ffffff' }}>{activePlanAdherence > 50 ? 'On Track' : 'Needs Review'}</span>
                  <span className="block mt-0.5 font-semibold" style={{ fontSize: '9px', color: '#e9d5ff' }}>Active Care Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <Card 
          className="lg:col-span-1 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Quick Action Buttons</span>}
        >
          <div className="grid grid-cols-1 gap-2.5">
            <Button 
              type="primary" 
              icon={<CalendarOutlined />} 
              onClick={() => navigate('/patient/calendar')}
              style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
              className="w-full rounded-xl font-bold text-xs h-10 text-white flex items-center justify-start px-4"
            >
              Book Appointment
            </Button>
            <Button 
              icon={<HeartOutlined />} 
              onClick={() => navigate('/patient/treatment-plans')}
              className="w-full rounded-xl font-bold text-xs h-10 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-850 flex items-center justify-start px-4"
            >
              Treatment Plan
            </Button>
            <Button 
              icon={<MailOutlined />} 
              onClick={() => navigate('/patient/messages')}
              className="w-full rounded-xl font-bold text-xs h-10 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-850 flex items-center justify-start px-4"
            >
              Message Practitioner
            </Button>
            <Button 
              icon={<DollarOutlined />} 
              onClick={() => navigate('/patient/payments')}
              className="w-full rounded-xl font-bold text-xs h-10 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-none flex items-center justify-start px-4"
            >
              Pay Invoice
            </Button>
            <Button 
              icon={<UploadOutlined />} 
              onClick={() => navigate('/patient/forms-documents')}
              className="w-full rounded-xl font-bold text-xs h-10 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-850 flex items-center justify-start px-4"
            >
              Upload Documents
            </Button>
          </div>
        </Card>

      </div>

      {/* ── Grid Row 2: Snapshot & Today's Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Health Snapshot */}
        <Card 
          className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" 
          title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">My Health Snapshot</span>}
          extra={<button onClick={() => navigate('/patient/care-team')} className="text-xs text-[#8C4BFF] font-bold border-none bg-transparent cursor-pointer">View Care Team →</button>}
        >
          <div className="space-y-4">
            
            {/* Snapshot Row 1: Active Practitioners */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Active Practitioners</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Specialists involved in your clinical care</span>
              </div>
              <Tag color="purple" className="m-0 font-bold border-none text-xs rounded-full px-3">{doctorsCount} Doctor{doctorsCount === 1 ? '' : 's'}</Tag>
            </div>

            {/* Snapshot Row 2: Current Treatment Plans */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Current Treatment Plans</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{plansSummaryText}</span>
              </div>
              <button 
                onClick={() => navigate('/patient/treatment-plans')}
                className="text-xs text-[#8C4BFF] font-bold border-none bg-transparent cursor-pointer hover:underline"
              >
                {activePlansCount} Active Plan{activePlansCount === 1 ? '' : 's'}
              </button>
            </div>

            {/* Snapshot Row 3: Upcoming Appointments */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Upcoming Appointments</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  {nextAppt ? `Next review: ${nextAppt.date || ''} with ${nextAppt.practitionerName || primaryDoctor}` : 'No upcoming appointments scheduled'}
                </span>
              </div>
              <Tag color="cyan" className="m-0 font-bold border-none text-xs rounded-full px-3">{scheduledCount} Scheduled</Tag>
            </div>

            {/* Snapshot Row 4: Sessions Remaining / NDIS Gauge */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2.5">
              <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Sessions & Funding Remaining</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">EPC Referral</span>
                  <Progress percent={epcPercent} strokeColor="#8C4BFF" size="small" showInfo={false} />
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">{epcUsedText}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">NDIS Budget</span>
                  <Progress percent={ndisPercent} strokeColor="#30D2BE" size="small" showInfo={false} />
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">{ndisRemainingText}</span>
                </div>
              </div>
            </div>

            {/* Snapshot Row 5: Outstanding Tasks */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Outstanding Tasks</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  {totalOutstandingTasks > 0 
                    ? `Pending ${pendingForms.length} intake form${pendingForms.length === 1 ? '' : 's'} & ${pendingExercises.length} exercise routine${pendingExercises.length === 1 ? '' : 's'}`
                    : 'All tasks and routines up to date'
                  }
                </span>
              </div>
              <Tag color={totalOutstandingTasks > 0 ? "warning" : "success"} className="m-0 font-bold border-none text-xs rounded-full px-3">{totalOutstandingTasks} Tasks Due</Tag>
            </div>

          </div>
        </Card>

        {/* Today's Actions */}
        <Card 
          className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" 
          title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Today's Actions</span>}
        >
          <div className="space-y-3">
            
            {/* Action 1: Exercises Due */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8C4BFF]/10 text-[#8C4BFF] flex items-center justify-center">
                  <HeartOutlined style={{ fontSize: 13 }} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Interventions To Complete</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{completedExercises.length} of {totalExercises} interventions completed</span>
                </div>
              </div>
              <Button 
                size="small"
                onClick={() => navigate('/patient/treatment-plans')}
                className="rounded-lg text-[10px] font-bold h-8 border-[#8C4BFF] text-[#8C4BFF] hover:bg-[#8C4BFF]/5"
              >
                Complete
              </Button>
            </div>

            {/* Action 2: Forms to Complete */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileTextOutlined style={{ fontSize: 13 }} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Forms to Complete</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {pendingFormItem ? `${pendingFormItem.name} is pending submission` : 'No pending forms to submit'}
                  </span>
                </div>
              </div>
              <Button 
                size="small"
                onClick={() => navigate('/patient/forms-documents')}
                className="rounded-lg text-[10px] font-bold h-8 border-amber-500 text-amber-600 hover:bg-amber-500/5"
              >
                Fill Form
              </Button>
            </div>

            {/* Action 3: Payments Due */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <DollarOutlined style={{ fontSize: 13 }} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Payments Outstanding</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {unpaidInvoice ? `${unpaidInvoice.id} ($${Number(unpaidInvoice.amount || 0).toFixed(2)}) is due` : 'No outstanding invoice payments'}
                  </span>
                </div>
              </div>
              <Button 
                size="small"
                onClick={() => navigate('/patient/payments')}
                className="rounded-lg text-[10px] font-bold h-8 border-rose-500 text-rose-500 hover:bg-rose-500/5"
              >
                Pay Now
              </Button>
            </div>

            {/* Action 4: Messages Awaiting Review */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <MailOutlined style={{ fontSize: 13 }} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Messages Awaiting Review</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {primaryDoctor ? `Direct messaging available with ${primaryDoctor}` : 'No unread practitioner messages'}
                  </span>
                </div>
              </div>
              <Button 
                size="small"
                onClick={() => navigate('/patient/messages')}
                className="rounded-lg text-[10px] font-bold h-8 border-indigo-500 text-indigo-600 hover:bg-indigo-500/5"
              >
                Read Message
              </Button>
            </div>

            {/* Action 5: Reports Available */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <LineChartOutlined style={{ fontSize: 13 }} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Reports Available</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {latestReport ? `${latestReport.name} (${latestReport.size || 'PDF'})` : 'No clinical reports available for download'}
                  </span>
                </div>
              </div>
              <Button 
                size="small"
                onClick={() => navigate('/patient/forms-documents')}
                className="rounded-lg text-[10px] font-bold h-8 border-emerald-500 text-emerald-600 hover:bg-emerald-500/5"
              >
                Download PDF
              </Button>
            </div>

          </div>
        </Card>

      </div>

    </div>
  )
}
