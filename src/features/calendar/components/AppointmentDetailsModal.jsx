import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Form, Input, Select, DatePicker, TimePicker, Switch, Space, Button, Divider, Tag, Radio } from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  DollarOutlined,
  EditOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  HeartOutlined,
  SafetyOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

export default function AppointmentDetailsModal({ open, onCancel, appointment, onEditSuccess }) {
  const store = useClinicStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [changelogVisible, setChangelogVisible] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedCancelReason, setSelectedCancelReason] = useState('')
  const [cancelNotes, setCancelNotes] = useState('')
  const [useTreatmentIntervention, setUseTreatmentIntervention] = useState(false)
  const [extraNonLabourCosts, setExtraNonLabourCosts] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    if (appointment) {
      form.setFieldsValue({
        date: dayjs(appointment.date),
        time: dayjs(`2026-06-09T${appointment.time}`),
        endTime: appointment.endTime ? dayjs(`2026-06-09T${appointment.endTime}`) : dayjs(`2026-06-09T${appointment.time}`).add(1, 'hour'),
        patientId: appointment.patientId,
        practitionerId: appointment.practitionerId,
        notes: appointment.notes || '',
        location: appointment.location || '',
        room: appointment.room || '',
        diagnosis: appointment.diagnosis || '',
        bodyPart: appointment.bodyPart || '',
        providerTravel: appointment.travel?.providerTravel || false,
        nonLabourCosts: appointment.travel?.nonLabourCosts || false,
        repeat: appointment.repeat || 'None',
        isRepeatEnabled: appointment.repeat && appointment.repeat !== 'None',
        doNotInvoice: appointment.invoiceStatus === 'Do Not Invoice',
      })
    }
  }, [appointment, isEditing, isRescheduling])

  if (!appointment) return null

  // Find Client metadata
  const clientObj = store.patients.find(p => p.id === appointment.patientId)

  const handleEditSubmit = (values) => {
    const patObj = store.patients.find(p => p.id === values.patientId)
    const pracObj = store.practitioners.find(p => p.id === values.practitionerId)
    
    const updated = {
      ...appointment,
      patientId: values.patientId,
      patientName: patObj ? patObj.name : 'Unknown Client',
      practitionerId: values.practitionerId,
      practitionerName: pracObj ? pracObj.name : 'Unknown Practitioner',
      date: values.date ? values.date.format('YYYY-MM-DD') : appointment.date,
      time: values.time ? values.time.format('HH:mm') : appointment.time,
      endTime: values.endTime ? values.endTime.format('HH:mm') : appointment.endTime,
      location: values.location,
      room: values.room,
      notes: values.notes,
      diagnosis: values.diagnosis,
      bodyPart: values.bodyPart,
      travel: {
        providerTravel: values.providerTravel,
        nonLabourCosts: values.nonLabourCosts,
      },
      repeat: values.repeat,
      invoiceStatus: values.doNotInvoice ? 'Do Not Invoice' : 'Not Invoiced',
    }

    store.updateAppointment(updated)
    toast.success('Appointment details updated successfully!')
    setIsEditing(false)
    if (onEditSuccess) onEditSuccess(updated)
  }

  const handleRescheduleSubmit = (values) => {
    const updated = {
      ...appointment,
      date: values.date.format('YYYY-MM-DD'),
      time: values.time.format('HH:mm'),
      endTime: values.endTime.format('HH:mm'),
    }
    store.updateAppointment(updated)
    toast.success('Appointment rescheduled!')
    setIsRescheduling(false)
    if (onEditSuccess) onEditSuccess(updated)
  }

  const handleAddInvoice = () => {
    store.addInvoice({
      clientName: appointment.patientName,
      practitionerName: appointment.practitionerName,
      amount: 150,
      due: 150,
      status: 'Draft',
    })
    toast.success('Draft invoice added for this appointment!')
    onCancel()
    const basePath = store.userRole === 'clinic' ? '/clinic-admin' : 
                     store.userRole === 'head_admin' ? '/head-admin' : 
                     `/${store.userRole}`
    navigate(`${basePath}/invoices`)
  }

  const handleToggleDoNotInvoice = () => {
    const isCurrentlyDNI = appointment.invoiceStatus === 'Do Not Invoice'
    const updated = {
      ...appointment,
      invoiceStatus: isCurrentlyDNI ? 'Not Invoiced' : 'Do Not Invoice'
    }
    store.updateAppointment(updated)
    toast.success(isCurrentlyDNI ? 'Marked for invoicing' : 'Marked as Do Not Invoice')
    if (onEditSuccess) onEditSuccess(updated)
  }

  const handleMarkArrived = () => {
    const updated = { ...appointment, status: 'Arrived' }
    store.updateAppointment(updated)
    toast.success(`${appointment.patientName} marked as Arrived!`)
    if (onEditSuccess) onEditSuccess(updated)
  }

  const handleMarkDNA = () => {
    const updated = { ...appointment, status: 'DNA' }
    store.updateAppointment(updated)
    toast.success(`${appointment.patientName} marked as Did Not Arrive (DNA)!`)
    if (onEditSuccess) onEditSuccess(updated)
  }

  const handleConfirmCancelAppointment = () => {
    if (!selectedCancelReason) {
      toast.error('Please select a reason for cancellation')
      return
    }
    const updated = {
      ...appointment,
      status: 'Cancelled',
      cancellationReason: selectedCancelReason,
      cancellationNotes: cancelNotes || ''
    }
    store.updateAppointment(updated)
    toast.success('Appointment cancelled successfully!')
    setCancelModalOpen(false)
    setSelectedCancelReason('')
    setCancelNotes('')
    if (onEditSuccess) onEditSuccess(updated)
    onCancel()
  }

  const handleArchive = () => {
    store.deleteAppointment(appointment.id)
    toast.success('Appointment archived/removed successfully.')
    onCancel()
  }

  const getBasePath = () => {
    switch(store.userRole) {
      case 'head_admin': return '/head-admin';
      case 'clinic': return '/clinic-admin';
      case 'sales': return '/sales';
      case 'patient': return '/patient';
      default: return '/practitioner';
    }
  }

  const generateNumericId = (id) => {
    if (!id) return '000000';
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString().padStart(6, '0');
  }

  return (
    <>
      <Modal
        title={isEditing ? "Edit Appointment" : isRescheduling ? "Reschedule Appointment" : "Item Details"}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={650}
        destroyOnHidden
        className="documents-modal"
      >
        {isRescheduling ? (
          <Form form={form} layout="vertical" onFinish={handleRescheduleSubmit} className="mt-4 space-y-4">
            <Form.Item name="date" label="New Date" rules={[{ required: true }]}><DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" /></Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="time" label="New Start Time" rules={[{ required: true }]}><TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} /></Form.Item>
              <Form.Item name="endTime" label="New End Time" rules={[{ required: true }]}><TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} /></Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={() => setIsRescheduling(false)} className="rounded-xl">Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', color: 'white', border: 'none' }} className="rounded-xl font-bold">Reschedule</Button>
            </div>
          </Form>
        ) : isEditing ? (
          <Form form={form} layout="vertical" onFinish={handleEditSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="patientId" label="Client" rules={[{ required: true }]} className="mb-0">
                <Select className="w-full rounded-xl h-10 flex items-center">
                  {store.patients.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="practitionerId" label="Practitioner" rules={[{ required: true }]} className="mb-0">
                <Select className="w-full rounded-xl h-10 flex items-center">
                  {store.practitioners.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="date" label="Date" rules={[{ required: true }]} className="mb-0"><DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" /></Form.Item>
              <Form.Item name="time" label="Start Time" rules={[{ required: true }]} className="mb-0"><TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} /></Form.Item>
              <Form.Item name="endTime" label="End Time" rules={[{ required: true }]} className="mb-0"><TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} /></Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="location" label="Location" className="mb-0"><Input className="rounded-xl h-10" /></Form.Item>
              <Form.Item name="room" label="Room / Resource" className="mb-0"><Input className="rounded-xl h-10" /></Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="diagnosis" label="Diagnosis" className="mb-0">
                <Select className="w-full rounded-xl h-10 flex items-center">
                  <Option value="Cerebral Palsy">Cerebral Palsy</Option>
                  <Option value="Stroke">Stroke</Option>
                  <Option value="Parkinson's Disease">Parkinson's Disease</Option>
                  <Option value="Autism">Autism Spectrum Disorder</Option>
                  <Option value="Low Back Pain">Low Back Pain</Option>
                </Select>
              </Form.Item>
              <Form.Item name="bodyPart" label={
                <div className="flex items-center justify-between w-full pr-1">
                  <span className="text-slate-700 dark:text-slate-200">
                    {useTreatmentIntervention ? "Treatment Intervention" : "Body Part Treated"}
                  </span>
                  <span 
                    className="text-[9px] text-[#8C4BFF] cursor-pointer hover:underline font-bold"
                    onClick={() => setUseTreatmentIntervention(!useTreatmentIntervention)}
                  >
                    Change label
                  </span>
                </div>
              } className="mb-0">
                <Select className="w-full h-10 rounded-lg">
                  <Option value="Shoulder">Shoulder</Option>
                  <Option value="Knee">Knee</Option>
                  <Option value="Hip">Hip</Option>
                  <Option value="Ankle">Ankle</Option>
                  <Option value="Lumbar Spine">Lumbar Spine</Option>
                  <Option value="Cervical Spine">Cervical Spine</Option>
                  <Option value="Speech">Speech Therapy</Option>
                  <Option value="Occupational">OT Assessment</Option>
                </Select>
              </Form.Item>
            </div>
            {/* Travel Options (Exact Screenshot Match) */}
            <div className="bg-white dark:bg-slate-900 border border-[#8C4BFF]/30 dark:border-purple-900/50 p-5 rounded-2xl flex flex-col gap-5 mt-4 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#8C4BFF] rounded-l-2xl"></div>
                
                {/* Main Provider Travel Toggle & Fields */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center">
                    <Form.Item name="providerTravel" valuePropName="checked" className="mb-0">
                      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </Form.Item>
                    <span className="ml-3 font-bold text-slate-700 dark:text-slate-200">Provider travel</span>
                  </div>
                  
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.providerTravel !== curr.providerTravel}>
                    {({ getFieldValue }) => getFieldValue('providerTravel') ? (
                      <>
                        <Form.Item name="providerTravelDesc" label={<span className="text-red-500 font-bold text-xs">Description *</span>} className="mb-0 flex-1" labelCol={{ span: 6 }}>
                          <Input placeholder="Provider Travel" className="rounded-lg h-9" />
                        </Form.Item>
                        
                        <Form.Item name="providerTravelPricing" label={<span className="text-red-500 font-bold text-xs">Pricing *</span>} className="mb-0 flex-1" labelCol={{ span: 6 }}>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              min="0"
                              step="any"
                              placeholder="92.00" 
                              className="rounded-lg h-9 w-32" 
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
                              }}
                            />
                            <span className="text-slate-400 text-xs">/ hour</span>
                          </div>
                        </Form.Item>
                        
                        <Form.Item name="providerTravelAddress" label={<span className="text-slate-700 font-bold text-xs">Address :</span>} className="mb-0 flex-1" labelCol={{ span: 6 }}>
                          <Input placeholder="Search an address" className="rounded-lg h-9" />
                        </Form.Item>
                      
                      <div className="border-t border-[#8C4BFF]/20 pt-4">
                        <h5 className="font-extrabold text-sm mb-3">Travel to the client</h5>
                        <Form.Item name="travelToMins" label={<span className="text-red-500 font-bold text-xs">Minutes *</span>} className="mb-0" labelCol={{ span: 6 }}>
                          <Input placeholder="30" className="rounded-lg h-9 w-24" />
                        </Form.Item>
                      </div>
                      
                      <div className="border-t border-[#8C4BFF]/20 pt-4">
                        <h5 className="font-extrabold text-sm mb-3">Travel back from the client</h5>
                        <Form.Item name="travelBackMins" label={<span className="text-red-500 font-bold text-xs">Minutes *</span>} className="mb-0" labelCol={{ span: 6 }}>
                          <Input placeholder="0" className="rounded-lg h-9 w-24" />
                        </Form.Item>
                      </div>
                      </>
                    ) : null}
                  </Form.Item>
                </div>

                <div className="border-t border-[#8C4BFF]/20 pt-4 flex flex-col gap-4">
                  <div className="flex items-center">
                    <Form.Item name="nonLabourCosts" valuePropName="checked" className="mb-0">
                      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </Form.Item>
                    <span className="ml-3 font-bold text-slate-700 dark:text-slate-200">Provider Travel - non-labour costs</span>
                  </div>
                  
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.nonLabourCosts !== curr.nonLabourCosts}>
                    {({ getFieldValue }) => getFieldValue('nonLabourCosts') ? (
                      <>
                        <div className="flex flex-col gap-3">
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                      <Form.Item name="nonLabourDesc" label={<span className="text-red-500 font-bold text-xs">Description *</span>} className="mb-0" labelCol={{ span: 6 }}>
                        <Input placeholder="Provider Travel - Non-Labour Costs" className="rounded-lg h-9" />
                      </Form.Item>
                      
                      <Form.Item name="nonLabourQty" label={<span className="text-red-500 font-bold text-xs">Quantity *</span>} className="mb-0" labelCol={{ span: 6 }}>
                        <Input placeholder="28" className="rounded-lg h-9 w-24" />
                      </Form.Item>
                      
                      <Form.Item name="nonLabourPricing" label={<span className="text-red-500 font-bold text-xs">Pricing *</span>} className="mb-0" labelCol={{ span: 6 }}>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.99" 
                            className="rounded-lg h-9 w-24" 
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
                            }}
                          />
                          <span className="text-slate-400 text-xs font-semibold">/ km</span>
                        </div>
                      </Form.Item>
                    </div>

                    {extraNonLabourCosts.map((item, index) => (
                      <div key={item.id} className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3 relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-500">Additional Non-Labour Cost #{index + 1}</span>
                          <Button 
                            type="text" 
                            danger 
                            size="small" 
                            onClick={() => setExtraNonLabourCosts(prev => prev.filter(i => i.id !== item.id))}
                            className="text-xs font-semibold"
                          >
                            Remove
                          </Button>
                        </div>
                        <Form.Item name={['extraNonLabourDesc', item.id]} label={<span className="text-red-500 font-bold text-xs">Description *</span>} className="mb-0" labelCol={{ span: 6 }}>
                          <Input placeholder="Provider Travel - Non-Labour Costs" className="rounded-lg h-9" />
                        </Form.Item>
                        
                        <Form.Item name={['extraNonLabourQty', item.id]} label={<span className="text-red-500 font-bold text-xs">Quantity *</span>} className="mb-0" labelCol={{ span: 6 }}>
                          <Input placeholder="1" className="rounded-lg h-9 w-24" />
                        </Form.Item>
                        
                        <Form.Item name={['extraNonLabourPricing', item.id]} label={<span className="text-red-500 font-bold text-xs">Pricing *</span>} className="mb-0" labelCol={{ span: 6 }}>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0.99" 
                              className="rounded-lg h-9 w-24" 
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
                              }}
                            />
                            <span className="text-slate-400 text-xs font-semibold">/ km</span>
                          </div>
                        </Form.Item>
                      </div>
                    ))}

                    <Button 
                      type="dashed" 
                      onClick={() => setExtraNonLabourCosts(prev => [...prev, { id: Date.now() }])}
                      className="w-64 h-9 flex items-center justify-center text-slate-500 font-semibold border-slate-300 hover:border-[#8C4BFF] hover:text-[#8C4BFF]"
                    >
                      + Provider Travel - Non-Labour Costs
                    </Button>
                  </div>
                      </>
                    ) : null}
                  </Form.Item>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-4">
                <div className="flex items-center">
                  <Form.Item name="isRepeatEnabled" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                  <span className="ml-2 font-bold text-slate-700 dark:text-slate-200">Repeat</span>
                </div>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isRepeatEnabled !== curr.isRepeatEnabled}>
                  {({ getFieldValue }) => getFieldValue('isRepeatEnabled') ? (
                    <div className="pl-10 mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-xs font-semibold text-slate-600">Repeat:</span>
                        <Form.Item name="repeat" className="mb-0 flex-1">
                          <Select className="w-full rounded-lg h-9">
                            <Option value="Daily">Daily</Option>
                            <Option value="Weekly">Weekly</Option>
                            <Option value="Fortnightly">Fortnightly</Option>
                            <Option value="Monthly on day 14">Monthly on day 14</Option>
                            <Option value="Monthly on the third Tuesday">Monthly on the third Tuesday</Option>
                            <Option value="Custom">Custom</Option>
                          </Select>
                        </Form.Item>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="w-16 text-xs font-semibold text-slate-600 pt-2">Ends:</span>
                        <div className="flex-1 space-y-2">
                           <Form.Item name="endsType" className="mb-0" initialValue="after">
                             <Radio.Group className="w-full flex flex-col gap-2">
                               <Radio value="after" className="flex items-center">
                                 <span className="mr-2">After</span>
                                 <Form.Item name="endsOccurrences" className="inline-block mb-0 w-20" initialValue="1"><Input className="rounded-md" /></Form.Item>
                                 <span className="ml-2">Occurrences</span>
                               </Radio>
                               <Radio value="on" className="flex items-center">
                                 <span className="mr-2">On</span>
                                 <Form.Item name="endsDate" className="inline-block mb-0 w-40"><DatePicker placeholder="Select date" className="rounded-md" format="DD/MM/YYYY" /></Form.Item>
                               </Radio>
                             </Radio.Group>
                           </Form.Item>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Form.Item>
              </div>

            <Form.Item name="doNotInvoice" label="Mark as Do Not Invoice" valuePropName="checked" className="mb-0"><Switch /></Form.Item>

            <Form.Item name="notes" label="Notes" className="mb-0"><Input.TextArea rows={2} className="rounded-xl" placeholder="Notes..." /></Form.Item>

            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', color: 'white', border: 'none' }} className="rounded-xl font-bold">Save Changes</Button>
            </div>
          </Form>
        ) : (
          <div className="space-y-5 mt-2">
            
            {/* Header Status & Service */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C4BFF]" />
                <span className="font-bold text-slate-800 dark:text-slate-105 text-sm">{appointment.appointmentType || appointment.serviceType || 'Consultation'}</span>
                {appointment.status && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ml-1 ${
                    appointment.status === 'Arrived' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : (appointment.status === 'DNA' || appointment.status === 'Did Not Arrive')
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  }`}>
                    {appointment.status === 'DNA' ? 'Did Not Arrive' : appointment.status}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${
                  appointment.status === 'Arrived'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : (appointment.status === 'DNA' || appointment.status === 'Did Not Arrive')
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {appointment.status === 'Arrived' && <CheckCircleFilled className="text-emerald-500" />}
                  {(appointment.status === 'DNA' || appointment.status === 'Did Not Arrive') && <CloseCircleFilled className="text-rose-500" />}
                  <span>{appointment.status === 'DNA' ? 'Did Not Arrive' : (appointment.status || 'Scheduled')}</span>
                </span>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  appointment.invoiceStatus === 'Invoiced' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : appointment.invoiceStatus === 'Do Not Invoice' 
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                }`}>
                  {appointment.invoiceStatus}
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Column: Appointment Information */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-[#8C4BFF] uppercase tracking-wider mb-2">Item Information</h4>
                
                <div className="space-y-2.5 text-slate-700 dark:text-slate-305">
                  <div className="flex items-start gap-2">
                    <UserOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Practitioner</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{appointment.practitionerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Date & Time</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {dayjs(appointment.date).format('dddd, D MMM YYYY')} at {appointment.time} {appointment.endTime ? ` - ${appointment.endTime}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileTextOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Location / Room</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{appointment.location || 'Clinic'} {appointment.room ? ` · ${appointment.room}` : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <SafetyOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Recurrence settings</span>
                      <span className="font-semibold text-slate-650 dark:text-slate-350">{appointment.repeat || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <IdcardOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Appointment No.</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{generateNumericId(appointment.id)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Client Information */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-5">
                <h4 className="text-[10px] font-extrabold text-[#8C4BFF] uppercase tracking-wider mb-2">Client Information</h4>
                
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Client Name</span>
                    <button 
                      onClick={() => {
                        onCancel();
                        navigate(`${getBasePath()}/patients/${appointment.patientId}`);
                      }}
                      className="font-extrabold text-[#8C4BFF] hover:text-[#7A3CE3] dark:text-[#A070FF] dark:hover:text-[#8C4BFF] text-sm block mt-0.5 text-left transition-colors cursor-pointer"
                    >
                      {appointment.patientName}
                    </button>
                  </div>

                  {clientObj && (
                    <>
                      <div className="flex items-center gap-2 text-slate-650 dark:text-slate-350">
                        <PhoneOutlined className="text-slate-400" />
                        <span>{clientObj.phone || clientObj.mobileNumber || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-650 dark:text-slate-350">
                        <MailOutlined className="text-slate-400" />
                        <span className="truncate block max-w-[200px]">{clientObj.email || 'No email'}</span>
                      </div>
                      {clientObj.ndisNumber && (
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/20 text-[10px] font-bold text-[#8C4BFF]">
                            NDIS #: {clientObj.ndisNumber}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <Divider className="my-2 border-slate-100 dark:border-slate-800" />

            {/* Clinical Details */}
            <div className="bg-purple-50/20 dark:bg-purple-950/10 p-4 rounded-xl border border-purple-100/30 dark:border-purple-900/20 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Diagnosis</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block mt-1">{appointment.diagnosis || 'None entered'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Body Part / Intervention</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block mt-1">{appointment.bodyPart || 'None specified'}</span>
              </div>
            </div>

            {/* Travel metrics if active */}
            {(appointment.travel?.providerTravel || appointment.travel?.nonLabourCosts) && (
              <div className="flex gap-2">
                {appointment.travel?.providerTravel && <Tag color="blue" className="rounded-full border-none font-bold text-[9px]">Provider Travel Active</Tag>}
                {appointment.travel?.nonLabourCosts && <Tag color="cyan" className="rounded-full border-none font-bold text-[9px]">Non-Labour Travel Costs Active</Tag>}
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider mb-1">Notes</span>
                <p className="text-[11px] text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 leading-relaxed m-0">{appointment.notes}</p>
              </div>
            )}

            {/* Attendance Status Action Box */}
            <div className="bg-slate-100/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Client Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  appointment.status === 'Arrived'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : (appointment.status === 'DNA' || appointment.status === 'Did Not Arrive')
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                }`}>
                  {appointment.status === 'DNA' ? 'Did Not Arrive' : (appointment.status || 'Scheduled')}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleMarkArrived}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none shadow-sm ${
                    appointment.status === 'Arrived'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <CheckCircleFilled style={{ fontSize: 14 }} />
                  <span>Arrived</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkDNA}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none shadow-sm ${
                    (appointment.status === 'DNA' || appointment.status === 'Did Not Arrive')
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  <CloseCircleFilled style={{ fontSize: 14 }} />
                  <span>Did Not Arrive</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Actions */}
            {(() => {
              const existingNote = store.consultations.find(c => c.appointmentId === appointment.id);
              return (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 mt-4">
                  <Button 
                    size="small" 
                    type="primary" 
                    icon={<FileTextOutlined />} 
                    onClick={() => {
                      onCancel()
                      navigate(`${getBasePath()}/patients/${appointment.patientId}?tab=progress_notes&appointmentId=${appointment.id}`)
                    }} 
                    style={{ 
                      backgroundColor: existingNote ? (existingNote.status === 'Draft' ? '#F59E0B' : '#10B981') : '#8C4BFF', 
                      color: 'white', 
                      border: 'none' 
                    }}
                    className="rounded-lg font-bold text-[10px] px-2"
                  >
                    {existingNote ? (existingNote.status === 'Draft' ? 'Edit Draft Note' : 'View Final Note') : 'Add Progress Note'}
                  </Button>
                  <Button size="small" type="primary" icon={<DollarOutlined />} onClick={handleAddInvoice} style={{ backgroundColor: '#0E1B33', color: 'white', border: 'none' }} className="rounded-lg text-[10px] font-bold px-2">
                    Add Invoice
                  </Button>
                  <Button size="small" icon={<EditOutlined />} onClick={() => setIsEditing(true)} className="rounded-lg font-bold text-[10px] px-2">
                    Edit
                  </Button>
                  <Button
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => {
                      onCancel()
                      navigate(`${getBasePath()}/calendar?rescheduleApptId=${appointment.id}&patientId=${appointment.patientId}`)
                    }}
                    className="rounded-lg text-[10px] font-bold px-2"
                  >
                    Reschedule
                  </Button>
                  <Button
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => {
                      onCancel()
                      navigate(`${getBasePath()}/calendar?newAppointment=true&patientId=${appointment.patientId}`)
                    }}
                    className="rounded-lg text-[10px] font-bold px-2"
                    style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }}
                  >
                    Book Another
                  </Button>
                  <Button size="small" onClick={handleToggleDoNotInvoice} className="rounded-lg text-[10px] font-bold px-2">
                    {appointment.invoiceStatus === 'Do Not Invoice' ? 'Allow Invoice' : 'Do Not Invoice'}
                  </Button>
                  <Button size="small" icon={<HistoryOutlined />} onClick={() => setChangelogVisible(true)} className="rounded-lg text-[10px] font-bold px-2">
                    Change Log
                  </Button>
                  <Button 
                    size="small" 
                    danger 
                    icon={<CloseCircleOutlined />} 
                    onClick={() => {
                      setSelectedCancelReason('')
                      setCancelNotes('')
                      setCancelModalOpen(true)
                    }} 
                    className="rounded-lg font-bold text-[10px] px-2"
                  >
                    Cancel Appointment
                  </Button>
                  <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleArchive} className="rounded-lg text-[10px] font-bold px-2">
                    Archive
                  </Button>
                </div>
              );
            })()}
            
          </div>
        )}
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <CloseCircleOutlined />
            <span>Cancel Appointment</span>
          </div>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={420}
        className="rounded-2xl overflow-hidden"
      >
        <div className="space-y-4 pt-2">
          <p className="text-slate-600 dark:text-slate-300 text-xs m-0 leading-relaxed">
            Are you sure you want to cancel the appointment for <strong className="text-slate-800 dark:text-white">{appointment?.patientName || 'this patient'}</strong>?
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <Select
              placeholder="Select cancellation reason..."
              value={selectedCancelReason || undefined}
              onChange={setSelectedCancelReason}
              className="w-full h-10 rounded-xl"
            >
              {(store.cancellationReasons || []).filter(r => !r.archived).map((cr) => (
                <Option key={cr.id} value={cr.reason}>
                  {cr.reason}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Notes (Optional)
            </label>
            <Input.TextArea
              rows={2}
              placeholder="Add any extra notes..."
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setCancelModalOpen(false)} className="rounded-xl font-bold text-xs h-9">
              Back
            </Button>
            <Button
              danger
              type="primary"
              onClick={handleConfirmCancelAppointment}
              className="rounded-xl font-bold text-xs h-9 bg-rose-600 border-none shadow-sm"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Changelog Modal */}
      <Modal 
        title="Appointment Change Log" 
        open={changelogVisible} 
        onCancel={() => setChangelogVisible(false)} 
        footer={null}
        width={400}
      >
        <div className="space-y-3 mt-2 text-xs text-slate-500">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Appointment created</span>
              <span>System automated creation</span>
            </div>
            <span className="text-[10px] text-slate-400">{dayjs(appointment.date).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      </Modal>
    </>
  )
}
