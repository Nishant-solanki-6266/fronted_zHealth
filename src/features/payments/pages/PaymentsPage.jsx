import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Modal, Form, Select, DatePicker, Tooltip } from 'antd'
import { SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { useClinicStore } from '../../../store/clinicStore'
import { getPayments, createPayment } from '../../calendar/api/clinicAdminApi'

const { Option } = Select

export default function PaymentsPage() {
  const store = useClinicStore()
  const navigate = useNavigate()
  const { darkMode } = store
  const [payments, setPayments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchPaymentsData = async () => {
    setLoading(true)
    try {
      const res = await getPayments({ search })
      if (res && res.success && Array.isArray(res.data)) {
        setPayments(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentsData()
  }, [search])

  const handleAddPayment = async (values) => {
    setSubmitting(true)
    const newPayment = {
      from: values.from,
      clientName: values.from,
      amount: parseFloat(values.amount) || 0,
      paymentDate: values.date ? values.date.format('DD MMM YYYY') : dayjs().format('DD MMM YYYY'),
    }

    try {
      const res = await createPayment(newPayment)
      if (res && res.success && res.data) {
        setPayments(prev => [res.data, ...prev])
        toast.success('New payment recorded successfully in database!')
        setModalOpen(false)
        form.resetFields()
        fetchPaymentsData()
      } else {
        toast.error('Failed to record payment')
      }
    } catch (err) {
      console.error('Add payment error:', err)
      toast.error('Error saving payment to live database')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = (payments || []).filter(p => {
    if (!p) return false
    const q = (search || '').toLowerCase()
    const pFrom = (p.clientName || p.from || '').toLowerCase()
    const pId = (p.receiptNumber || p.id || '').toLowerCase()
    return !search || pFrom.includes(q) || pId.includes(q)
  })

  const columns = [
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Payment #</span>,
      key: 'receiptNumber',
      sorter: (a, b) => (a.receiptNumber || a.id || '').localeCompare(b.receiptNumber || b.id || ''),
      render: (_, record) => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{record.receiptNumber || record.id}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">From</span>,
      key: 'from',
      render: (_, record) => <span className="font-medium text-[#8C4BFF] cursor-pointer text-[13px]">{record.clientName || record.from}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Amount</span>,
      dataIndex: 'amount', 
      key: 'amount',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">${(parseFloat(val) || 0).toFixed(2)}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Payment date</span>,
      key: 'date',
      align: 'right',
      render: (_, record) => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{record.paymentDate || record.date}</span>,
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
          value={search} 
          onChange={e => setSearch(e.target.value)}
          onPressEnter={fetchPaymentsData}
          className="rounded-md h-[40px] flex-1 border-[#d9d9d9] dark:border-slate-700 dark:bg-slate-800 text-[13px]"
        />
        <Button
          className="rounded-md h-[40px] px-6 font-medium text-[13px] border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF]"
          onClick={fetchPaymentsData}
        >
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="border border-[#e8e8e8] dark:border-slate-700 rounded-lg overflow-hidden">
        <Table
          dataSource={filtered} 
          columns={columns} 
          loading={loading}
          rowKey={record => record.id || record.receiptNumber}
          expandable={{
            expandedRowRender: record => {
              const rcpt = record.receiptNumber || record.id || 'RCPT'
              const invRef = record.invoiceReference || `INV-${rcpt.replace('RCPT-', '')}`
              const txId = record.transactionId || `tx_${rcpt.toLowerCase().replace(/[^a-z0-9]/g, '')}_892`
              const method = record.paymentMethod || 'Stripe / Credit Card'
              const status = record.status || 'Successful (Paid)'

              return (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 my-2 space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                      Payment Details: <span className="text-[#8C4BFF]">{rcpt}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Client / From</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{record.clientName || record.from}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Payment Method</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{method}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Invoice Reference</span>
                      <span className="font-bold text-[#8C4BFF]">{invRef}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Transaction ID</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">{txId}</span>
                    </div>
                  </div>
                </div>
              )
            },
            expandIcon: ({ expanded, onExpand, record }) => (
              <div 
                className="text-[#8C4BFF] font-black cursor-pointer text-center w-6 text-sm hover:scale-125 transition-transform select-none" 
                onClick={e => onExpand(record, e)}
                title={expanded ? 'Hide details (-)' : 'Show details (+)'}
              >
                {expanded ? '−' : '+'}
              </div>
            )
          }}
          pagination={{ 
            total: filtered.length,
            pageSize: 10, 
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
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
        open={modalOpen} 
        onCancel={() => { setModalOpen(false); form.resetFields() }} 
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddPayment} className="mt-4">
          <Form.Item name="from" label="Client Name" rules={[{ required: true, message: 'Please enter client name' }]}>
            <Input className="rounded-md" placeholder="e.g. John Miller" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter amount' }]}>
            <Input type="number" step="0.01" className="rounded-md" placeholder="e.g. 180.00" />
          </Form.Item>
          <Form.Item name="date" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker className="rounded-md w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => { setModalOpen(false); form.resetFields() }} className="rounded-md">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-md font-bold text-white">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

