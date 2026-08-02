import React from 'react'
import { Card, Progress, Tag, Table } from 'antd'
import { WarningOutlined, DollarOutlined, InfoCircleOutlined, SwapOutlined } from '@ant-design/icons'

export default function PatientFundingClaims() {
  const activeFunding = [
    { type: 'NDIS Participant Care Plan', remaining: '$7,400.00', percent: 65, status: 'Active', used: '$3,985.00', total: '$11,385.00', expiry: '31 Dec 2026' },
    { type: 'Medicare EPC Program', remaining: '2 sessions', percent: 40, status: 'Low Sessions', used: '3 of 5 sessions', total: '5 sessions', expiry: '14 Nov 2026' }
  ]

  const alerts = [
    { type: 'Low Sessions Alert', text: 'Medicare EPC funding runs low (2 sessions remaining). GP plan review required.', color: 'warning' },
    { type: 'Plan Review Alert', text: 'NDIS plan evaluation scheduled with Care Team practitioners on 18 Jun.', color: 'info' }
  ]

  const claimsHistory = [
    { id: 'clm_1', service: 'Initial Physiotherapy Assessment', date: '02 Jan 2026', amount: '$180.00', funding: 'NDIS', status: 'Approved' },
    { id: 'clm_2', service: 'Lumbar Spine Rehabilitation Exercise', date: '14 May 2026', amount: '$120.00', funding: 'NDIS', status: 'Approved' },
    { id: 'clm_3', service: 'Speech Pathology consultation', date: '04 Jun 2026', amount: '$150.00', funding: 'EPC', status: 'Approved' },
    { id: 'clm_4', service: 'Active Core Mobilisation', date: '12 Jun 2026', amount: '$120.00', funding: 'NDIS', status: 'Processing' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Intro header */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">My Funding, NDIS & Claims Accounts</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              Track government NDIS plans, Medicare EPC limits, WorkCover claims, and private health cover balances.
            </p>
          </div>
          <Tag color="purple" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
            <DollarOutlined className="mr-1" />
            Active Claims Management
          </Tag>
        </div>
      </Card>

      {/* Funding Alerts */}
      <div className="space-y-3" style={{ marginTop: '24px' }}>
        {alerts.map((a, idx) => (
          <div key={idx} className={`p-4 rounded-xl border flex gap-3 items-center text-xs font-semibold ${
            a.color === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400' : 'bg-blue-50/50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400'
          }`}>
            {a.color === 'warning' ? <WarningOutlined className="text-base flex-shrink-0" /> : <InfoCircleOutlined className="text-base flex-shrink-0" />}
            <div>
              <span className="font-bold block text-[13px]">{a.type}</span>
              <p className="m-0 mt-0.5 font-medium">{a.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Funding cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeFunding.map(fund => (
          <div key={fund.type} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">{fund.type}</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Expiry Date: {fund.expiry}</span>
              </div>
              <Tag color={fund.status === 'Active' ? 'success' : 'warning'} className="m-0 border-none rounded-full px-2.5 py-0.5 text-[8.5px] font-bold uppercase">{fund.status}</Tag>
            </div>

            <div className="space-y-2 border-t border-b border-slate-50 dark:border-slate-850 py-3.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Remaining Balance</span>
                <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{fund.remaining}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                <span>Used to Date: {fund.used}</span>
                <span>Total Budget: {fund.total}</span>
              </div>
              <Progress percent={fund.percent} strokeColor="#8C4BFF" showInfo={false} size="small" />
            </div>
          </div>
        ))}
      </div>

      {/* Claim History Ledger */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Recent Claim Processing & Remittances</span>}>
        <Table
          dataSource={claimsHistory}
          rowKey="id"
          pagination={false}
          scroll={{ x: 700 }}
          className="border-none"
          columns={[
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Claim Transaction ID</span>,
              dataIndex: 'id',
              render: (id) => <span className="font-mono text-xs text-slate-450 dark:text-slate-500 font-bold">{id}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic Care Service</span>,
              render: (_, rec) => (
                <div>
                  <span className="text-slate-750 dark:text-slate-305 font-semibold text-xs block">{rec.service}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Date: {rec.date}</span>
                </div>
              )
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Account / Program</span>,
              dataIndex: 'funding',
              render: (f) => <Tag color="default" className="m-0 border-slate-200 dark:border-slate-800 rounded-full text-[9px] font-semibold">{f}</Tag>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Claimed Total</span>,
              dataIndex: 'amount',
              render: (a) => <span className="font-extrabold text-[#8C4BFF] text-xs">{a}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Processing Status</span>,
              dataIndex: 'status',
              render: (s) => (
                <Tag color={s === 'Approved' ? 'success' : 'processing'} className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">
                  {s}
                </Tag>
              )
            }
          ]}
        />
      </Card>

    </div>
  )
}
