import React, { useState, useEffect } from 'react'
import { Card, Progress, Timeline, Tag, Tabs, Input, Select, Button, Modal, Form, Spin, Empty, Popconfirm } from 'antd'
import { FieldTimeOutlined, SafetyCertificateOutlined, TrophyOutlined, SearchOutlined, FilterOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import api from '../../../../api/axios'
import PatientExercises from './PatientExercises'

const { Option } = Select

export default function PatientTreatmentPlans() {
  const [loading, setLoading] = useState(false)
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modal State for Add/Edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [form] = Form.useForm()

  const fetchTreatmentPlans = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/patient/treatment-plans', {
        params: { search: searchTerm, status: statusFilter }
      })
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTreatmentPlans(res.data.data)
      }
    } catch (err) {
      console.warn('Treatment plans API fetch fallback notice:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTreatmentPlans()
  }, [searchTerm, statusFilter])

  const getTimelineColor = (status) => {
    switch (status) {
      case 'Completed': return 'green'
      case 'Active': return 'blue'
      default: return 'gray'
    }
  }

  const handleOpenAddModal = () => {
    setEditingPlan(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan)
    form.setFieldsValue({
      condition: plan.condition,
      practitioner: plan.practitioner,
      stage: plan.stage,
      overallProgress: plan.overallProgress,
      status: plan.status || 'Active'
    })
    setModalOpen(true)
  }

  const handleDeletePlan = async (id) => {
    try {
      const res = await api.delete(`/api/patient/treatment-plans/${id}`)
      if (res.data?.success) {
        toast.success('Treatment plan removed successfully')
        fetchTreatmentPlans()
      }
    } catch (err) {
      toast.error('Failed to delete treatment plan')
    }
  }

  const handleSavePlan = async (values) => {
    try {
      if (editingPlan) {
        const res = await api.put(`/api/patient/treatment-plans/${editingPlan.id}`, values)
        if (res.data?.success) {
          toast.success('Treatment plan updated successfully!')
        }
      } else {
        const res = await api.post('/api/patient/treatment-plans', {
          ...values,
          goals: [
            { id: 'g1', title: 'Initial Pain Management & Mobility', percent: 40, status: 'Active' },
            { id: 'g2', title: 'Functional Rehabilitation Exercises', percent: 20, status: 'Active' }
          ],
          timeline: [
            { id: 't1', label: 'Initial Assessment & Goal Setting', date: 'Today', desc: 'Baseline evaluation conducted.', status: 'Active' },
            { id: 't2', label: 'Progress Review Milestone', date: 'Expected: 30 Days', desc: 'Clinical progress audit.', status: 'Pending' }
          ]
        })
        if (res.data?.success) {
          toast.success('New Treatment Plan added successfully!')
        }
      }
      setModalOpen(false)
      form.resetFields()
      fetchTreatmentPlans()
    } catch (err) {
      toast.error('Failed to save treatment plan')
    }
  }

  return (
    <div className="space-y-6">
      <Tabs 
        defaultActiveKey="programs"
        className="[&_.ant-tabs-nav]:mb-6"
        items={[
          {
            key: 'programs',
            label: <span className="font-bold">Active Programs</span>,
            children: (
              <div className="space-y-6">
                {/* Intro Header & Search/Filter Controls */}
                <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white m-0">My Clinical Treatment Programs</h2>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
                        Track active rehabilitation plan stages, shared clinical targets, and care program milestones.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <Input
                        placeholder="Search condition / doctor..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-xl text-xs w-full sm:w-48"
                        allowClear
                      />
                      <Select
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        className="w-32 text-xs"
                      >
                        <Option value="ALL">All Status</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Completed">Completed</Option>
                      </Select>
                      <Tag color="purple" className="rounded-full border-none font-bold text-[10px] px-3.5 py-1 uppercase">
                        <TrophyOutlined className="mr-1" />
                        Active Care Plan
                      </Tag>
                    </div>
                  </div>
                </Card>

                {loading ? (
                  <div className="text-center py-12">
                    <Spin size="large" description="Loading treatment plans..." />
                  </div>
                ) : treatmentPlans.length === 0 ? (
                  <Card className="text-center py-8 rounded-2xl">
                    <Empty description="No treatment plans found matching filters." />
                  </Card>
                ) : (
                  treatmentPlans.map((plan, idx) => (
                    <div key={plan.id || idx} className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '24px' }}>
                      
                      {/* Active Treatment Card and Goals list */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Treatment plan summary */}
                        <Card 
                          className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 relative"
                          extra={
                            <div className="flex items-center gap-2">
                              <Button 
                                type="text" 
                                size="small" 
                                icon={<EditOutlined className="text-slate-400 hover:text-purple-600" />}
                                onClick={() => handleOpenEditModal(plan)}
                              />
                              <Popconfirm
                                title="Are you sure you want to delete this treatment plan?"
                                onConfirm={() => handleDeletePlan(plan.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button 
                                  type="text" 
                                  size="small" 
                                  danger 
                                  icon={<DeleteOutlined />}
                                />
                              </Popconfirm>
                            </div>
                          }
                        >
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Assigned Condition / Program</span>
                              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm m-0 mt-0.5">{plan.condition}</h3>
                              <span className="text-slate-450 dark:text-slate-400 text-xs block mt-1 font-semibold">Directed by: {plan.practitioner}</span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Current Active Stage</span>
                                <span className="text-slate-800 dark:text-slate-200 font-bold text-xs">{plan.stage}</span>
                              </div>
                              <Tag color={plan.status === 'Completed' ? 'green' : 'blue'} className="rounded-full font-bold text-[9px] uppercase px-2.5">
                                {plan.status || 'Active'}
                              </Tag>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-2">Overall Program Progress</span>
                              <div className="flex items-center gap-3">
                                <Progress percent={plan.overallProgress || 0} strokeColor="#8C4BFF" className="flex-1 m-0" />
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Goal Tracking Indicators */}
                        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" style={{ marginTop: '24px' }} title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">Goal Tracking & Adherence Indicators</span>}>
                          <div className="space-y-5">
                            {Array.isArray(plan.goals) && plan.goals.map((g, gIdx) => (
                              <div key={gIdx} className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                                  <span>{g.title}</span>
                                  <span className="text-[#8C4BFF]">{g.percent}% Complete</span>
                                </div>
                                <Progress percent={g.percent} size="small" strokeColor={{ '0%': '#30D2BE', '100%': '#8C4BFF' }} showInfo={false} />
                              </div>
                            ))}
                          </div>
                        </Card>

                      </div>

                      {/* Treatment timeline milestones */}
                      <div className="lg:col-span-1">
                        <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 h-full" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">Care Program Milestones & Timeline</span>}>
                          <Timeline className="mt-3">
                            {Array.isArray(plan.timeline) && plan.timeline.map((item, tIdx) => (
                              <Timeline.Item key={tIdx} color={getTimelineColor(item.status)}>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.label}</span>
                                    {item.status === 'Active' && <Tag color="blue" className="rounded-full text-[8px] font-bold border-none px-2 py-0.2 uppercase m-0">Active</Tag>}
                                  </div>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block"><FieldTimeOutlined className="mr-1" />{item.date}</span>
                                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 mb-0 italic">{item.desc}</p>
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </Card>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )
          },
          {
            key: 'exercises',
            label: <span className="font-bold">Prescribed Exercises</span>,
            children: <PatientExercises />
          }
        ]}
      />

      {/* Add / Edit Treatment Plan Modal */}
      <Modal
        title={<span className="font-bold">{editingPlan ? 'Edit Treatment Plan' : 'Add New Treatment Plan'}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSavePlan} className="mt-4">
          <Form.Item name="condition" label="Assigned Condition / Program" rules={[{ required: true, message: 'Please enter condition' }]}>
            <Input placeholder="e.g. Lumbar Disc Rehabilitation" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="practitioner" label="Directed Practitioner" rules={[{ required: true, message: 'Please enter practitioner name' }]}>
            <Input placeholder="e.g. Dr. Sarah Jenkins (Physiotherapist)" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="stage" label="Current Active Stage" rules={[{ required: true, message: 'Please enter active stage' }]}>
            <Input placeholder="e.g. Phase 2: Lumbar Mobilisation" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="overallProgress" label="Overall Progress (%)" rules={[{ required: true, message: 'Please enter progress percentage' }]}>
            <Input type="number" min={0} max={100} placeholder="e.g. 65" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="status" label="Program Status">
            <Select className="rounded-lg">
              <Option value="Active">Active</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setModalOpen(false)} className="rounded-lg font-bold">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-lg font-bold">
              Save Plan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
