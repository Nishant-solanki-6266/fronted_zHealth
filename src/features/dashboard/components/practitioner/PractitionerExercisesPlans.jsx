import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, InputNumber, Divider, Progress } from 'antd'
import {
  HeartOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  SendOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

export default function PractitionerExercisesPlans() {
  const store = useClinicStore()
  const [assignForm] = Form.useForm()

  const [activeTab, setActiveTab] = useState('active')
  const [selectedBodyPart, setSelectedBodyPart] = useState(undefined)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (store.fetchPrescribedExercises) {
      store.fetchPrescribedExercises()
    }
  }, [])

  const activePrograms = store.prescribedExercises || []

  // Exercise Videos library
  const exerciseLibrary = [
    { name: 'Cat-Cow Lumbar Mobilisation', bodyPart: 'Lumbar Spine', duration: '5 min', code: 'EX-LS-01' },
    { name: 'Prone Bird-Dog holds', bodyPart: 'Core Stability', duration: '8 min', code: 'EX-LS-02' },
    { name: 'Supine Dead Bug core press', bodyPart: 'Core Stability', duration: '10 min', code: 'EX-LS-03' },
    { name: 'Scapular Pull-Down isometric', bodyPart: 'Upper Back / Shoulders', duration: '6 min', code: 'EX-US-01' },
    { name: 'Cervical rotation stretch', bodyPart: 'Neck Stiffness', duration: '4 min', code: 'EX-N-01' },
    { name: 'Glute bridge alignment holds', bodyPart: 'Hip / Lower Limb', duration: '7 min', code: 'EX-HL-01' }
  ]

  const handleAssignProgram = async (values) => {
    try {
      setSubmitting(true)
      const pInput = values.patientName
      const selectedPatient = store.patients?.find(p => p.id === pInput || p.name === pInput || p.fullName === pInput)
      
      const targetPatientId = selectedPatient ? selectedPatient.id : (pInput && pInput.length > 2 ? pInput : 'p1')
      const targetPatientName = selectedPatient ? (selectedPatient.name || selectedPatient.fullName || selectedPatient.email) : pInput

      const prog = {
        patientId: targetPatientId,
        patientName: targetPatientName,
        programName: values.programName,
        practitionerName: store.user?.name || 'Dr. Sarah Jenkins',
        delivery: values.delivery || 'Portal',
        instructions: values.instructions || '',
        exercises: [
          { videoName: values.videoName, instructions: values.instructions || '', sets: values.sets || 3, reps: values.reps || 10, frequency: values.frequency || 'Daily' }
        ]
      }
      await store.addPrescribedExercise(prog)
      toast.success(`Program successfully prescribed and sent to ${targetPatientName}!`)
      assignForm.resetFields()
    } catch (err) {
      toast.error('Failed to save exercise program. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getPatientDisplayName = (record) => {
    if (record.patientName && record.patientName.trim() !== '' && !record.patientName.includes('-') && record.patientName !== 'Client Patient') {
      return record.patientName
    }
    const match = store.patients?.find(p => p.id === record.patientId || p.id === record.patientName || p.name === record.patientName || p.fullName === record.patientName)
    if (match) {
      return match.name || match.fullName || `${match.firstName || ''} ${match.lastName || ''}`.trim() || 'Unknown Patient'
    }
    if (record.patientName && record.patientName.trim() !== '' && record.patientName !== 'Client Patient' && !record.patientName.includes('-')) {
      return record.patientName
    }
    return 'Unknown Patient'
  }

  const columns = [
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>,
      key: 'patientName',
      render: (_, record) => <span className="font-bold text-slate-700 dark:text-slate-200">{getPatientDisplayName(record)}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Program Name</span>,
      key: 'programName',
      render: (_, record) => <span className="font-bold text-slate-700 dark:text-slate-200">{record.programName || record.name || 'Home Exercise Program'}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Date</span>,
      key: 'date',
      render: (_, record) => <span className="text-slate-500 font-semibold">{record.date || (record.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : 'Today')}</span>
    },
    {
      title: <span className="text-[10px] uppercase font-bold text-slate-400">Compliance Status</span>,
      key: 'compliance',
      render: (_, record) => {
        const c = record.compliance || { viewed: false, started: false, completed: false }
        return (
          <div className="flex gap-1">
            <Tag color={c.viewed ? 'blue' : 'default'} className="m-0 border-none font-bold text-[8px] uppercase">Viewed</Tag>
            <Tag color={c.started ? 'warning' : 'default'} className="m-0 border-none font-bold text-[8px] uppercase">Started</Tag>
            <Tag color={c.completed ? 'success' : 'default'} className="m-0 border-none font-bold text-[8px] uppercase">Completed</Tag>
          </div>
        )
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
            store.updatePrescribedExerciseCompliance(record.id, { completed: true })
            toast.success(`Marked program completed for ${record.patientName}!`)
          }}
          className="rounded-lg font-semibold border-slate-200"
        >
          Verify Complete
        </Button>
      )
    }
  ]

  const filteredLibrary = exerciseLibrary.filter(ex => selectedBodyPart ? ex.bodyPart === selectedBodyPart : true)

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white m-0">Exercises & Rehab Programs</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Prescribe home programs, monitor patient compliance (viewed, started, completed), and search the exercise video library.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Lists / Compliance tracking */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm"
            title={
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
                  <HeartOutlined style={{ color: '#10B981' }} /> Active Exercise Programs
                </span>
              </div>
            }
          >
            <Table 
              dataSource={activePrograms}
              columns={columns}
              rowKey="id"
              pagination={false}
              className="bg-white dark:bg-slate-900 overflow-hidden"
            />
          </Card>

          {/* Exercise Library Grid */}
          <Card 
            className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm"
            title={
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
                  <PlayCircleOutlined style={{ color: '#3B82F6' }} /> Clinical Exercise Video Library
                </span>
                
                <Select 
                  placeholder="Filter Body Part"
                  allowClear
                  value={selectedBodyPart}
                  onChange={setSelectedBodyPart}
                  style={{ width: 170, height: 32 }}
                  className="text-xs"
                >
                  <Option value="Lumbar Spine">Lumbar Spine</Option>
                  <Option value="Core Stability">Core Stability</Option>
                  <Option value="Upper Back / Shoulders">Upper Back / Shoulders</Option>
                  <Option value="Neck Stiffness">Neck Stiffness</Option>
                  <Option value="Hip / Lower Limb">Hip / Lower Limb</Option>
                </Select>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLibrary.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center gap-3.5 text-xs">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 text-lg flex-shrink-0">
                    <PlayCircleOutlined />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-250 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">{item.bodyPart} &bull; {item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Prescribe Form */}
        <div className="lg:col-span-1">
          <Card 
            className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm"
            title={
              <span className="font-extrabold text-sm text-slate-700 dark:text-white flex items-center gap-2">
                <SendOutlined style={{ color: '#8C4BFF' }} /> Prescribe New Program
              </span>
            }
          >
            <Form form={assignForm} layout="vertical" onFinish={handleAssignProgram}>
              <Form.Item name="patientName" label={<span className="text-xs font-semibold text-slate-500">Patient Name</span>} rules={[{ required: true }]}>
                <Select placeholder="Select patient..." className="rounded-xl h-10 flex items-center">
                  {store.patients.map(p => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="programName" label={<span className="text-xs font-semibold text-slate-500">Program Title</span>} rules={[{ required: true }]}>
                <Input placeholder="e.g. Lower Back Stretching Routine" className="rounded-xl h-10" />
              </Form.Item>

              <Form.Item name="videoName" label={<span className="text-xs font-semibold text-slate-500">Select Exercise video</span>} rules={[{ required: true }]}>
                <Select placeholder="Choose video..." className="rounded-xl h-10 flex items-center">
                  {exerciseLibrary.map((ex, idx) => (
                    <Option key={idx} value={ex.name}>{ex.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item name="sets" label={<span className="text-xs font-semibold text-slate-500">Sets</span>} initialValue={3}>
                  <InputNumber min={1} max={10} className="w-full rounded-xl" />
                </Form.Item>
                <Form.Item name="reps" label={<span className="text-xs font-semibold text-slate-500">Reps</span>} initialValue={10}>
                  <InputNumber min={1} max={30} className="w-full rounded-xl" />
                </Form.Item>
              </div>

              <Form.Item name="frequency" label={<span className="text-xs font-semibold text-slate-500">Frequency</span>} initialValue="Daily">
                <Input className="rounded-xl h-10" />
              </Form.Item>

              <Form.Item name="delivery" label={<span className="text-xs font-semibold text-slate-500">Delivery Channel</span>} initialValue="Portal">
                <Select className="rounded-xl h-10 flex items-center">
                  <Option value="Portal">Patient Portal Portal</Option>
                  <Option value="Email">Direct Email</Option>
                  <Option value="App">Mobile App notification</Option>
                </Select>
              </Form.Item>

              <Form.Item name="instructions" label={<span className="text-xs font-semibold text-slate-500">Exercise Instructions</span>}>
                <Input.TextArea rows={2} placeholder="Instructions details..." className="rounded-xl" />
              </Form.Item>

              <div className="pt-2">
                <Button type="primary" htmlType="submit" loading={submitting} style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="w-full rounded-xl font-bold h-10 text-white shadow">
                  Send to Patient
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}
