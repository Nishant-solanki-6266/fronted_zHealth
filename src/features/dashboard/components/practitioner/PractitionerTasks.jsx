import React, { useState } from 'react'
import { Card, Button, Form, Input, Select, DatePicker, Tag, Modal, Space, Badge, Divider } from 'antd'
import {
  FileDoneOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

export default function PractitionerTasks() {
  const store = useClinicStore()
  const [taskForm] = Form.useForm()

  const [tasksList, setTasksList] = useState(store.tasks || [])
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddTask = (values) => {
    const newTask = {
      id: `t_${Date.now()}`,
      patientName: values.patientName,
      type: values.type,
      title: values.title,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '2026-06-20',
      status: 'Pending'
    }
    setTasksList([newTask, ...tasksList])
    store.addTask(newTask)
    toast.success('Checklist task created!')
    setModalOpen(false)
    taskForm.resetFields()
  }

  const handleStatusChange = (id, newStatus) => {
    const list = tasksList.map(t => t.id === id ? { ...t, status: newStatus } : t)
    setTasksList(list)
    store.updateTaskStatus(id, newStatus)
    toast.success(`Task status updated to ${newStatus}`)
  }

  // Filter lists by status
  const pendingTasks = tasksList.filter(t => t.status === 'Pending')
  const inProgressTasks = tasksList.filter(t => t.status === 'In Progress')
  const completedTasks = tasksList.filter(t => t.status === 'Completed')

  const TaskCard = ({ task }) => {
    let typeColor = 'default'
    if (task.type === 'Report Due') typeColor = 'orange'
    if (task.type === 'Funding Review Due') typeColor = 'error'
    if (task.type === 'Referral Required') typeColor = 'purple'
    if (task.type === 'Follow-Up Required') typeColor = 'blue'

    return (
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 shadow-sm text-xs">
        <div className="flex justify-between items-start">
          <Tag color={typeColor} className="m-0 border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-full">{task.type}</Tag>
          <span className="text-[10px] text-slate-400 font-semibold">{task.dueDate}</span>
        </div>
        <div>
          <span className="font-extrabold text-slate-850 dark:text-white block">{task.title}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Patient: {task.patientName}</span>
        </div>

        {/* Change status actions */}
        <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 select-none">
          {task.status !== 'Pending' && (
            <Button size="small" className="rounded-lg font-bold text-[9px] px-2 py-0.5 h-6" onClick={() => handleStatusChange(task.id, 'Pending')}>
              To Do
            </Button>
          )}
          {task.status !== 'In Progress' && (
            <Button size="small" className="rounded-lg font-bold text-[9px] px-2 py-0.5 h-6" onClick={() => handleStatusChange(task.id, 'In Progress')}>
              Start
            </Button>
          )}
          {task.status !== 'Completed' && (
            <Button size="small" type="primary" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }} className="rounded-lg font-bold text-[9px] px-2 py-0.5 h-6 text-white" onClick={() => handleStatusChange(task.id, 'Completed')}>
              Done
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-sm flex-wrap gap-4 select-none">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white m-0">Clinical Tasks Board</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Track follow-ups, diagnostic reports, and funding renewal review checklists.
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }}
          onClick={() => setModalOpen(true)}
          className="rounded-xl font-bold h-10 text-white"
        >
          Add Checklist Task
        </Button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Pending */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-150 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ClockCircleOutlined /> Pending Tasks
            </span>
            <Badge count={pendingTasks.length} showZero style={{ backgroundColor: '#CBD5E1', color: '#475569', fontWeight: 'bold' }} />
          </div>
          <div className="space-y-3">
            {pendingTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-150 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ExclamationCircleOutlined className="text-amber-500" /> In Progress
            </span>
            <Badge count={inProgressTasks.length} showZero style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontWeight: 'bold' }} />
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-150 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircleOutlined className="text-emerald-500" /> Completed
            </span>
            <Badge count={completedTasks.length} showZero style={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 'bold' }} />
          </div>
          <div className="space-y-3">
            {completedTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>

      </div>

      {/* ===================== ADD TASK MODAL ===================== */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        title={<span className="font-bold text-slate-800 dark:text-white text-base">Add Checklist Task</span>}
        className="documents-modal"
      >
        <Form form={taskForm} layout="vertical" onFinish={handleAddTask}>
          <Form.Item name="title" label={<span className="text-xs font-semibold text-slate-500">Task Title</span>} rules={[{ required: true, message: 'Enter task title' }]}>
            <Input placeholder="e.g. Call plan manager to request funding update" />
          </Form.Item>

          <Form.Item name="patientName" label={<span className="text-xs font-semibold text-slate-500">Patient / Client</span>} rules={[{ required: true }]}>
            <Select placeholder="Select patient..." className="rounded-xl flex items-center">
              {store.patients.map(p => (
                <Option key={p.id} value={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label={<span className="text-xs font-semibold text-slate-500">Category Type</span>} rules={[{ required: true }]}>
              <Select placeholder="Choose category...">
                <Option value="Follow-Up Required">Follow-Up Required</Option>
                <Option value="Report Due">Report Due</Option>
                <Option value="Funding Review Due">Funding Review Due</Option>
                <Option value="Referral Required">Referral Required</Option>
              </Select>
            </Form.Item>

            <Form.Item name="dueDate" label={<span className="text-xs font-semibold text-slate-500">Due Date</span>} rules={[{ required: true }]}>
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Divider className="my-4" />

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold text-white">
                Create Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
