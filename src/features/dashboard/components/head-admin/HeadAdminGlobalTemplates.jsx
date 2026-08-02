import React from 'react'
import { Card, Table, Tag, Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

export default function HeadAdminGlobalTemplates() {
  const globalTemplates = [
    { key: '1', title: 'NDIS Intake Care Assessment', category: 'NDIS Services', status: 'Published' },
    { key: '2', title: 'EPC Standard Clinical Assessment', category: 'Medicare Billing', status: 'Published' },
    { key: '3', title: 'AHTR Outcome Measure Questionnaire', category: 'Outcomes', status: 'Published' },
    { key: '4', title: 'Standard GDPR Consent Release Form', category: 'Consent', status: 'Draft' },
  ]

  return (
    <Card
      className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
      title={<span className="font-bold text-slate-800 dark:text-slate-200 text-base">Global Healthcare templates catalog</span>}
      extra={<Button type="primary" onClick={() => toast.success('Add Global Template Form')} className="rounded-xl text-xs font-bold" style={{ backgroundColor: '#8C4BFF', border: 'none' }}>+ Add Global Template</Button>}
    >
      <Table
        dataSource={globalTemplates}
        pagination={false}
        columns={[
          { title: 'Template Name', dataIndex: 'title', render: (t) => <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{t}</span> },
          { title: 'Category Scheme', dataIndex: 'category', render: (t) => <Tag color="blue" className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">{t}</Tag> },
          { title: 'Catalog Status', dataIndex: 'status', render: (s) => <Tag color={s === 'Published' ? 'success' : 'default'} className="rounded-full border-none font-bold text-[9px] uppercase">{s}</Tag> },
          {
            title: 'Inherited Action',
            key: 'action',
            align: 'right',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => toast.success(`Assigned ${record.title} template globally to all active clinics.`)}>Assign to Clinics</Button>
                <Button size="small" icon={<DeleteOutlined />} danger onClick={() => toast.success(`Deleted ${record.title}`)} />
              </Space>
            )
          }
        ]}
      />
    </Card>
  )
}
