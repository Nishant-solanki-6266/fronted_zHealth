import React from 'react'
import { Card, Table, Tag, Row, Col, Progress } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { RiseOutlined, FireOutlined, StockOutlined } from '@ant-design/icons'
import { useClinicStore } from '../../../../store/clinicStore'

const outcomesData = [
  { month: 'Jan', pain: 8, function: 30, mobility: 40 },
  { month: 'Feb', pain: 7, function: 45, mobility: 55 },
  { month: 'Mar', pain: 6, function: 60, mobility: 68 },
  { month: 'Apr', pain: 4, function: 75, mobility: 78 },
  { month: 'May', pain: 3, function: 82, mobility: 85 },
  { month: 'Jun', pain: 2, function: 90, mobility: 92 }
]

const outcomeMeasuresList = [
  { name: 'Oswestry Disability Index (ODI)', score: '18% (Minimal Disability)', prevScore: '36% (Moderate Disability)', type: 'Lumbar Spine', status: 'Improved' },
  { name: 'LEFS (Lower Extremity Functional Scale)', score: '68 / 80 (Good)', prevScore: '42 / 80 (Poor)', type: 'Lower Limb', status: 'Improved' },
  { name: 'DASH (Disabilities of Arm, Shoulder & Hand)', score: '—', prevScore: '—', type: 'Upper Limb', status: 'Not Tracked' },
  { name: 'Neck Disability Index (NDI)', score: '—', prevScore: '—', type: 'Cervical Spine', status: 'Not Tracked' }
]

export default function PatientProgressOutcomes() {
  const store = useClinicStore()
  const darkMode = store.darkMode
  return (
    <div className="space-y-6">
      
      {/* Recovery Dashboard Info */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">Visual Progress & Clinical Outcomes</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              Track pain scores, functional recovery indicators, and standard outcome measures from treatment sessions.
            </p>
          </div>
          <Tag color="green" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
            <RiseOutlined className="mr-1" />
            Significant Recovery Tracked
          </Tag>
        </div>
      </Card>

      {/* Metric Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginTop: '24px' }}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 flex-shrink-0">
            <FireOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Current Pain Index</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">2 / 10 (Mild)</span>
            <span className="text-emerald-600 text-[9px] font-semibold block">-75% from initial intake</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <RiseOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Mobility Improvement</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">92% Rating</span>
            <span className="text-emerald-600 text-[9px] font-semibold block">+130% ROM expansion</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8C4BFF]/10 flex items-center justify-center text-[#8C4BFF] flex-shrink-0">
            <StockOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Strength Indicators</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">85% Rating</span>
            <span className="text-emerald-600 text-[9px] font-semibold block">+35% isometric loading capacity</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 flex-shrink-0">
            <RiseOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Active Care Compliance</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">75% Completed</span>
            <span className="text-slate-400 text-[9px] font-medium block">7-day active streak</span>
          </div>
        </div>
      </div>

      {/* Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Visual Pain Score Reduction Curve</span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outcomesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="month" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="pain" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: darkMode ? '#1E293B' : '#fff', stroke: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Functional & Mobility Improvement Trend (%)</span>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="month" stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={darkMode ? '#94A3B8' : '#475569'} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)' }} contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#1E293B', borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="function" fill="#8C4BFF" radius={[4, 4, 0, 0]} maxBarSize={18} name="Functional Improvement" />
                <Bar dataKey="mobility" fill="#30D2BE" radius={[4, 4, 0, 0]} maxBarSize={18} name="Mobility Range" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Outcome Measures Index Table */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Standard outcome measures indexes</span>}>
        <Table
          dataSource={outcomeMeasuresList}
          rowKey="name"
          pagination={false}
          scroll={{ x: 700 }}
          className="border-none"
          columns={[
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outcomes Measures Questionnaire</span>,
              dataIndex: 'name',
              render: (n) => <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{n}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Focus Region</span>,
              dataIndex: 'type',
              render: (t) => <span className="text-slate-500 font-semibold text-xs">{t}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Baseline Index Score</span>,
              dataIndex: 'prevScore',
              render: (ps) => <span className="text-slate-500 font-semibold text-xs">{ps}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Verified Score</span>,
              dataIndex: 'score',
              render: (s) => <span className="font-extrabold text-slate-808 dark:text-slate-300 text-xs">{s}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progress State</span>,
              dataIndex: 'status',
              render: (st) => (
                <Tag color={st === 'Improved' ? 'success' : 'default'} className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">
                  {st}
                </Tag>
              )
            }
          ]}
        />
      </Card>

    </div>
  )
}
