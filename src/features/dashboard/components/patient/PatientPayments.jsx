import React, { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Radio, Space, Input } from 'antd'
import { CreditCardOutlined, DownloadOutlined, SafetyOutlined, DollarOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

export default function PatientPayments() {
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const [invoicesList, setInvoicesList] = useState([
    { key: '1', id: 'INV-1829', service: 'MSK Review Consultation', practitioner: 'Dr. Sarah Jenkins', amount: 120.00, status: 'Unpaid', due: '19 Jun 2026' },
    { key: '2', id: 'INV-1712', service: 'Hydrotherapy Session Assessment', practitioner: 'Dr. Emily Smith', amount: 150.00, status: 'Paid', due: '04 Jun 2026' },
    { key: '3', id: 'INV-1502', service: 'Initial Physiotherapy Assessment', practitioner: 'Dr. Sarah Jenkins', amount: 180.00, status: 'Paid', due: '02 Jan 2026' },
    { key: '4', id: 'INV-1405', service: 'OT Assessment Session', practitioner: 'Dr. James Carter', amount: 190.00, status: 'Overdue', due: '10 May 2026' }
  ])

  const handlePay = (invoice) => {
    setSelectedInvoice(invoice)
    setPayModalOpen(true)
  }

  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    setInvoicesList(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv))
    toast.success(`Payment of $${selectedInvoice.amount.toFixed(2)} completed successfully via ${paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'apple' ? 'Apple Pay' : paymentMethod === 'google' ? 'Google Pay' : 'Direct Deposit'}!`)
    setPayModalOpen(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">Invoices & Payments Ledger</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              Review clinic service invoices, make secure online payments, and download clinical receipt statements.
            </p>
          </div>
          <Tag color="purple" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
            <DollarOutlined className="mr-1" />
            Secure Payments Active
          </Tag>
        </div>
      </Card>

      {/* Invoice Ledger Table */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Clinic Invoices & Receipts</span>} style={{ marginTop: '24px' }}>
        <Table
          dataSource={invoicesList}
          pagination={false}
          scroll={{ x: 700 }}
          className="border-none"
          columns={[
            { 
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Invoice ID</span>, 
              dataIndex: 'id', 
              render: (t) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">{t}</span> 
            },
            { 
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic Service</span>, 
              render: (_, rec) => (
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{rec.service}</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 block mt-0.5">Practitioner: {rec.practitioner}</span>
                </div>
              )
            },
            { 
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>, 
              dataIndex: 'due', 
              render: (d) => <span className="text-slate-500 font-semibold text-xs">{d}</span> 
            },
            { 
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Total</span>, 
              dataIndex: 'amount', 
              render: (a) => <span className="font-extrabold text-[#8C4BFF] text-xs">${a.toFixed(2)}</span> 
            },
            { 
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</span>, 
              dataIndex: 'status', 
              render: (s) => (
                <Tag color={s === 'Paid' ? 'success' : s === 'Unpaid' ? 'warning' : 'error'} className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">
                  {s}
                </Tag>
              ) 
            },
            {
              title: '',
              key: 'action',
              align: 'right',
              render: (_, record) => (
                record.status !== 'Paid' ? (
                  <Button
                    size="small"
                    type="primary"
                    icon={<CreditCardOutlined />}
                    style={{ backgroundColor: '#8C4BFF', border: 'none' }}
                    className="rounded-lg text-[10px] font-bold h-8 text-white"
                    onClick={() => handlePay(record)}
                  >
                    Pay Invoice
                  </Button>
                ) : (
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    className="rounded-lg text-[10px] font-semibold h-8 dark:bg-slate-905 dark:border-slate-800"
                    onClick={() => {
                      // Dummy download functionality
                      const element = document.createElement("a");
                      const file = new Blob([`Simulated Receipt Content for ${record.id}\nAmount: $${record.amount.toFixed(2)}\nService: ${record.service}`], {type: 'application/pdf'});
                      element.href = URL.createObjectURL(file);
                      element.download = `Receipt_${record.id}.pdf`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success(`Receipt for ${record.id} downloaded successfully!`)
                    }}
                  >
                    Receipt
                  </Button>
                )
              )
            }
          ]}
        />
      </Card>

      {/* Pay Modal */}
      {selectedInvoice && (
        <Modal
          open={payModalOpen}
          onCancel={() => setPayModalOpen(false)}
          title={<span className="font-bold text-slate-808 dark:text-white text-base">Complete Payment: {selectedInvoice.id}</span>}
          footer={null}
          destroyOnHidden
        >
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
            
            {/* Invoice Total */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Service Invoice Balance</span>
                <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">{selectedInvoice.service}</span>
              </div>
              <span className="text-lg font-black text-[#8C4BFF]">${selectedInvoice.amount.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Payment Method</label>
              <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} className="w-full grid grid-cols-2 gap-2">
                <Radio.Button value="card" className="h-10 flex items-center justify-center rounded-xl font-bold text-xs">Credit/Debit Card</Radio.Button>
                <Radio.Button value="apple" className="h-10 flex items-center justify-center rounded-xl font-bold text-xs">Apple Pay</Radio.Button>
                <Radio.Button value="google" className="h-10 flex items-center justify-center rounded-xl font-bold text-xs">Google Pay</Radio.Button>
                <Radio.Button value="direct" className="h-10 flex items-center justify-center rounded-xl font-bold text-xs">Direct Deposit</Radio.Button>
              </Radio.Group>
            </div>

            {/* Sub-inputs based on payment selection */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cardholder Name</label>
                  <Input placeholder="John Miller" required className="rounded-xl h-9" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Card Number</label>
                  <Input placeholder="•••• •••• •••• ••••" required className="rounded-xl h-9" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expiry Date</label>
                    <Input placeholder="MM / YY" required className="rounded-xl h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CVV</label>
                    <Input placeholder="•••" required className="rounded-xl h-9" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'direct' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 rounded-xl space-y-2 text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-750 block">ZealthOS Direct Deposit Details</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>BSB: 083-214</div>
                  <div>Account: 9812-40112</div>
                  <div>Ref: {selectedInvoice.id}</div>
                </div>
                <p className="text-[10px] text-slate-400 m-0 mt-2">Please upload direct deposit remittance in the Documents section once sent.</p>
              </div>
            )}

            {(paymentMethod === 'apple' || paymentMethod === 'google') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-150 rounded-xl text-center text-xs text-slate-500 font-semibold">
                Proceeding will launch your system checkout integration.
              </div>
            )}

            {/* Secure confirmation */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold py-1">
              <span><SafetyOutlined className="mr-1 text-emerald-500" />SSL Encrypted Checkout</span>
              <span>PCI-DSS Compliant</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setPayModalOpen(false)} className="rounded-xl font-bold border-slate-200">Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold text-xs text-white">Pay ${selectedInvoice.amount.toFixed(2)}</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}
