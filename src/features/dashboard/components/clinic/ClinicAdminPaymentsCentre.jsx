import React, { useState } from 'react'
import { Table, Button, Input, Modal, Form, Select, DatePicker, Tooltip } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

const initialPayments = [
  { id: 'RCPT-0383', from: 'Feras Taha', amount: 187.50, date: '23 Jun 2026' },
  { id: 'RCPT-0376', from: 'Peter Bent', amount: 92.00, date: '19 Jun 2026' },
  { id: 'RCPT-0377', from: 'Andrej Anastasov', amount: 241.87, date: '19 Jun 2026' },
  { id: 'RCPT-0379', from: 'Noah Lawrence', amount: 257.71, date: '18 Jun 2026' },
  { id: 'RCPT-0378', from: 'Alessia Sharpe', amount: 232.24, date: '17 Jun 2026' },
  { id: 'RCPT-0381', from: 'Liliana Radojcic', amount: 229.99, date: '17 Jun 2026' },
  { id: 'RCPT-0380', from: 'Peter Bent', amount: 264.64, date: '16 Jun 2026' },
  { id: 'RCPT-0382', from: 'Liam Eagles', amount: 229.99, date: '16 Jun 2026' },
  { id: 'RCPT-0375', from: 'Alessia Sharpe', amount: 232.24, date: '15 Jun 2026' },
  { id: 'RCPT-0370', from: 'Allan Schaudin', amount: 213.99, date: '12 Jun 2026' },
]

export default function ClinicAdminPaymentsCentre() {
  const { darkMode } = useClinicStore()
  const [payments, setPayments] = useState(initialPayments)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filtered = payments.filter(p =>
    p.from.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddPayment = (values) => {
    const newPayment = {
      id: `RCPT-${String(payments.length + 1).padStart(4, '0')}`,
      from: values.from,
      amount: parseFloat(values.amount),
      date: values.date ? values.date.format('D MMM YYYY') : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    setPayments(prev => [newPayment, ...prev])
    toast.success('New payment recorded!')
    setModalOpen(false)
    form.resetFields()
  }

  const columns = [
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Payment #</span>,
      dataIndex: 'id', 
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">From</span>,
      dataIndex: 'from', 
      key: 'from',
      render: val => <span className="font-medium text-[#8C4BFF] cursor-pointer text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Amount</span>,
      dataIndex: 'amount', 
      key: 'amount',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val.toFixed(2)}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Payment date</span>,
      dataIndex: 'date', 
      key: 'date',
      align: 'right',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
  ]

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-bold text-[#202020] dark:text-white m-0">Payments</h1>
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-md font-medium text-[13px] h-9 px-4 border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF] transition-colors"
        >
          + New payment
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search for recipient name and payment number"
          value={search} onChange={e => setSearch(e.target.value)}
          className="rounded-md h-[40px] flex-1 border-[#d9d9d9] dark:border-slate-700 dark:bg-slate-800 text-[13px]"
        />
        <Button
          className="rounded-md h-[40px] px-6 font-medium text-[13px] border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF]"
          onClick={() => toast.success('Searching...')}
        >
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="border border-[#e8e8e8] dark:border-slate-700 rounded-lg overflow-hidden">
        <Table
          dataSource={filtered} 
          columns={columns} 
          rowKey="id"
          expandable={{
            expandedRowRender: record => (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Payment Method</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Stripe / Credit Card</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Invoice Reference</span>
                    <span className="font-bold text-[#8C4BFF]">INV-{record.id.replace('RCPT-', '')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Transaction Status</span>
                    <span className="font-bold text-emerald-500">Successful (Paid)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Transaction ID</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">tx_{record.id.toLowerCase()}_892</span>
                  </div>
                </div>
              </div>
            ),
            expandIcon: ({ expanded, onExpand, record }) => (
              <div 
                className="text-slate-400 cursor-pointer text-center w-6" 
                onClick={e => onExpand(record, e)}
              >
                {expanded ? '-' : '+'}
              </div>
            )
          }}
          pagination={{ 
            total: 382,
            pageSize: 10, 
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of 382 items`,
            position: ['bottomRight']
          }}
          className="payments-table custom-pagination-table"
        />
      </div>

      <style jsx global>{`
        .payments-table .ant-table-thead > tr > th {
          background-color: #F1F3F5 !important;
          border-bottom: 1px solid #e8e8e8 !important;
        }
        .dark .payments-table .ant-table-thead > tr > th {
          background-color: #1e293b !important;
          border-bottom: 1px solid #334155 !important;
        }
        .payments-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 12px 16px !important;
        }
        .dark .payments-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #334155 !important;
        }
        .payments-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
        
        /* Custom Pagination styles matching image */
        .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination {
          padding: 16px !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          background-color: white !important;
        }
        .dark .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination {
          background-color: #0f172a !important;
        }
        .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-total-text {
          margin-right: auto !important;
          font-size: 13px;
          color: #666 !important;
        }
        .dark .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-total-text {
          color: #94a3b8 !important;
        }
        .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item {
          border: none !important;
          background: transparent !important;
          font-weight: 500;
          width: auto !important;
          min-width: 32px !important;
          border-radius: 4px !important;
        }
        .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active {
          border: 1px solid #8C4BFF !important;
          border-radius: 4px !important;
          background-color: white !important;
        }
        .dark .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active {
          background-color: #1e293b !important;
        }
        .payments-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active a {
          color: #8C4BFF !important;
        }
        .payments-table.ant-table-wrapper .ant-select-selector {
          border-radius: 4px !important;
        }
      `}</style>

      {/* New Payment Modal */}
      <Modal
        title={<span className="font-bold text-slate-800 dark:text-white">Record New Payment</span>}
        open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddPayment} className="mt-4">
          <Form.Item name="from" label="Client Name" rules={[{ required: true }]}>
            <Input className="rounded-md" placeholder="e.g. John Miller" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" className="rounded-md" placeholder="e.g. 180.00" />
          </Form.Item>
          <Form.Item name="date" label="Payment Date" rules={[{ required: true }]}>
            <DatePicker className="rounded-md w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => { setModalOpen(false); form.resetFields() }} className="rounded-md">Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-md font-bold text-white">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}


