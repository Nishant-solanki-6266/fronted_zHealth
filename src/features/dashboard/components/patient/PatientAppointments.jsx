import React, { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Space, Select, DatePicker, TimePicker, Input } from 'antd'
import { CalendarOutlined, VideoCameraOutlined, PlusOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

const { Option } = Select

export default function PatientAppointments() {
  const [telehealthOpen, setTelehealthOpen] = useState(false)
  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [activeCall, setActiveCall] = useState(false)

  const [appointmentsList, setAppointmentsList] = useState([
    { id: 'app_1', date: '2026-06-19', time: '10:00 AM', practitioner: 'Dr. Sarah Jenkins', clinic: 'Melbourne Allied Health', type: 'Initial Physiotherapy Assessment', funding: 'NDIS', status: 'Upcoming' },
    { id: 'app_2', date: '2026-06-26', time: '11:30 AM', practitioner: 'Dr. Emily Smith', clinic: 'Sydney Allied Hub', type: 'Speech Pathology Review', funding: 'EPC', status: 'Upcoming' },
    { id: 'app_3', date: '2026-05-12', time: '09:00 AM', practitioner: 'Dr. Sarah Jenkins', clinic: 'Melbourne Allied Health', type: 'MSK Progress Review', funding: 'Private', status: 'Completed' },
    { id: 'app_4', date: '2026-04-18', time: '02:00 PM', practitioner: 'Dr. James Carter', clinic: 'Melbourne Allied Health', type: 'OT Assessment', funding: 'WorkCover', status: 'Completed' },
    { id: 'app_5', date: '2026-03-05', time: '10:00 AM', practitioner: 'Dr. Sarah Jenkins', clinic: 'Melbourne Allied Health', type: 'Calf Strength Exercise Session', funding: 'NDIS', status: 'Missed' }
  ])

  const handleBookSubmit = (e) => {
    e.preventDefault()
    toast.success('Appointment booking request submitted! Awaiting clinic confirmation.')
    setBookModalOpen(false)
  }

  const handleRescheduleClick = (app) => {
    setSelectedApp(app)
    setRescheduleModalOpen(true)
  }

  const submitReschedule = (e) => {
    e.preventDefault()
    toast.success(`Reschedule request sent for appointment with ${selectedApp?.practitioner}.`)
    setRescheduleModalOpen(false)
  }

  const handleCancelClick = (app) => {
    setSelectedApp(app)
    setCancelModalOpen(true)
  }

  const submitCancel = () => {
    if(selectedApp) {
      setAppointmentsList(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: 'Cancelled' } : a))
      toast.error(`Appointment cancelled.`)
    }
    setCancelModalOpen(false)
  }

  const upcomingApps = appointmentsList.filter(a => a.status === 'Upcoming')
  const pastApps = appointmentsList.filter(a => a.status !== 'Upcoming')

  return (
    <div className="space-y-6">
      
      {/* Header and Booking Button */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">My Healthcare Bookings</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              Manage your schedule, request reschedules, and join secure telehealth consultations.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setBookModalOpen(true)}
            style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
            className="rounded-xl font-bold text-xs h-9 text-white"
          >
            Book New Appointment
          </Button>
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">Upcoming Appointments</span>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingApps.map(app => (
            <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase font-bold block">Session Schedule</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block">{app.date} @ {app.time}</span>
                </div>
                <Tag color="purple" className="m-0 border-none rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase">{app.funding}</Tag>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">Practitioner</span>
                  <span className="text-slate-700 dark:text-slate-300">{app.practitioner}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">Clinic Location</span>
                  <span className="text-slate-700 dark:text-slate-300">{app.clinic}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-400 block font-bold">Appointment Type</span>
                  <span className="text-slate-700 dark:text-slate-300">{app.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-150 dark:border-slate-800/80">
                <Button 
                  size="small" 
                  icon={<VideoCameraOutlined />} 
                  onClick={() => setTelehealthOpen(true)}
                  className="rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100 h-8"
                >
                  Join Telehealth
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleRescheduleClick(app)}
                  className="rounded-lg text-[10px] font-semibold h-8 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                >
                  Reschedule
                </Button>
                <Button 
                  size="small" 
                  danger 
                  onClick={() => handleCancelClick(app)}
                  className="rounded-lg text-[10px] font-semibold h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Past/History Appointments */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-705 dark:text-slate-305">Booking History & Past Care Sessions</span>}>
        <Table
          dataSource={pastApps}
          rowKey="id"
          pagination={false}
          scroll={{ x: 700 }}
          className="border-none"
          columns={[
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>,
              render: (_, rec) => <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">{rec.date} <span className="text-slate-400 text-[10px]">{rec.time}</span></span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Practitioner</span>,
              dataIndex: 'practitioner',
              render: (p) => <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">{p}</span>
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic & Service</span>,
              render: (_, rec) => (
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs block">{rec.type}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{rec.clinic}</span>
                </div>
              )
            },
            {
              title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</span>,
              dataIndex: 'status',
              render: (s) => (
                <Tag color={s === 'Completed' ? 'success' : s === 'Cancelled' ? 'default' : 'error'} className="rounded-full border-none font-bold text-[9px] px-2.5 py-0.5">
                  {s}
                </Tag>
              )
            }
          ]}
        />
      </Card>

      {/* Book Appointment Modal */}
      <Modal
        open={bookModalOpen}
        onCancel={() => setBookModalOpen(false)}
        title={<span className="font-bold text-slate-800 dark:text-white text-base">Request Booking</span>}
        footer={null}
        destroyOnHidden
      >
        <form onSubmit={handleBookSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Clinic & Practitioner</label>
            <Select placeholder="Choose Provider" className="w-full rounded-xl" defaultValue="sarah">
              <Option value="sarah">Dr. Sarah Jenkins (Physiotherapist) @ Melbourne Allied Health</Option>
              <Option value="emily">Dr. Emily Smith (Speech Pathologist) @ Sydney Allied Hub</Option>
              <Option value="james">Dr. James Carter (OT) @ Melbourne Allied Health</Option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preferred Date</label>
              <DatePicker className="w-full rounded-xl h-9" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preferred Time</label>
              <TimePicker format="HH:mm" className="w-full rounded-xl h-9" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notes / Care Priorities</label>
            <Input.TextArea placeholder="Enter any symptoms or requests..." rows={3} className="rounded-xl" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setBookModalOpen(false)} className="rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold text-xs text-white">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Telehealth Consultation Modal */}
      <Modal
        open={telehealthOpen}
        onCancel={() => {
          setTelehealthOpen(false)
          setActiveCall(false)
        }}
        title={<span className="font-bold text-slate-800 dark:text-white text-base">ZealthOS Secure Telehealth Portal</span>}
        footer={null}
        width={750}
        destroyOnHidden
      >
        <div className="p-4 rounded-2xl bg-slate-950 text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden">
          {!activeCall ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
              <VideoCameraOutlined style={{ fontSize: 50, color: '#10B981' }} />
              <div className="text-center">
                <h3 className="text-white font-extrabold text-base m-0">Join Consult: Dr. Sarah Jenkins</h3>
                <p className="text-slate-400 text-xs mt-1">Initial Physiotherapy Assessment - NDIS Care Program</p>
              </div>
              <Button 
                type="primary" 
                onClick={() => setActiveCall(true)}
                className="bg-emerald-500 border-none rounded-xl font-bold h-10 px-6 text-white text-xs hover:bg-emerald-600 transition-colors"
              >
                Join Video Call Now
              </Button>
            </div>
          ) : (
            <>
              {/* Active Video Screen simulation */}
              <div className="flex-1 bg-slate-900 rounded-xl relative flex items-center justify-center min-h-[300px]">
                <div className="absolute top-3 left-3 bg-slate-950/80 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>SECURE HD CALL</span>
                </div>
                
                {/* Doctor mock stream */}
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500 overflow-hidden mx-auto">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Sarah" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-xs block text-slate-200">Dr. Sarah Jenkins (Physiotherapist)</span>
                  <span className="text-[10px] text-slate-500 block">Connected</span>
                </div>

                {/* Self preview stream */}
                <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-800 font-bold">
                    You (John)
                  </div>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex justify-center gap-3 pt-3 border-t border-slate-850">
                <Button 
                  danger 
                  onClick={() => setActiveCall(false)}
                  className="rounded-full font-bold h-10 w-28 text-white border-none bg-rose-600 hover:bg-rose-700"
                >
                  End Call
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>



      {/* Reschedule Modal */}
      <Modal
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        title={<span className="font-bold text-slate-800 dark:text-white text-base">Reschedule Appointment</span>}
        footer={null}
        destroyOnHidden
      >
        <form onSubmit={submitReschedule} className="space-y-4 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 text-xs">
            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Current Appointment</span>
            <span className="block font-bold text-slate-700 dark:text-slate-200">{selectedApp?.date} @ {selectedApp?.time}</span>
            <span className="block text-slate-500">{selectedApp?.practitioner} ({selectedApp?.type})</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Preferred Date</label>
              <DatePicker className="w-full rounded-xl h-9" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Preferred Time</label>
              <TimePicker format="HH:mm" className="w-full rounded-xl h-9" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Reschedule</label>
            <Input.TextArea placeholder="Optional..." rows={2} className="rounded-xl" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setRescheduleModalOpen(false)} className="rounded-xl font-bold border-slate-200">Close</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }} className="rounded-xl font-bold text-xs text-white">Request Reschedule</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        title={<span className="font-bold text-rose-600 text-base">Cancel Appointment?</span>}
        footer={null}
        destroyOnHidden
      >
        <div className="space-y-4 pt-2">
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed m-0">
            Are you sure you want to cancel your appointment with <strong>{selectedApp?.practitioner}</strong> on <strong>{selectedApp?.date}</strong>?
          </p>
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-[10px] font-semibold">
            Note: Cancellations made within 24 hours of the appointment may incur a cancellation fee as per clinic policy.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setCancelModalOpen(false)} className="rounded-xl font-bold border-slate-200 dark:border-slate-700">Keep Appointment</Button>
            <Button danger onClick={submitCancel} className="rounded-xl font-bold text-xs">Yes, Cancel It</Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
