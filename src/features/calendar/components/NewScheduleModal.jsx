import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, TimePicker, Switch, Space, Button, Divider, Radio } from 'antd'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { getPatients, getPractitioners } from '../api/clinicAdminApi'
import { getClinicServices } from '../../settings/api/settingsApi'

const { Option } = Select

export default function NewScheduleModal({ open, onCancel, defaultTimeSlot }) {
  const store = useClinicStore()
  const [form] = Form.useForm()
  const [selectedRepeat, setSelectedRepeat] = useState('None')
  const [extraNonLabourCosts, setExtraNonLabourCosts] = useState([])

  // Auto-fetch patients, practitioners, services from Live DB if store is empty on modal open
  useEffect(() => {
    if (open) {
      if (!store.patients || store.patients.length === 0 || !store.practitioners || store.practitioners.length === 0 || !store.services || store.services.length === 0) {
        Promise.allSettled([
          getPatients(),
          getPractitioners(),
          getClinicServices()
        ]).then(([patRes, pracRes, servRes]) => {
          if (patRes.status === 'fulfilled' && patRes.value?.success && Array.isArray(patRes.value.data)) {
            const mapped = patRes.value.data.map(p => ({
              ...p,
              name: p.fullName || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Unnamed Client'
            }))
            if (typeof store.setPatients === 'function') store.setPatients(mapped)
          }
          if (pracRes.status === 'fulfilled' && pracRes.value?.success && Array.isArray(pracRes.value.data)) {
            if (typeof store.setPractitioners === 'function') store.setPractitioners(pracRes.value.data)
          }
          if (servRes.status === 'fulfilled' && servRes.value?.success && Array.isArray(servRes.value.data)) {
            if (typeof store.setServices === 'function') store.setServices(servRes.value.data)
          }
        })
      }
    }
  }, [open])

  // Set initial default date/time when clicked on grid
  useEffect(() => {
    let parsedUser = null
    try {
      const uStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (uStr) parsedUser = JSON.parse(uStr)
    } catch (e) {}
    const uId = parsedUser?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '')
    const uEmail = (parsedUser?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '')).toLowerCase().trim()
    const uName = (parsedUser?.name || (typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '')).toLowerCase().trim()

    const loggedInPrac = (store.practitioners || []).find(p => p.userId === uId || p.id === uId) ||
                         (store.practitioners || []).find(p => p.email && p.email.toLowerCase().trim() === uEmail) ||
                         (store.practitioners || []).find(p => p.name && p.name.toLowerCase().replace(/dr\.?\s*/g, '').includes(uName.replace(/dr\.?\s*/g, ''))) ||
                         store.practitioners[0]

    const defaultPracId = defaultTimeSlot?.practitionerId || loggedInPrac?.id || store.practitioners[0]?.id

    if (open) {
      if (defaultTimeSlot) {
        form.setFieldsValue({
          date: dayjs(defaultTimeSlot.date),
          time: dayjs(`2026-06-09T${defaultTimeSlot.time}`),
          endTime: dayjs(`2026-06-09T${defaultTimeSlot.time}`).add(1, 'hour'),
          practitionerId: defaultPracId,
          repeat: 'None',
          customRepeatText: '',
          providerTravel: false,
          nonLabourCosts: false,
          doNotInvoice: false,
          location: 'Clinic',
          room: 'Room A',
          fundingType: 'Private',
        })
        setSelectedRepeat('None')
      } else {
        form.setFieldsValue({
          date: dayjs(),
          time: dayjs('09:00', 'HH:mm'),
          endTime: dayjs('10:00', 'HH:mm'),
          practitionerId: defaultPracId,
          repeat: 'None',
          customRepeatText: '',
          providerTravel: false,
          nonLabourCosts: false,
          doNotInvoice: false,
          location: 'Clinic',
          room: 'Room A',
          fundingType: 'Private',
        })
        setSelectedRepeat('None')
      }
    }
  }, [open, defaultTimeSlot, store.practitioners])

  const onFinish = async (values) => {
    const patientObj = (store.patients || []).find(p => p.id === values.patientId)
    const practitionerObj = (store.practitioners || []).find(p => p.id === values.practitionerId)
    const serviceObj = (store.services || []).find(s => s.id === values.serviceId)

    const finalRepeat = values.repeat === 'Custom' 
      ? `Custom: ${values.customRepeatText || 'Every 3 days'}` 
      : values.repeat

    const newAppt = {
      patientId: values.patientId,
      patientName: patientObj ? (patientObj.name || patientObj.fullName) : 'Unknown Client',
      practitionerId: values.practitionerId,
      practitionerName: practitionerObj ? (practitionerObj.name || practitionerObj.fullName) : 'Unknown Practitioner',
      date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      time: values.time ? values.time.format('HH:mm') : '09:00',
      endTime: values.endTime ? values.endTime.format('HH:mm') : '10:00',
      duration: serviceObj ? serviceObj.duration : 60,
      fundingScheme: values.fundingType || (patientObj ? patientObj.fundingScheme : 'Private'),
      notes: values.notes || '',
      location: values.location || 'Clinic',
      room: values.room || 'Room A',
      caseName: values.caseName || '',
      travel: {
        providerTravel: values.providerTravel || false,
        nonLabourCosts: values.nonLabourCosts || false,
      },
      repeat: finalRepeat || 'None',
      diagnosis: values.diagnosis || '',
      bodyPart: values.bodyPart || '',
      ndisLineItem: values.ndisLineItem || (serviceObj ? serviceObj.ndisCode : ''),
      invoiceStatus: values.doNotInvoice ? 'Do Not Invoice' : 'Not Invoiced',
    }

    try {
      const savedAppt = await store.addAppointment(newAppt)
      const pName = savedAppt?.patientName || newAppt.patientName || 'Client'
      toast.success(`Appointment scheduled & saved for ${pName}!`)
    } catch (err) {
      console.error('❌ Error in scheduling appointment:', err)
      toast.error('Failed to schedule appointment')
    }
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={<span className="font-extrabold text-base text-slate-800 dark:text-slate-200">Create Appointment</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      centered
      width={720}
      style={{ top: 20, maxWidth: '95vw' }}
      className="rounded-2xl overflow-hidden responsive-modal"
    >
      <div className="max-h-[75vh] md:max-h-[80vh] overflow-y-auto pr-1 sm:pr-2 space-y-4 my-2">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            location: 'Clinic',
            room: 'Room A',
            providerTravel: false,
            nonLabourCosts: false,
            repeat: 'None',
            doNotInvoice: false,
            fundingType: 'Private',
          }}
          className="space-y-4"
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="patientId" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Client Patient</span>} rules={[{ required: true }]} className="mb-0">
            <Select 
              showSearch
              optionFilterProp="children"
              placeholder="Select client" 
              className="rounded-xl h-10 flex items-center"
              onChange={(val) => {
                const pat = (store.patients || []).find(p => p.id === val)
                if (pat) {
                  form.setFieldsValue({
                    diagnosis: pat.diagnosis && pat.diagnosis[0] ? pat.diagnosis[0] : '',
                    fundingType: pat.fundingScheme || 'Private',
                  })
                }
              }}
            >
              {(store.patients || []).map(p => {
                const displayName = p.fullName || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Unnamed Client'
                return <Option key={p.id} value={p.id}>{displayName}</Option>
              })}
            </Select>
          </Form.Item>
          
          <Form.Item name="practitionerId" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Practitioner</span>} rules={[{ required: true }]} className="mb-0">
            <Select 
              showSearch
              optionFilterProp="children"
              placeholder="Select practitioner" 
              className="rounded-xl h-10 flex items-center"
            >
              {(store.practitioners || []).map(p => (
                <Option key={p.id} value={p.id}>{p.name} {p.specialty ? `(${p.specialty})` : ''}</Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="serviceId" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Appointment Type / Service</span>} rules={[{ required: true }]} className="mb-0">
            <Select 
              showSearch
              optionFilterProp="children"
              placeholder="Select service" 
              className="rounded-xl h-10 flex items-center"
            >
              {(store.services || []).filter(s => !s.archived).map(s => (
                <Option key={s.id} value={s.id}>{s.name} ({s.duration || 60}m)</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="location" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Location</span>} className="mb-0">
            <Input className="rounded-xl h-10" />
          </Form.Item>

          <Form.Item name="room" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Room / Resource</span>} className="mb-0">
            <Input className="rounded-xl h-10" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Form.Item name="date" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Date</span>} rules={[{ required: true }]} className="mb-0">
            <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="time" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Start Time</span>} rules={[{ required: true }]} className="mb-0">
            <TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item name="endTime" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">End Time</span>} rules={[{ required: true }]} className="mb-0">
            <TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item name="caseName" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Case (optional)</span>} className="mb-0">
            <Input placeholder="e.g. Back Injury" className="rounded-xl h-10" />
          </Form.Item>
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
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

        {/* Clinical Info */}
        <div className="bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 p-4 rounded-2xl">
          <span className="text-xs font-bold text-[#8C4BFF] block mb-3">Clinical Information (Autosyncs to logs)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="diagnosis" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Diagnosis</span>} className="mb-0">
              <Select className="rounded-xl h-10 flex items-center">
                <Option value="Cerebral Palsy">Cerebral Palsy</Option>
                <Option value="Stroke">Stroke</Option>
                <Option value="Parkinson's Disease">Parkinson's Disease</Option>
                <Option value="Autism">Autism Spectrum Disorder</Option>
                <Option value="Low Back Pain">Low Back Pain</Option>
              </Select>
            </Form.Item>

            <Form.Item name="bodyPart" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Body Part / Intervention</span>} className="mb-0">
              <Select className="rounded-xl h-10 flex items-center">
                <Option value="Shoulder">Shoulder</Option>
                <Option value="Knee">Knee</Option>
                <Option value="Hip">Hip</Option>
                <Option value="Ankle">Ankle</Option>
                <Option value="Lumbar Spine">Lumbar Spine</Option>
                <Option value="Cervical Spine">Cervical Spine</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="ndisLineItem" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">NDIS Line Item</span>} className="mb-0">
            <Input placeholder="e.g. 15_056_0128_1_3" className="rounded-xl h-10" />
          </Form.Item>

          <Form.Item name="notes" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Appointment Notes</span>} className="mb-0">
            <Input.TextArea rows={1} className="rounded-xl" placeholder="Describe symptoms or treatment goals..." />
          </Form.Item>
        </div>

        {/* Billing */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
          <Form.Item name="doNotInvoice" label={<span className="text-slate-600 dark:text-slate-350 font-semibold text-xs">Mark as Do Not Invoice</span>} valuePropName="checked" className="mb-0">
            <Switch />
          </Form.Item>
          
          <Space>
            <Button onClick={onCancel} className="rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', color: 'white', border: 'none' }} className="rounded-xl font-bold px-6">
              Schedule Appointment
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  </Modal>
)
}
