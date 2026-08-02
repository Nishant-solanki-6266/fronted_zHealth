import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, InputNumber, Switch, Divider } from 'antd'
import {
  DollarOutlined,
  PlusOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

export default function PractitionerBilling() {
  const store = useClinicStore()
  const [invoiceForm] = Form.useForm()

  const [invoicesList, setInvoicesList] = useState(store.invoices || [])
  const billingPerm = store.practitionerBillingEnabled

  const toggleBillingPermission = (checked) => {
    store.setPractitionerBillingEnabled(checked)
    toast.success(`Clinic Invoicing Permission: ${checked ? 'ENABLED' : 'DISABLED'}`)
  }

  const handleCreateInvoice = (values) => {
    const item = store.services.find(s => s.name === values.serviceName) || store.services[0]
    const price = item ? item.price : 120
    const newInv = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      clientName: values.clientName,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: price,
      due: price,
      status: 'Sent',
      serviceType: item.name
    }
    // Update local and store lists
    setInvoicesList([newInv, ...invoicesList])
    store.invoices = [newInv, ...store.invoices]
    toast.success(`Invoice ${newInv.id} issued successfully!`)
    invoiceForm.resetFields()
  }

  const columns = [
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Invoice ID</span>,
      dataIndex: 'id',
      key: 'id',
      render: text => <span className="font-bold text-slate-800 dark:text-slate-250">{text}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>,
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Service Description</span>,
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: text => <span className="text-slate-500 font-semibold">{text || 'Physiotherapy Session'}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: val => <span className="font-bold text-slate-800 dark:text-slate-200">${val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: stat => {
        let col = 'default'
        if (stat === 'Paid') col = 'success'
        if (stat === 'Sent') col = 'processing'
        if (stat === 'Draft') col = 'warning'
        return <Tag color={col} className="m-0 border-none font-bold text-[9px] uppercase">{stat}</Tag>
      }
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>,
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button 
          size="small" 
          onClick={() => {
            const list = invoicesList.map(inv => inv.id === record.id ? { ...inv, status: 'Paid', due: 0 } : inv)
            setInvoicesList(list)
            toast.success(`Payment processed for ${record.id}!`)
          }}
          disabled={record.status === 'Paid'}
          className="rounded-lg font-semibold border-slate-200"
        >
          {record.status === 'Paid' ? 'Paid' : 'Process Payment'}
        </Button>
      )
    }
  ]

  // Filter invoices to match patient lists
  const myInvoices = invoicesList.filter(i => store.patients.some(p => p.name === i.clientName))

  // Calculated Stats
  const totalRevenue = myInvoices.reduce((sum, item) => sum + (item.status === 'Paid' ? item.amount : 0), 0)
  const outstandingBalance = myInvoices.reduce((sum, item) => sum + (item.status !== 'Paid' ? item.amount : 0), 0)

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Header with Permission Control Switch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white m-0">Invoices & Financial Ledger</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Track claims invoices, outstanding balances, and record patient co-payments.
          </p>
        </div>

        {/* Permission Switcher Widget */}
        <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Invoicing Permission:</span>
          <Switch 
            checked={billingPerm} 
            onChange={toggleBillingPermission} 
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Total Revenue Collected', value: `$${totalRevenue.toFixed(2)} AUD`, icon: <ArrowUpOutlined />, color: '#10B981', desc: 'Cleared claims' },
          { label: 'Outstanding Balance Ledger', value: `$${outstandingBalance.toFixed(2)} AUD`, icon: <ExclamationCircleOutlined />, color: '#EF4444', desc: 'Pending insurance claims' },
          { label: 'Total Invoices issued', value: `${myInvoices.length} Invoices`, icon: <DollarOutlined />, color: '#8C4BFF', desc: 'Processed this cycle' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 dark:text-slate-555 text-[10px] uppercase font-bold tracking-wider">{kpi.label}</span>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs" 
                style={{ backgroundColor: kpi.color + '15', color: kpi.color }}
              >
                {kpi.icon}
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white m-0 mt-3">{kpi.value}</h3>
            <span className="text-slate-400 dark:text-slate-555 text-[10px] font-semibold mt-1 block">{kpi.desc}</span>
          </div>
        ))}
      </div>

      {/* Main Container */}
      {!billingPerm ? (
        <Card className="border border-red-100 dark:border-slate-850 dark:bg-slate-900 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto text-red-500 text-lg">
            <LockOutlined />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white m-0">Invoicing Access Disabled</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-md mx-auto">
              Your practitioner profile does not have permission to issue invoices. Please enable the <b>Clinic Invoicing Permission</b> switch in the header to unlock billing.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Invoices ledger table */}
          <div className="lg:col-span-2">
            <Card 
              className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm"
              title={
                <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
                  <DollarOutlined style={{ color: '#EC4899' }} /> Invoices Ledger Archives
                </span>
              }
            >
              <Table 
                dataSource={myInvoices}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="bg-white dark:bg-slate-900"
              />
            </Card>
          </div>

          {/* Right Column: Invoice Creator */}
          <div className="lg:col-span-1">
            <Card 
              className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm"
              title={
                <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
                  <PlusOutlined style={{ color: '#8C4BFF' }} /> Create Client Invoice
                </span>
              }
            >
              <Form form={invoiceForm} layout="vertical" onFinish={handleCreateInvoice}>
                <Form.Item name="clientName" label={<span className="text-xs font-semibold text-slate-500">Patient / Client</span>} rules={[{ required: true }]}>
                  <Select placeholder="Choose patient..." className="rounded-xl h-10 flex items-center">
                    {store.patients.map(p => (
                      <Option key={p.id} value={p.name}>{p.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="serviceName" label={<span className="text-xs font-semibold text-slate-500">Service Item</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select consultation service..." className="rounded-xl h-10 flex items-center">
                    {store.services.map(s => (
                      <Option key={s.id} value={s.name}>{s.name} (${s.price} AUD)</Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="fundingType" label={<span className="text-xs font-semibold text-slate-500">Funding Type</span>} initialValue="NDIS">
                    <Select className="rounded-xl">
                      <Option value="NDIS">NDIS</Option>
                      <Option value="EPC">EPC Medicare</Option>
                      <Option value="Private">Private Health</Option>
                      <Option value="WorkCover">WorkCover</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="paymentTerms" label={<span className="text-xs font-semibold text-slate-500">Payment Terms</span>} initialValue="7 Days">
                    <Select className="rounded-xl">
                      <Option value="Due Immediately">Due Immediately</Option>
                      <Option value="7 Days">7 Days</Option>
                      <Option value="14 Days">14 Days</Option>
                    </Select>
                  </Form.Item>
                </div>

                <div className="pt-2">
                  <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="w-full rounded-xl font-bold h-10 text-white shadow">
                    Generate & Sent Invoice
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
