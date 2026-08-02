import React from 'react'
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

export default function PatientDashboard({ store, navigate }) {
  const patientName = 'John Miller'
  const primaryDoctor = 'Dr. Sarah Jenkins'
  const primaryDoctorSpecialty = 'Physiotherapist'
  const primaryClinic = 'Melbourne Allied Health'
  const nextApptTime = 'Friday 10:00 AM'

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
                  percent={75} 
                  size={50} 
                  strokeColor="#30D2BE" 
                  trailColor="rgba(255, 255, 255, 0.15)"
                  strokeWidth={10}
                  format={(p) => <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: '900' }}>{p}%</span>}
                />
                <div>
                  <span className="font-extrabold block" style={{ fontSize: '12px', color: '#ffffff' }}>On Track</span>
                  <span className="block mt-0.5 font-semibold" style={{ fontSize: '9px', color: '#e9d5ff' }}>14-Day Streak!</span>
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
              <Tag color="purple" className="m-0 font-bold border-none text-xs rounded-full px-3">2 Doctors</Tag>
            </div>

            {/* Snapshot Row 2: Current Treatment Plans */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Current Treatment Plans</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Shoulder Mobility & Lumbar Core Stability</span>
              </div>
              <button 
                onClick={() => navigate('/patient/treatment-plans')}
                className="text-xs text-[#8C4BFF] font-bold border-none bg-transparent cursor-pointer hover:underline"
              >
                2 Active Plans
              </button>
            </div>

            {/* Snapshot Row 3: Upcoming Appointments */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Upcoming Appointments</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Next review: June 19 with Dr. Sarah Jenkins</span>
              </div>
              <Tag color="cyan" className="m-0 font-bold border-none text-xs rounded-full px-3">2 Scheduled</Tag>
            </div>

            {/* Snapshot Row 4: Sessions Remaining / NDIS Gauge */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2.5">
              <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Sessions & Funding Remaining</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">EPC Referral</span>
                  <Progress percent={60} strokeColor="#8C4BFF" size="small" showInfo={false} />
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">3 of 5 used (2 remaining)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">NDIS Budget</span>
                  <Progress percent={65} strokeColor="#30D2BE" size="small" showInfo={false} />
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">$7,400 remaining (65% available)</span>
                </div>
              </div>
            </div>

            {/* Snapshot Row 5: Outstanding Tasks */}
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold text-xs text-slate-808 dark:text-slate-200 block">Outstanding Tasks</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Pending intake questionnaire & exercise routine</span>
              </div>
              <Tag color="warning" className="m-0 font-bold border-none text-xs rounded-full px-3">3 Tasks Due</Tag>
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
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">2 of 4 interventions completed</span>
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
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Clinical Patient Intake Form is pending submission</span>
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
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">INV-1829 ($120.00) is due in 3 days</span>
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
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">New exercise guidelines from Dr. Sarah Jenkins</span>
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
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Initial Assessment Report & Spine MRI scan PDF</span>
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
