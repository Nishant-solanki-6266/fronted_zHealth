import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, TimePicker, Switch, Space, Button } from 'antd'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

export default function AppointmentModal({ open, visible, onCancel, defaultTimeSlot }) {
  const store = useClinicStore()
  const [form] = Form.useForm()
  const [extraNonLabourCosts, setExtraNonLabourCosts] = useState([])
  const isOpen = open !== undefined ? open : visible

  const onFinish = (values) => {
    const patientObj = store.patients.find(p => p.id === values.patientId)
    const practitionerObj = store.practitioners.find(p => p.id === values.practitionerId)
    const serviceObj = store.services.find(s => s.id === values.serviceId)

    const newAppt = {
      patientId: values.patientId,
      patientName: patientObj ? patientObj.name : 'Unknown Client',
      practitionerId: values.practitionerId,
      practitionerName: practitionerObj ? practitionerObj.name : 'Unknown Practitioner',
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
      repeat: values.repeat || 'None',
      diagnosis: values.diagnosis || '',
      bodyPart: values.bodyPart || '',
      ndisLineItem: values.ndisLineItem || (serviceObj ? serviceObj.ndisCode : ''),
      invoiceStatus: values.doNotInvoice ? 'Do Not Invoice' : 'Not Invoiced',
    }

    store.addAppointment(newAppt)
    toast.success(`Appointment scheduled for ${newAppt.patientName}!`)
    form.resetFields()
    onCancel()
  }

  const isRecurring = Form.useWatch('repeatToggle', form)

  // Set initial default date/time when clicked on grid
  useEffect(() => {
    if (isOpen) {
      if (defaultTimeSlot) {
        form.setFieldsValue({
          date: dayjs(defaultTimeSlot.date),
          time: dayjs(`2026-06-09T${defaultTimeSlot.time}`),
          endTime: dayjs(`2026-06-09T${defaultTimeSlot.time}`).add(1, 'hour'),
          practitionerId: defaultTimeSlot.practitionerId || store.practitioners[0]?.id,
          repeat: 'None',
          providerTravel: false,
          nonLabourCosts: false,
          doNotInvoice: false,
          location: 'Clinic',
          room: 'Room A',
        })
      } else {
        form.setFieldsValue({
          date: dayjs(),
          time: dayjs('09:00', 'HH:mm'),
          endTime: dayjs('10:00', 'HH:mm'),
          practitionerId: store.practitioners[0]?.id,
          repeat: 'None',
          providerTravel: false,
          nonLabourCosts: false,
          doNotInvoice: false,
          location: 'Clinic',
          room: 'Room A',
        })
      }
    }
  }, [isOpen, defaultTimeSlot])

  return (
    <Modal
      title="Create Appointment"
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={700}
      className="rounded-2xl overflow-hidden"
    >
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
        className="mt-4 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="patientId" label={<span className="text-slate-600 font-semibold text-xs">Client Patient</span>} rules={[{ required: true }]} className="mb-0">
            <Select 
              placeholder="Select client" 
              className="rounded-xl h-10 flex items-center"
              onChange={(val) => {
                const pat = store.patients.find(p => p.id === val)
                if (pat) {
                  form.setFieldsValue({
                    diagnosis: pat.diagnosis && pat.diagnosis[0] ? pat.diagnosis[0] : '',
                    fundingType: pat.fundingScheme || 'Private',
                  })
                }
              }}
            >
              {store.patients.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="practitionerId" label={<span className="text-slate-600 font-semibold text-xs">Practitioner</span>} rules={[{ required: true }]} className="mb-0">
            <Select placeholder="Select practitioner" className="rounded-xl h-10 flex items-center">
              {store.practitioners.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="serviceId" label={<span className="text-slate-600 font-semibold text-xs">Appointment Type / Service</span>} rules={[{ required: true }]} className="mb-0">
            <Select placeholder="Select service" className="rounded-xl h-10 flex items-center">
              {store.services.filter(s => !s.archived).map(s => (
                <Option key={s.id} value={s.id}>{s.name} ({s.duration}m)</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="location" label={<span className="text-slate-600 font-semibold text-xs">Location</span>} className="mb-0">
            <Input className="rounded-xl h-10" />
          </Form.Item>

          <Form.Item name="room" label={<span className="text-slate-600 font-semibold text-xs">Room / Resource</span>} className="mb-0">
            <Input className="rounded-xl h-10" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Form.Item name="date" label={<span className="text-slate-600 font-semibold text-xs">Date</span>} rules={[{ required: true }]} className="mb-0">
            <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="time" label={<span className="text-slate-600 font-semibold text-xs">Start Time</span>} rules={[{ required: true }]} className="mb-0">
            <TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item name="endTime" label={<span className="text-slate-600 font-semibold text-xs">End Time</span>} rules={[{ required: true }]} className="mb-0">
            <TimePicker className="w-full rounded-xl h-10" format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item name="caseName" label={<span className="text-slate-600 font-semibold text-xs">Case (optional)</span>} className="mb-0">
            <Input placeholder="e.g. Back Injury" className="rounded-xl h-10" />
          </Form.Item>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-[#8C4BFF]/30 dark:border-purple-900/50 p-4 rounded-2xl relative mb-4">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8C4BFF] rounded-l-2xl"></div>
          
          <Form.Item name="repeatToggle" valuePropName="checked" className="mb-3">
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            <span className="ml-3 font-bold text-slate-700 dark:text-slate-200">Repeat</span>
          </Form.Item>

          {isRecurring && (
            <div className="pl-14 space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700 dark:text-slate-200 w-12 text-sm">Repeat:</span>
                <Form.Item name="repeat" className="mb-0 flex-1">
                  <Select className="h-9">
                    <Option value="Daily">Daily</Option>
                    <Option value="Weekly">Weekly</Option>
                    <Option value="Fortnightly">Fortnightly</Option>
                    <Option value="Monthly on day 14">Monthly on day 14</Option>
                    <Option value="Monthly on the third Tuesday">Monthly on the third Tuesday</Option>
                    <Option value="Custom">Custom</Option>
                  </Select>
                </Form.Item>
              </div>
              
              <div className="flex items-start gap-4 mt-4">
                <span className="font-bold text-slate-700 dark:text-slate-200 w-12 text-sm">Ends:</span>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="ends" defaultChecked className="w-4 h-4 text-[#8C4BFF]" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">After</span>
                    <Input defaultValue="1" className="w-16 h-9 rounded-lg" />
                    <span className="text-slate-500 font-semibold text-sm">Occurrences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="ends" className="w-4 h-4 text-[#8C4BFF]" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">On</span>
                    <DatePicker format="DD/MM/YYYY" placeholder="Select date" className="h-9 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="fundingType" label={<span className="text-slate-600 font-semibold text-xs">Funding Type</span>} className="mb-0">
            <Select className="rounded-xl h-10 flex items-center">
              <Option value="NDIS">NDIS</Option>
              <Option value="Private">Private</Option>
              <Option value="Medicare">Medicare</Option>
              <Option value="DVA">DVA</Option>
              <Option value="WorkCover">WorkCover</Option>
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

        {/* Clinical Info */}
        <div className="bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 p-4 rounded-2xl mt-4">
          <span className="text-xs font-bold text-brand-purple block mb-3">Clinical Information (Autosyncs to logs)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="diagnosis" label={<span className="text-slate-600 font-semibold text-xs">Diagnosis</span>} className="mb-0">
              <Select className="rounded-xl h-10 flex items-center">
                <Option value="Cerebral Palsy">Cerebral Palsy</Option>
                <Option value="Stroke">Stroke</Option>
                <Option value="Parkinson's Disease">Parkinson's Disease</Option>
                <Option value="Autism">Autism Spectrum Disorder</Option>
                <Option value="Low Back Pain">Low Back Pain</Option>
              </Select>
            </Form.Item>

            <Form.Item name="bodyPart" label={
              <div className="flex items-center justify-between w-full pr-1">
                <span className="text-slate-600 font-semibold text-xs">
                  {useTreatmentIntervention ? "Treatment Intervention" : "Body Part Treated"}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setUseTreatmentIntervention(false)}
                    className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer border-none transition-all ${
                      !useTreatmentIntervention ? 'bg-[#8C4BFF] text-white' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Body Part
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseTreatmentIntervention(true)}
                    className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer border-none transition-all ${
                      useTreatmentIntervention ? 'bg-[#8C4BFF] text-white' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Intervention
                  </button>
                </div>
              </div>
            } className="mb-0">
              <Select className="rounded-xl h-10 flex items-center">
                {useTreatmentIntervention ? (
                  <>
                    <Option value="Physiotherapy Exercise">Physiotherapy Exercise</Option>
                    <Option value="Manual Therapy">Manual Therapy</Option>
                    <Option value="Hydrotherapy">Hydrotherapy</Option>
                    <Option value="Dry Needling">Dry Needling</Option>
                    <Option value="Speech Therapy Drill">Speech Therapy Drill</Option>
                    <Option value="Occupational Therapy Routine">Occupational Therapy Routine</Option>
                  </>
                ) : (
                  <>
                    <Option value="Shoulder">Shoulder</Option>
                    <Option value="Knee">Knee</Option>
                    <Option value="Hip">Hip</Option>
                    <Option value="Ankle">Ankle</Option>
                    <Option value="Lumbar Spine">Lumbar Spine</Option>
                    <Option value="Cervical Spine">Cervical Spine</Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <Form.Item name="notes" label={<span className="text-slate-600 font-semibold text-xs">Notes</span>} className="mb-0">
            <Input.TextArea rows={2} className="rounded-xl" placeholder="Notes..." />
          </Form.Item>
        </div>

        {/* Billing */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
          <Form.Item name="doNotInvoice" label={<span className="text-slate-600 font-semibold text-xs">Mark as Do Not Invoice</span>} valuePropName="checked" className="mb-0">
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
    </Modal>
  )
}
