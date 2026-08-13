import React, { useState, useEffect } from 'react'
import { Table, Button, Tag, Input, Select, DatePicker, Modal, Space, Form, InputNumber } from 'antd'
import { SearchOutlined, PlusOutlined, DollarOutlined, FilePdfOutlined, MailOutlined, EditOutlined, CopyOutlined, CloseCircleOutlined, DeleteOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, getPatients } from '../../calendar/api/clinicAdminApi'

const { Option } = Select

export default function InvoicesPage() {
  const store = useClinicStore()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [practitionerFilter, setPractitionerFilter] = useState('')
  const [recipientFilter, setRecipientFilter] = useState('')
  const [issueDateFilter, setIssueDateFilter] = useState(null)
  const [dueDateFilter, setDueDateFilter] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  
  const [createVisible, setCreateVisible] = useState(false)
  const [createForm] = Form.useForm()

  const fetchInvoicesData = async () => {
    setLoading(true)
    try {
      if (!store.patients || store.patients.length === 0) {
        const pRes = await getPatients().catch(() => null)
        if (pRes && pRes.success && Array.isArray(pRes.data)) {
          store.setPatients(pRes.data)
        }
      }
      const res = await getInvoices({
        search: searchText,
        status: statusFilter,
        practitioner: practitionerFilter,
        recipient: recipientFilter,
      })
      if (res && res.success && Array.isArray(res.data)) {
        store.setInvoices(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoicesData()
  }, [searchText, statusFilter, practitionerFilter, recipientFilter])

  const handleCreateInvoice = async (values) => {
    setSubmitting(true)
    const newInvoice = {
      clientName: values.clientName,
      patientName: values.clientName,
      recipient: values.recipient || values.clientName,
      practitionerName: values.practitionerName,
      amount: parseFloat(values.amount) || 0,
      due: parseFloat(values.amount) || 0,
      status: 'Processing',
      sentStatus: 'Not Sent',
      service: values.service || 'MSK',
      patientId: values.patientId || null,
      issueDate: dayjs().format('YYYY-MM-DD'),
      dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    }

    try {
      const res = await createInvoice(newInvoice)
      if (res && res.success && res.data) {
        store.addInvoice(res.data)
        toast.success('Invoice created successfully!')
        setCreateVisible(false)
        createForm.resetFields()
        fetchInvoicesData()
      } else {
        toast.error('Failed to create invoice')
      }
    } catch (err) {
      console.error('Create invoice error:', err)
      toast.error('Error creating invoice in backend database')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecordPayment = async (invoiceId) => {
    try {
      const res = await updateInvoice(invoiceId, { status: 'Paid', due: 0.00 })
      if (res && res.success && res.data) {
        store.updateInvoice(res.data)
        toast.success('Payment recorded successfully!')
        setDetailVisible(false)
        fetchInvoicesData()
      }
    } catch (err) {
      console.error('Record payment error:', err)
      toast.error('Failed to record payment')
    }
  }

  const handleSendInvoice = async (invoice) => {
    try {
      const res = await updateInvoice(invoice.id, { sentStatus: 'Sent' })
      if (res && res.success && res.data) {
        store.updateInvoice(res.data)
        toast.success(`Invoice ${invoice.displayId || invoice.invoiceNumber || invoice.id} dispatched to ${invoice.recipient || invoice.clientName}`)
        setDetailVisible(false)
        fetchInvoicesData()
      }
    } catch (err) {
      console.error('Send invoice error:', err)
      toast.error('Failed to update sent status')
    }
  }

  const handleCancelInvoice = async (invoiceId) => {
    try {
      const res = await updateInvoice(invoiceId, { status: 'Cancelled' })
      if (res && res.success && res.data) {
        store.updateInvoice(res.data)
        toast.success('Invoice marked Cancelled')
        setDetailVisible(false)
        fetchInvoicesData()
      }
    } catch (err) {
      console.error('Cancel invoice error:', err)
      toast.error('Failed to cancel invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await deleteInvoice(invoiceId)
      store.deleteInvoice(invoiceId)
      toast.success('Invoice deleted from live database')
      setDetailVisible(false)
      fetchInvoicesData()
    } catch (err) {
      console.error('Delete invoice error:', err)
      toast.error('Failed to delete invoice from database')
    }
  }

  const handleDownloadPDF = (invoice) => {
    const invNum = invoice.displayId || invoice.invoiceNumber || (invoice.id ? `INV-${invoice.id.slice(0, 6).toUpperCase()}` : 'INV-000001')
    const clientName = invoice.clientName || invoice.patientName || 'Client'
    const practitionerName = invoice.practitionerName || 'General Practitioner'
    
    const content = `===================================================================
                       ZEALTHOS CLINIC INVOICE
===================================================================
Invoice Number: ${invNum}
Issue Date:     ${invoice.issueDate || dayjs().format('YYYY-MM-DD')}
Due Date:       ${invoice.dueDate || dayjs().add(7, 'day').format('YYYY-MM-DD')}

BILL TO:
Name:           ${clientName}
Company:        ${invoice.recipient || clientName}

PRACTITIONER / DETAILS:
Attending:      ${practitionerName}
Service:        ${invoice.service || 'Medical Service'}

FINANCIAL SUMMARY:
Total Amount:   $${(invoice.amount || 0).toFixed(2)}
Remaining Due:  $${(invoice.due || 0).toFixed(2)}
Status:         ${invoice.status || 'Processing'}
Sent Status:    ${invoice.sentStatus || 'Sent'}
===================================================================`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invNum.replace(/[^a-zA-Z0-9_-]/g, '')}_Invoice.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`PDF compiled & downloaded: ${invNum}_Invoice.pdf`)
  }

  const getInvoiceDisplayNumber = (inv) => {
    if (!inv) return 'INV-000001'
    if (inv.displayId) return inv.displayId
    if (inv.invoiceNumber) return inv.invoiceNumber
    if (inv.id) {
      if (inv.id.startsWith('INV-')) return inv.id
      return `INV-${inv.id.slice(0, 6).toUpperCase()}`
    }
    return 'INV-000001'
  }

  // Filter lists

  const invoicesList = (store.invoices || []).filter(Boolean)

  const filteredInvoices = invoicesList.filter(inv => {
    const q = (searchText || '').toLowerCase()
    const matchesSearch = !searchText || 
                          (inv.id || '').toLowerCase().includes(q) ||
                          (inv.displayId || '').toLowerCase().includes(q) ||
                          (inv.invoiceNumber || '').toLowerCase().includes(q) ||
                          (inv.clientName || '').toLowerCase().includes(q) ||
                          (inv.patientName || '').toLowerCase().includes(q) ||
                          (inv.practitionerName || '').toLowerCase().includes(q)
    
    const matchesStatus = !statusFilter || (
      statusFilter === 'Completed' ? (inv.status === 'Completed' || inv.status === 'Paid') :
      statusFilter === 'Cancel' ? (inv.status === 'Cancel' || inv.status === 'Cancelled') :
      (inv.status === 'Processing' || inv.status === 'Draft' || inv.status === 'Sent')
    )
    
    const matchesPractitioner = !practitionerFilter || inv.practitionerName === practitionerFilter
    
    const matchesRecipient = !recipientFilter || 
                             (inv.recipient || '').toLowerCase().includes(recipientFilter.toLowerCase())
                             
    const matchesIssueDate = !issueDateFilter || 
                             (inv.issueDate && dayjs(inv.issueDate).isSame(dayjs(issueDateFilter), 'day'))
                             
    const matchesDueDate = !dueDateFilter || 
                           (inv.dueDate && dayjs(inv.dueDate).isSame(dayjs(dueDateFilter), 'day'))
    
    return matchesSearch && matchesStatus && matchesPractitioner && matchesRecipient && matchesIssueDate && matchesDueDate
  })

  // Extract unique practitioner names from list for filter
  const uniquePractitioners = Array.from(
    new Set(invoicesList.map(inv => inv.practitionerName).filter(Boolean))
  )

  const columns = [
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Invoice #</span>,
      dataIndex: 'displayId',
      key: 'displayId',
      render: (text, record) => {
        const invNum = text || record.invoiceNumber || record.id || 'INV'
        return <span className="font-bold text-slate-800 dark:text-slate-200">{invNum.replace('#', '')}</span>
      }
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">To (Client & Company)</span>,
      key: 'to',
      render: (_, record) => {
        let clientDisplayName = record.clientName || record.patientName || ''
        const foundPatient = store.patients.find(p => p.id === clientDisplayName || p.displayId === clientDisplayName || p.id === record.patientId || p.displayId === record.patientId)
        if (foundPatient) {
          clientDisplayName = foundPatient.fullName || foundPatient.name || clientDisplayName
        }
        if (!clientDisplayName || clientDisplayName.startsWith('CLI-') || clientDisplayName.length > 25) {
          if (foundPatient) {
            clientDisplayName = foundPatient.fullName || foundPatient.name
          }
        }
        const finalName = clientDisplayName || 'Client'
        const hasRecipient = record.recipient && record.recipient !== finalName

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{finalName}</span>
            {hasRecipient && (
              <span className="text-[10px] text-slate-400 font-semibold">{record.recipient}</span>
            )}
          </div>
        )
      }
    },

    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Practitioner</span>,
      dataIndex: 'practitionerName',
      key: 'practitionerName',
      render: (text) => <span className="text-slate-500 font-semibold dark:text-slate-400">{text}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Issue date</span>,
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => {
        if (!date) return '—'
        return <span className="text-slate-500 dark:text-slate-400">{dayjs(date).format('DD/MM/YYYY')}</span>
      }
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Due date</span>,
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        if (!date) return '—'
        return <span className="text-slate-500 dark:text-slate-400">{dayjs(date).format('DD/MM/YYYY')}</span>
      }
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Amount</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">${val.toFixed(2)}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Due balance</span>,
      dataIndex: 'due',
      key: 'due',
      render: (val) => {
        if (val === 0) return <span className="text-slate-400 font-medium">—</span>
        return <span className="font-bold text-rose-500">${val.toFixed(2)}</span>
      }
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let bg = '#0D9488'; // Completed (teal)
        let text = 'Completed';
        if (status === 'Cancel' || status === 'Cancelled') {
          bg = '#DC2626'; // Cancel (red)
          text = 'Cancel';
        } else if (status === 'Processing' || status === 'Draft' || status === 'Sent') {
          bg = '#EA580C'; // Processing (orange)
          text = 'Processing';
        }
        return (
          <span
            className="inline-flex items-center justify-center rounded-lg text-white font-extrabold text-[10px] uppercase tracking-wider"
            style={{ backgroundColor: bg, width: 88, height: 22 }}
          >
            {text}
          </span>
        )
      }
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Sent status</span>,
      dataIndex: 'sentStatus',
      key: 'sentStatus',
      render: (status) => {
        return (
          <Tag color={status === 'Sent' ? 'blue' : 'default'} className="font-bold rounded-lg border-none uppercase text-[9px]">
            {status || 'Not Sent'}
          </Tag>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white m-0">Invoices</h2>
      </div>

      {/* Filter Options Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search & Add */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-[280px]">
            <SearchOutlined
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 13 }}
            />
            <input
              type="text"
              placeholder="Search invoice number or client"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full invoice-search-input text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-[#8C4BFF] transition-colors text-sm"
              style={{ height: 38 }}
            />
          </div>

          <button
            onClick={() => setCreateVisible(true)}
            className="h-9 rounded-lg flex items-center justify-center text-white border-none cursor-pointer transition-opacity hover:opacity-85 shadow-sm px-4 gap-1.5 font-bold text-xs"
            style={{ backgroundColor: '#8C4BFF' }}
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Row 2: Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            className="rounded-xl"
            style={{ width: 130, height: 38 }}
          >
            <Option value="Completed">Completed</Option>
            <Option value="Cancel">Cancel</Option>
            <Option value="Processing">Processing</Option>
          </Select>

          <Select
            placeholder="Practitioner"
            allowClear
            value={practitionerFilter || undefined}
            onChange={setPractitionerFilter}
            className="rounded-xl"
            style={{ width: 160, height: 38 }}
          >
            {uniquePractitioners.map(p => (
              <Option key={p} value={p}>{p}</Option>
            ))}
          </Select>

          <Input
            placeholder="Filter Recipient"
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="rounded-xl border border-slate-200"
            style={{ width: 160, height: 38 }}
          />

          <DatePicker
            placeholder="Issue Date"
            value={issueDateFilter}
            onChange={setIssueDateFilter}
            format="DD/MM/YYYY"
            className="rounded-xl border border-slate-200"
            style={{ width: 140, height: 38 }}
          />

          <DatePicker
            placeholder="Due Date"
            value={dueDateFilter}
            onChange={setDueDateFilter}
            format="DD/MM/YYYY"
            className="rounded-xl border border-slate-200"
            style={{ width: 140, height: 38 }}
          />
        </div>
      </div>

      {/* Invoice Grid Table */}
      <Table
        dataSource={filteredInvoices}
        columns={columns}
        rowKey="id"
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-sm rounded-2xl overflow-hidden cursor-pointer"
        onRow={(record) => ({
          onClick: () => {
            setSelectedInvoice(record)
            setDetailVisible(true)
          }
        })}
        pagination={{
          pageSize: 15,
          showSizeChanger: false,
          showTotal: (total, range) => (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Showing {range[0]}-{range[1]} out of {total}
            </span>
          ),
          itemRender: (current, type, originalElement) => {
            if (type === 'prev') {
              return <span className="text-xs font-semibold select-none text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 cursor-pointer">&lt; Previous</span>
            }
            if (type === 'next') {
              return <span className="text-xs font-semibold select-none text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 cursor-pointer">Next &gt;</span>
            }
            return originalElement
          }
        }}
      />

      {/* Create Invoice Modal */}
      <Modal
        title="Create Invoice Draft"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={createForm} onFinish={handleCreateInvoice} className="mt-4">
          <Form.Item name="clientName" label="Client Patient Name" rules={[{ required: true }]}>
            <Select className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800/50 flex items-center">
              {store.patients.map(p => {
                const pName = p.fullName || p.name || p.displayId || 'Patient'
                return (
                  <Option key={p.id} value={pName}>
                    {pName} {p.displayId ? `(${p.displayId})` : ''}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>

          <Form.Item name="recipient" label="Invoice Recipient Name (e.g. Plan Partners Co)">
            <Input className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800/50" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="practitionerName" label="Attending Practitioner" rules={[{ required: true }]}>
              <Select className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                {store.practitioners.map(p => (
                  <Option key={p.id} value={p.name}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="amount" label="Invoice Total Amount ($)" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full rounded-xl h-10 bg-slate-50 dark:bg-slate-800/50 flex items-center" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right mt-4">
            <Space>
              <Button onClick={() => setCreateVisible(false)} className="rounded-xl">Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-[#8C4BFF] border-none rounded-xl font-bold">
                Create Draft
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        title={selectedInvoice ? `Invoice details: ${getInvoiceDisplayNumber(selectedInvoice)}` : ''}
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setSelectedInvoice(null); }}
        footer={null}
        destroyOnHidden
        width={650}
        className="rounded-2xl overflow-hidden"
      >
        {selectedInvoice && (
          <div className="space-y-6 mt-4 font-sans">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider block font-bold text-[9px]">Bill To</span>
                <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedInvoice.clientName}</span>
                {selectedInvoice.recipient && selectedInvoice.recipient !== selectedInvoice.clientName && (
                  <span className="text-slate-500 text-[10px]">{selectedInvoice.recipient}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase tracking-wider block font-bold text-[9px]">Status / Sent Status</span>
                <div className="mt-1 flex items-center justify-end space-x-1.5">
                  <Tag color={selectedInvoice.status === 'Paid' || selectedInvoice.status === 'Completed' ? 'success' : 'warning'} className="rounded-lg border-none uppercase font-bold text-[9px]">
                    {selectedInvoice.status}
                  </Tag>
                  <Tag color="blue" className="rounded-lg border-none font-bold text-[9px] uppercase">
                    {selectedInvoice.sentStatus}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Line Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <span>Practitioner / Details</span>
                <span>Due Date</span>
                <span>Balance Total</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                <span className="font-bold">{selectedInvoice.practitionerName}</span>
                <span>{selectedInvoice.dueDate ? dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY') : '—'}</span>
                <span className="font-extrabold">${selectedInvoice.amount.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-slate-200/50 dark:border-slate-850 pt-2 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Remaining Balance Due:</span>
                <span className={`font-extrabold ${selectedInvoice.due > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  ${selectedInvoice.due.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons inside invoice */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px] mb-3">Invoice Operations</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                <Button 
                  icon={<DollarOutlined />} 
                  onClick={() => handleRecordPayment(selectedInvoice.id)}
                  disabled={selectedInvoice.status === 'Paid' || selectedInvoice.status === 'Completed'}
                  className="rounded-xl font-bold text-xs h-10 border-emerald-200 text-emerald-600 hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center"
                >
                  Record Pay
                </Button>

                <Button 
                  icon={<MailOutlined />} 
                  onClick={() => handleSendInvoice(selectedInvoice)}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center"
                >
                  Send Invoice
                </Button>

                <Button 
                  icon={<FilePdfOutlined />} 
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="rounded-xl font-bold text-xs h-10 text-red-500 border-red-200 flex items-center justify-center"
                >
                  Download PDF
                </Button>


                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => {
                    handleCreateInvoice({
                      clientName: selectedInvoice.clientName,
                      recipient: selectedInvoice.recipient,
                      practitionerName: selectedInvoice.practitionerName,
                      amount: selectedInvoice.amount,
                      due: selectedInvoice.amount,
                    })
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center"
                >
                  Duplicate
                </Button>

                <Button 
                  icon={<CloseCircleOutlined />} 
                  onClick={() => handleCancelInvoice(selectedInvoice.id)}
                  disabled={selectedInvoice.status === 'Cancelled' || selectedInvoice.status === 'Cancel'}
                  className="rounded-xl font-bold text-xs h-10 text-slate-500 border-slate-200 flex items-center justify-center col-span-2 md:col-span-1"
                >
                  Cancel INV
                </Button>

                <Button 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  className="rounded-xl font-bold text-xs h-10 text-red-600 border-red-100 flex items-center justify-center col-span-2 md:col-span-1"
                >
                  Delete
                </Button>


              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  )
}
