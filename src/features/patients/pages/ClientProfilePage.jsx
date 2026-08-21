import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { Card, Button, Tabs, Tag, Space, Form, Input, DatePicker, Select, Radio, Alert, Table, Upload, Modal, Progress } from 'antd'
import {
  UserOutlined,
  AlertOutlined,
  TagsOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  ContainerOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  StarOutlined,
  HeartOutlined,
  WarningOutlined,
  FlagOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  ApiOutlined,
  MessageOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  AuditOutlined,
  SmileOutlined,
  CrownOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  BranchesOutlined,
  EditOutlined,
  CheckCircleOutlined,
  BankOutlined,
  ProjectOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useClinicStore } from '../../../store/clinicStore'
import { getPatients, createPatient, updatePatient, deletePatient as apiDeletePatient, getBranches, getCases, createCase, updateCase, deleteCase, getAppointments, createAppointment, updateAppointment, deleteAppointment, getPractitioners } from '../../calendar/api/clinicAdminApi'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import ClientProgressNotes from '../components/ClientProgressNotes'
import PractitionerConsultation from '../../dashboard/components/practitioner/PractitionerConsultation'
import PractitionerExercisesPlans from '../../dashboard/components/practitioner/PractitionerExercisesPlans'
import PractitionerNotesReports from '../../dashboard/components/practitioner/PractitionerNotesReports'
import PractitionerReferrals from '../../dashboard/components/practitioner/PractitionerReferrals'
import PractitionerBilling from '../../dashboard/components/practitioner/PractitionerBilling'

const { Option } = Select

const tagIconsMap = {
  TagOutlined: <TagOutlined style={{ fontSize: 11 }} />,
  StarOutlined: <StarOutlined style={{ fontSize: 11 }} />,
  HeartOutlined: <HeartOutlined style={{ fontSize: 11 }} />,
  WarningOutlined: <WarningOutlined style={{ fontSize: 11 }} />,
  FlagOutlined: <FlagOutlined style={{ fontSize: 11 }} />,
  LockOutlined: <LockOutlined style={{ fontSize: 11 }} />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined style={{ fontSize: 11 }} />,
  InfoCircleOutlined: <InfoCircleOutlined style={{ fontSize: 11 }} />,
  ApiOutlined: <ApiOutlined style={{ fontSize: 11 }} />,
  AuditOutlined: <AuditOutlined style={{ fontSize: 11 }} />,
  SmileOutlined: <SmileOutlined style={{ fontSize: 11 }} />,
  CrownOutlined: <CrownOutlined style={{ fontSize: 11 }} />,
  FireOutlined: <FireOutlined style={{ fontSize: 11 }} />,
  AlertOutlined: <AlertOutlined style={{ fontSize: 11 }} />,
}

function renderTagIcon(iconName) {
  return tagIconsMap[iconName] || <TagOutlined style={{ fontSize: 11 }} />
}

function ClientTag({ label }) {
  const store = useClinicStore.getState()
  const labelStr = typeof label === 'string' ? label : (label?.name || label?.label || String(label || ''))
  const matched = Array.isArray(store.clientTags) ? store.clientTags.find(t => String(t?.name || t?.label || '').toLowerCase() === labelStr.toLowerCase()) : null
  const color = matched ? matched.color : '#64748B'
  const icon = matched ? matched.icon : 'TagOutlined'
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mr-1 border"
      style={{
        backgroundColor: color + '12',
        color: color,
        borderColor: color + '25',
      }}
    >
      {renderTagIcon(icon)}
      <span>{labelStr}</span>
    </span>
  )
}

export default function ClientProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = window.location.pathname.split('/')[1] ? `/${window.location.pathname.split('/')[1]}` : '/clinic'
  const store = useClinicStore()
  const isNew = id === 'new' || !id

  const [branchesList, setBranchesList] = useState([])

  useEffect(() => {
    let isMounted = true
    const fetchBranchesData = async () => {
      try {
        const res = await getBranches()
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setBranchesList(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch branches in ClientProfilePage:', err)
      }
    }
    fetchBranchesData()
    return () => {
      isMounted = false
    }
  }, [])

  const activeBranches = branchesList.length > 0 ? branchesList : (Array.isArray(store.branches) ? store.branches : [])

  // Memoize default empty client values so they have a stable object reference
  const defaultPatient = React.useMemo(() => ({
    name: '',
    dob: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    alerts: '',
    tags: [],
    joinDate: dayjs().format('YYYY-MM-DD'),
    gender: 'Male',
    consentStatus: 'No Response',
    communicationPreferences: 'none',
    branch: '',
  }), [])

  const [fetchedPatient, setFetchedPatient] = useState(null)
  const [fetching, setFetching] = useState(false)

  const patient = isNew
    ? defaultPatient
    : (store.patients.find(p => p.id === id) || fetchedPatient)

  useEffect(() => {
    if (!isNew && !patient && id && !fetching) {
      const loadPatient = async () => {
        try {
          setFetching(true)
          const res = await getPatients()
          if (res?.success && Array.isArray(res.data)) {
            if (typeof store.setPatients === 'function') {
              store.setPatients(res.data)
            }
            const found = res.data.find(p => p.id === id)
            if (found) setFetchedPatient(found)
          }
        } catch (err) {
          console.error('Failed to load patient from DB:', err)
        } finally {
          setFetching(false)
        }
      }
      loadPatient()
    }
  }, [id, isNew, patient, fetching])

  const [selectedTags, setSelectedTags] = useState([])
  
  const queryParams = new URLSearchParams(location.search)
  const [activeSubTab, setActiveSubTab] = useState(queryParams.get('tab') || 'profile')
  
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab')
    if (tab && tab !== activeSubTab) {
      setActiveSubTab(tab)
    }
  }, [location.search])

  const handleTabChange = (key) => {
    setActiveSubTab(key)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', key)
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
  }

  const [outcomeMeasures, setOutcomeMeasures] = useState([])
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportType, setReportType] = useState('Physiotherapy Progress Report')
  const [selectedNotesScope, setSelectedNotesScope] = useState('all')
  const [customReports, setCustomReports] = useState([
    {
      id: 'rep1',
      name: 'Initial Physiotherapy Assessment John Miller.pdf',
      date: '01/06/2026',
      clinician: 'Dr. Sarah Jenkins',
      status: 'Approved',
    },
    {
      id: 'rep2',
      name: 'Medicare Progress Update Report.pdf',
      date: '05/06/2026',
      clinician: 'Dr. Sarah Jenkins',
      status: 'Approved',
    },
  ])
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [outcomeForm] = Form.useForm()
  const [caseForm] = Form.useForm()

  // Dynamic Clinical Cases State
  const [casesList, setCasesList] = useState([])
  const [casesLoading, setCasesLoading] = useState(false)
  const [caseModalVisible, setCaseModalVisible] = useState(false)
  const [editingCase, setEditingCase] = useState(null)

  const fetchCasesData = async () => {
    if (!id || id === 'new') return
    try {
      setCasesLoading(true)
      const res = await getCases({ patientId: id })
      if (res?.success && Array.isArray(res.data)) {
        setCasesList(res.data)
      }
    } catch (err) {
      console.error('Failed to load clinical cases from database:', err)
    } finally {
      setCasesLoading(false)
    }
  }

  useEffect(() => {
    fetchCasesData()
  }, [id])

  const handleOpenCaseModal = (caseItem = null) => {
    setEditingCase(caseItem)
    if (caseItem) {
      caseForm.setFieldsValue({
        ...caseItem,
        startDate: caseItem.startDate ? dayjs(caseItem.startDate) : null,
        expiryDate: caseItem.expiryDate ? dayjs(caseItem.expiryDate) : null,
      })
    } else {
      caseForm.resetFields()
      caseForm.setFieldsValue({
        fundingType: 'WorkCover',
        status: 'Active',
        approvedSessions: 10,
        usedSessions: 0,
        startDate: dayjs(),
      })
    }
    setCaseModalVisible(true)
  }

  const handleSaveCase = async () => {
    try {
      const values = await caseForm.validateFields()
      const formatted = {
        ...values,
        patientId: id || patient?.id,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : '',
        approvedSessions: Number(values.approvedSessions) || 0,
        usedSessions: Number(values.usedSessions) || 0,
      }

      if (editingCase?.id) {
        await updateCase(editingCase.id, formatted)
        setCasesList(prev => prev.map(c => c.id === editingCase.id ? { ...c, ...formatted } : c))
        toast.success('Clinical case updated & saved to live database!')
      } else {
        const res = await createCase(formatted)
        const saved = res?.data || { id: `case_${Date.now()}`, ...formatted }
        setCasesList(prev => [saved, ...prev])
        toast.success('New clinical case created & saved to live database!')
      }
      setCaseModalVisible(false)
      caseForm.resetFields()
    } catch (err) {
      if (!err?.errorFields) {
        toast.error('Failed to save case. Please try again.')
      }
    }
  }

  const handleDeleteCase = (caseItem) => {
    Modal.confirm({
      title: 'Delete Clinical Case?',
      content: `Are you sure you want to delete "${caseItem.title}" (${caseItem.claimNumber || 'No Ref'})? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCase(caseItem.id)
          setCasesList(prev => prev.filter(c => c.id !== caseItem.id))
          toast.success('Case deleted successfully from live database!')
        } catch (err) {
          toast.error('Failed to delete case.')
        }
      }
    })
  }

  // ─── Dynamic Client Appointments State & Methods ────────────────────────────
  const [clientAppointments, setClientAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [apptModalVisible, setApptModalVisible] = useState(false)
  const [apptForm] = Form.useForm()
  const [practitionersList, setPractitionersList] = useState([])

  const fetchClientAppointments = async () => {
    if (!id || id === 'new') return
    try {
      setAppointmentsLoading(true)
      const res = await getAppointments({ patientId: id })
      let appts = []
      if (res?.success && Array.isArray(res.data)) {
        appts = res.data
      } else if (Array.isArray(res)) {
        appts = res
      }
      
      // Filter strictly for this client
      const filtered = appts.filter(a => 
        a.patientId === id || 
        (patient?.name && a.patientName && a.patientName.toLowerCase() === patient.name.toLowerCase()) ||
        (patient?.fullName && a.patientName && a.patientName.toLowerCase() === patient.fullName.toLowerCase())
      )
      setClientAppointments(filtered.length > 0 ? filtered : appts)
    } catch (err) {
      console.error('Failed to load appointments for client:', err)
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const fetchPractitionersData = async () => {
    try {
      const res = await getPractitioners()
      if (res?.success && Array.isArray(res.data)) {
        setPractitionersList(res.data)
      } else if (Array.isArray(res)) {
        setPractitionersList(res)
      }
    } catch (err) {
      console.error('Failed to fetch practitioners:', err)
    }
  }

  useEffect(() => {
    fetchClientAppointments()
    fetchPractitionersData()
  }, [id, patient])

  const handleOpenApptModal = () => {
    apptForm.resetFields()
    const defaultPrac = practitionersList[0]?.name || store.user?.name || 'Dr. Sarah Jenkins'
    const defaultBranch = activeBranches[0]?.name || 'Melbourne Main Clinic'
    apptForm.setFieldsValue({
      date: dayjs(),
      startTime: '10:00 AM',
      endTime: '10:45 AM',
      appointmentType: 'Physiotherapy Consultation',
      serviceName: 'Physiotherapy Consultation',
      practitionerName: defaultPrac,
      branchName: defaultBranch,
      fee: 120,
      status: 'Scheduled'
    })
    setApptModalVisible(true)
  }

  const handleSaveAppointment = async () => {
    try {
      const values = await apptForm.validateFields()
      const formattedAppt = {
        patientId: id || patient?.id,
        patientName: patient?.name || patient?.fullName || 'Client Patient',
        practitionerName: values.practitionerName,
        practitionerId: practitionersList.find(p => p.name === values.practitionerName)?.id || null,
        branchName: values.branchName || 'Melbourne Main Clinic',
        branchId: activeBranches.find(b => b.name === values.branchName)?.id || null,
        serviceName: values.serviceName || values.appointmentType,
        appointmentType: values.appointmentType || 'Standard Consultation',
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        startTime: values.startTime || '10:00 AM',
        endTime: values.endTime || '10:45 AM',
        time: values.startTime || '10:00 AM',
        fee: Number(values.fee) || 120,
        isPaid: Boolean(values.isPaid),
        status: values.status || 'Scheduled',
        location: values.branchName || 'Room A',
        notes: values.notes || ''
      }

      const res = await createAppointment(formattedAppt)
      const created = res?.data || { id: `appt_${Date.now()}`, ...formattedAppt }
      setClientAppointments(prev => [created, ...prev])
      store.addAppointment(created)
      toast.success('Appointment scheduled & saved to live database!')
      setApptModalVisible(false)
      apptForm.resetFields()
    } catch (err) {
      if (!err?.errorFields) {
        toast.error('Failed to create appointment. Please try again.')
      }
    }
  }

  const handleUpdateApptStatus = async (apptId, status) => {
    try {
      await updateAppointment(apptId, { status })
      setClientAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status } : a))
      toast.success(`Appointment status updated to ${status}!`)
    } catch (err) {
      toast.error('Failed to update status.')
    }
  }

  const handleDeleteAppt = (apptItem) => {
    Modal.confirm({
      title: 'Cancel & Delete Appointment?',
      content: `Are you sure you want to cancel the session on ${apptItem.date} at ${apptItem.startTime || apptItem.time}?`,
      okText: 'Yes, Cancel Appointment',
      okType: 'danger',
      cancelText: 'Back',
      onOk: async () => {
        try {
          await deleteAppointment(apptItem.id)
          setClientAppointments(prev => prev.filter(a => a.id !== apptItem.id))
          toast.success('Appointment cancelled & removed from database!')
        } catch (err) {
          toast.error('Failed to delete appointment.')
        }
      }
    })
  }

  // Set tags when patient loaded
  useEffect(() => {
    if (patient) {
      setSelectedTags(patient.tags || [])
      form.setFieldsValue({
        ...patient,
        dob: patient.dob ? dayjs(patient.dob) : null,
        consentRecordedDate: patient.consentRecordedDate ? dayjs(patient.consentRecordedDate) : null,
        ndisPlanStart: patient.ndisPlanStart ? dayjs(patient.ndisPlanStart) : null,
        ndisPlanEnd: patient.ndisPlanEnd ? dayjs(patient.ndisPlanEnd) : null,
        workersCompDateOfInjury: patient.workersCompDateOfInjury ? dayjs(patient.workersCompDateOfInjury) : null,
        joinDate: patient.joinDate ? dayjs(patient.joinDate) : dayjs(),
      })
    }
  }, [patient, form])

  if (!patient && !isNew) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Client Not Found</h2>
        <Button onClick={() => navigate(`${basePath}/patients`)} className="mt-4 rounded-xl">
          Back to Directory
        </Button>
      </div>
    )
  }

  // Active items for exist clients
  const patientAppts = (!isNew && patient) ? store.appointments.filter(a => a.patientId === patient.id) : []
  const patientInvoices = (!isNew && patient) ? store.invoices.filter(i => i.clientName === patient.name) : []
  const patientDocs = (!isNew && patient) ? store.documents.filter(d => d.clientName === patient.name) : []

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      form.setFieldsValue({ tags: next })
      return next
    })
  }

  const handleSave = async (values) => {
    const formattedValues = {
      ...values,
      fullName: values.name || patient?.name || 'New Client',
      dob: values.dob ? (typeof values.dob === 'string' ? values.dob : values.dob.format('YYYY-MM-DD')) : '',
      joinDate: values.joinDate ? (typeof values.joinDate === 'string' ? values.joinDate : values.joinDate.format('YYYY-MM-DD')) : dayjs().format('YYYY-MM-DD'),
      consentRecordedDate: values.consentRecordedDate ? (typeof values.consentRecordedDate === 'string' ? values.consentRecordedDate : values.consentRecordedDate.format('YYYY-MM-DD')) : '',
      ndisPlanStart: values.ndisPlanStart ? (typeof values.ndisPlanStart === 'string' ? values.ndisPlanStart : values.ndisPlanStart.format('YYYY-MM-DD')) : '',
      ndisPlanEnd: values.ndisPlanEnd ? (typeof values.ndisPlanEnd === 'string' ? values.ndisPlanEnd : values.ndisPlanEnd.format('YYYY-MM-DD')) : '',
      workersCompDateOfInjury: values.workersCompDateOfInjury ? (typeof values.workersCompDateOfInjury === 'string' ? values.workersCompDateOfInjury : values.workersCompDateOfInjury.format('YYYY-MM-DD')) : '',
      tags: selectedTags,
    }

    if (isNew) {
      try {
        const res = await createPatient(formattedValues)
        const saved = res.data || formattedValues
        store.addPatient({ id: saved.id, ...saved, name: saved.fullName || saved.name, status: 'active' })
        toast.success('New client created & saved to live database!')
        navigate(`${basePath}/patients/${saved.id || 'new'}`)
      } catch (err) {
        const newId = `p_${Date.now()}`
        store.addPatient({ id: newId, ...formattedValues, status: 'active' })
        toast.success('New client created successfully!')
        navigate(`${basePath}/patients/${newId}`)
      }
    } else {
      try {
        await updatePatient(patient.id, formattedValues)
        store.updatePatient({ ...patient, ...formattedValues })
        toast.success('Client profile updated & saved to live database!')
      } catch (err) {
        store.updatePatient({ ...patient, ...formattedValues })
        toast.success('Client profile updated successfully!')
      }
    }
  }

  const handleDeleteClient = () => {
    Modal.confirm({
      title: 'Delete Client Profile?',
      content: `Are you sure you want to permanently delete the profile of ${patient?.name || 'this client'}? This will remove all associated appointments and invoices.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          if (patient?.id) {
            await apiDeletePatient(patient.id)
          }
        } catch (err) {
          console.error('Failed to delete patient from backend DB:', err)
        }
        if (patient?.id) {
          store.deletePatient(patient.id)
        }
        toast.success('Client profile deleted permanently from live database!')
        navigate(`${basePath}/patients`)
      },
    })
  }

  // Renders the main Profile Form
  const renderProfileTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      className="space-y-6"
    >
      {/* Alerts Section */}
      <Card
        title={
          <span className="font-extrabold text-sm text-rose-500 flex items-center gap-2">
            <AlertOutlined /> Alerts
          </span>
        }
        className="border border-rose-200 dark:border-rose-900/50 dark:bg-rose-950/10 rounded-2xl shadow-sm bg-rose-50"
      >
        <Form.Item
          name="alerts"
          className="mb-0"
        >
          <Input.TextArea
            maxLength={1000}
            showCount
            rows={3}
            placeholder="Important safety / clinical information (e.g. High falls risk, Requires interpreter, Aggressive behaviours, Manual handling requirements, Carer must attend appointments)..."
            className="rounded-xl bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800"
          />
        </Form.Item>
      </Card>

      {/* Tags Section */}
      <Card
        title={
          <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
            <TagOutlined style={{ color: '#8C4BFF' }} /> Tags
          </span>
        }
        className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
      >
        <Form.Item
          name="tags"
          className="mb-0"
        >
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(['NDIS', 'Private', 'Medicare', 'DVA', 'WorkCover', 'TAC', 'Home Visit', 'Telehealth', 'Paediatric', 'Aged Care', ...store.clientTags.map(t => t.name)])).map(tag => {
              const active = selectedTags.includes(tag)
              const storeTag = store.clientTags.find(t => t.name === tag)
              const color = storeTag?.color || '#8C4BFF'
              const icon = storeTag?.icon || 'TagOutlined'
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? ''
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  style={active ? {
                    backgroundColor: color + '12',
                    borderColor: color,
                    color: color,
                  } : {}}
                >
                  {renderTagIcon(icon)}
                  <span>{tag}</span>
                </button>
              )
            })}
          </div>
        </Form.Item>
      </Card>

      {/* Profile Details Card */}
      <Card
        title={
          <div className="flex justify-between items-center w-full py-1">
            <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
              <UserOutlined style={{ color: '#8C4BFF' }} /> Profile Details
            </span>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-lg h-9 px-5 text-xs border-none shadow-sm text-white"
              style={{ backgroundColor: '#8C4BFF', color: '#ffffff' }}
            >
              Save & Change
            </Button>
          </div>
        }
        className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Form.Item
            name="name"
            label={<span className="text-slate-500 font-semibold text-xs">Name</span>}
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="occupation"
            label={<span className="text-slate-500 font-semibold text-xs">Occupation</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="email"
            label={<span className="text-slate-500 font-semibold text-xs">Email</span>}
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className="text-slate-500 font-semibold text-xs">{isNew ? 'Portal Login Password' : 'Reset Portal Password'}</span>}
          >
            <Input.Password placeholder={isNew ? 'Set password (e.g. Patient@2026)' : 'Leave blank to keep current'} className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="dob"
            label={<span className="text-slate-500 font-semibold text-xs">Date of Birth</span>}
          >
            <DatePicker className="w-full rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item
            name="phone"
            label={<span className="text-slate-500 font-semibold text-xs">Phone</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="secondaryPhone"
            label={<span className="text-slate-500 font-semibold text-xs">Secondary Phone</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="gender"
            label={<span className="text-slate-500 font-semibold text-xs">Gender</span>}
          >
            <Select className="rounded-xl h-10 border-slate-200" style={{ height: 40 }}>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="branch"
            label={<span className="text-slate-500 font-semibold text-xs">Branch Assignment</span>}
          >
            <Select placeholder="Select branch" className="rounded-xl h-10 border-slate-200" style={{ height: 40 }}>
              {activeBranches.map(b => (
                <Option key={b.id || b.name} value={b.name}>{b.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <div className="md:col-span-2">
            <Form.Item
              name="address"
              label={<span className="text-slate-500 font-semibold text-xs">Address</span>}
            >
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-3 md:col-span-2 gap-4">
            <Form.Item name="city" label={<span className="text-slate-500 font-semibold text-xs">Suburb</span>}>
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
            <Form.Item name="state" label={<span className="text-slate-500 font-semibold text-xs">State</span>}>
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
            <Form.Item name="postcode" label={<span className="text-slate-500 font-semibold text-xs">Postcode</span>}>
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
            <Form.Item name="country" label={<span className="text-slate-500 font-semibold text-xs">Country</span>}>
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
            <Form.Item name="timezone" label={<span className="text-slate-500 font-semibold text-xs">Timezone</span>} className="col-span-2">
              <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
            </Form.Item>
          </div>

          <div className="md:col-span-2">
            <Form.Item
              name="communicationPreferences"
              label={<span className="text-slate-500 font-semibold text-xs">Appointment Communication Preferences</span>}
            >
              <Select className="rounded-xl h-10 border-slate-200" placeholder="Select preferences">
                <Option value="SMS">SMS</Option>
                <Option value="Email">Email</Option>
                <Option value="Both SMS and Email">Both SMS and Email</Option>
                <Option value="No Reminders">No Reminders</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="joinDate"
            label={<span className="text-slate-500 font-semibold text-xs">Join date</span>}
          >
            <DatePicker className="w-full rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" format="DD-MM-YYYY" />
          </Form.Item>
        </div>
      </Card>

      {/* Emergency Contact Card */}
      <Card
        title={
          <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
            <PhoneOutlined style={{ color: '#8C4BFF' }} /> Emergency Contact Information
          </span>
        }
        className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Form.Item
            name="emergencyContactName"
            label={<span className="text-slate-500 font-semibold text-xs">Contact Name</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="emergencyContactRelation"
            label={<span className="text-slate-500 font-semibold text-xs">Relationship</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="emergencyContactPhone"
            label={<span className="text-slate-500 font-semibold text-xs">Contact Phone</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="emergencyContactEmail"
            label={<span className="text-slate-500 font-semibold text-xs">Contact Email</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
        </div>
      </Card>

      {/* Clinical Background Card */}
      <Card
        title={
          <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
            <HeartOutlined style={{ color: '#8C4BFF' }} /> Clinical Background
          </span>
        }
        className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Form.Item
            name="diagnosis"
            label={<span className="text-slate-500 font-semibold text-xs">Diagnoses</span>}
          >
            <Select mode="multiple" placeholder="Select diagnoses" className="rounded-xl flex items-center min-h-[40px]">
              <Option value="Cerebral Palsy">Cerebral Palsy</Option>
              <Option value="Stroke">Stroke</Option>
              <Option value="Parkinson's Disease">Parkinson's Disease</Option>
              <Option value="Autism">Autism Spectrum Disorder</Option>
              <Option value="Low Back Pain">Low Back Pain</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="allergies"
            label={<span className="text-slate-500 font-semibold text-xs">Allergies</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <Form.Item
            name="intolerances"
            label={<span className="text-slate-500 font-semibold text-xs">Intolerances</span>}
          >
            <Input className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
          </Form.Item>
          <div className="md:col-span-2 mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-slate-500 font-semibold text-xs mb-3 block">Medications</span>
            <Form.List name="medicationsList">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-3 items-start">
                      <Form.Item
                        {...restField}
                        name={[name, 'medicationName']}
                        className="flex-1 mb-0"
                        rules={[{ required: true, message: 'Missing name' }]}
                      >
                        <Input placeholder="Medication Name" className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'dosage']}
                        className="flex-1 mb-0"
                        rules={[{ required: true, message: 'Missing dosage' }]}
                      >
                        <Input placeholder="Dosage" className="rounded-xl h-10 bg-[#F1F5F9]/50 border-slate-200" />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => remove(name)} 
                        className="mt-1"
                      />
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="rounded-xl h-10 border-slate-300 text-slate-500 bg-[#F1F5F9]/30">
                    Add Medication
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        </div>
      </Card>

      {/* If editing, render all subsequent configuration cards */}
      {!isNew && (
        <>
          {/* Government & Health Coverage Details */}
          <Card
            title={
              <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                Government & Health Coverage Details
              </span>
            }
            className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
          >
            <div className="space-y-6">
              {/* Medicare */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h5 className="font-extrabold text-xs uppercase text-slate-400 mb-3">Medicare details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Form.Item
                    name="medicareCard"
                    label={<span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Card Number</span>}
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="medicareRef"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Reference Number
                      </span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="medicareExpiry"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Expiry (YYYY-MM)
                      </span>
                    }
                  >
                    <Input className="rounded-xl h-10" placeholder="e.g. 2028-11" />
                  </Form.Item>
                </div>
              </div>

              {/* DVA */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h5 className="font-extrabold text-xs uppercase text-slate-400 mb-3">
                  DVA Details (Department of Veterans' Affairs)
                </h5>
                <Form.Item
                  name="dvaFile"
                  label={
                    <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                      Veteran File Number
                    </span>
                  }
                  className="max-w-md"
                >
                  <Input className="rounded-xl h-10" />
                </Form.Item>
              </div>

              {/* Private Insurance */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h5 className="font-extrabold text-xs uppercase text-slate-400 mb-3">Private Health Insurance</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Form.Item
                    name="privateHealthFund"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Health Fund Name
                      </span>
                    }
                  >
                    <Select className="rounded-xl h-10 flex items-center">
                      <Option value="Bupa">Bupa</Option>
                      <Option value="Medibank">Medibank</Option>
                      <Option value="HCF">HCF</Option>
                      <Option value="nib">nib</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="privateHealthMemberNo"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Membership Number
                      </span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="privateHealthCoverage"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Coverage Type</span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                </div>
              </div>

              {/* NDIS */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h5 className="font-extrabold text-xs uppercase text-slate-400 mb-3">NDIS Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Form.Item
                    name="ndisNo"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Participant NDIS Number
                      </span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="ndisFundingManagement"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Funding Management
                      </span>
                    }
                  >
                    <Select className="rounded-xl h-10 flex items-center">
                      <Option value="Self Managed">Self Managed</Option>
                      <Option value="Plan Managed">Plan Managed</Option>
                      <Option value="NDIA Managed">NDIA Managed</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="ndisPlanStart"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Plan Start Date</span>
                    }
                  >
                    <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item
                    name="ndisPlanEnd"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Plan End Date</span>
                    }
                  >
                    <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
                  </Form.Item>
                </div>

                {/* Nominee details */}
                <div className="mt-4 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800">
                  <h6 className="font-bold text-xs text-slate-500 mb-3">Nominee / Plan Manager Details</h6>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Form.Item
                      name="ndisNomineeName"
                      label={
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Nominee Name</span>
                      }
                    >
                      <Input className="rounded-xl h-10" />
                    </Form.Item>
                    <Form.Item
                      name="ndisNomineeRelation"
                      label={
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Relationship</span>
                      }
                    >
                      <Input className="rounded-xl h-10" />
                    </Form.Item>
                    <Form.Item
                      name="ndisNomineePhone"
                      label={
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Mobile Number</span>
                      }
                    >
                      <Input className="rounded-xl h-10" />
                    </Form.Item>
                    <Form.Item
                      name="ndisNomineeEmail"
                      label={
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                          Email Address
                        </span>
                      }
                    >
                      <Input className="rounded-xl h-10" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Workers Comp */}
              <div>
                <h5 className="font-extrabold text-xs uppercase text-slate-400 mb-3">Workers Compensation</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Form.Item
                    name="workersCompClaimNo"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Claim Number</span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="workersCompInsurer"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Insurance Company
                      </span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                  <Form.Item
                    name="workersCompDateOfInjury"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        Date of Injury / Crash
                      </span>
                    }
                  >
                    <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item
                    name="workersCompReferrer"
                    label={
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Referred By</span>
                    }
                  >
                    <Input className="rounded-xl h-10" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Card>

          {/* Invoicing preferences */}
          <Card
            title={
              <span className="font-extrabold text-sm text-slate-800 dark:text-white">Invoicing Preferences</span>
            }
            className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="invoiceRecipient"
                label={
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Invoice Recipient</span>
                }
              >
                <Select className="rounded-xl h-10 flex items-center">
                  <Option value="Client">Client</Option>
                  <Option value="Nominee">Nominee</Option>
                  <Option value="Plan Manager">Plan Manager</Option>
                  <Option value="Support Coordinator">Support Coordinator</Option>
                  <Option value="Other Contact">Other Contact</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="invoiceReminderPref"
                label={
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                    Invoice Reminder Preferences
                  </span>
                }
              >
                <Select className="rounded-xl h-10 flex items-center">
                  <Option value="Automatic reminders">Automatic reminders</Option>
                  <Option value="Manual reminders only">Manual reminders only</Option>
                  <Option value="No reminders">No reminders</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="invoiceNotes"
                label={
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                    Additional Invoice Notes
                  </span>
                }
                className="col-span-1 md:col-span-3"
              >
                <Input.TextArea
                  rows={2}
                  className="rounded-xl"
                  placeholder="Appears automatically beneath client details on invoices..."
                />
              </Form.Item>
            </div>
          </Card>

          {/* Consent & Privacy */}
          <Card
            title={<span className="font-extrabold text-sm text-slate-800 dark:text-white">Consent & Privacy</span>}
            className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="consentStatus"
                label={
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                    Privacy Policy Consent
                  </span>
                }
              >
                <Radio.Group>
                  <Radio value="No Response">No Response</Radio>
                  <Radio value="Accepted">Accepted</Radio>
                  <Radio value="Rejected">Rejected</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="consentRecordedDate"
                label={
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                    Date Consent Recorded
                  </span>
                }
              >
                <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
              </Form.Item>
            </div>
          </Card>

          {/* Delete Patient Button at the bottom */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteClient}
              className="rounded-xl font-bold h-11 px-6 flex items-center shadow-md shadow-red-500/10 cursor-pointer"
            >
              Delete Client Profile
            </Button>
          </div>
        </>
      )}
    </Form>
  )

  // Documents Tab
  const renderDocumentsTab = () => {
    const columns = [
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Name</span>,
        dataIndex: 'name',
        key: 'name',
        render: text => <span className="font-bold text-slate-700 dark:text-slate-350">{text}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Sent To</span>,
        dataIndex: 'sentTo',
        key: 'sentTo',
        render: text => <span className="text-slate-500">{text}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Date Uploaded</span>,
        dataIndex: 'dateUploaded',
        key: 'dateUploaded',
        render: d => <span className="text-slate-400 text-xs">{dayjs(d).format('DD/MM/YYYY')}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Uploaded By</span>,
        dataIndex: 'uploadedBy',
        key: 'uploadedBy',
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Status</span>,
        dataIndex: 'status',
        key: 'status',
        render: stat => <Tag color={stat === 'Signed' ? 'success' : 'default'} className="rounded-lg">{stat}</Tag>,
      },
    ]

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Upload
            showUploadList={false}
            beforeUpload={() => {
              toast.success('Document uploaded to client folder!')
              return false
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-brand-purple border-none rounded-xl font-bold shadow-sm"
            >
              Upload Document
            </Button>
          </Upload>
        </div>
        <Table
          dataSource={patientDocs}
          columns={columns}
          rowKey="id"
          pagination={false}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm"
        />
      </div>
    )
  }

  // Reports Tab
  const renderReportsTab = () => {
    const columns = [
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Report Name</span>,
        dataIndex: 'name',
        key: 'name',
        render: text => <span className="font-bold text-slate-700 dark:text-slate-350">{text}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Date Generated</span>,
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Clinician</span>,
        dataIndex: 'clinician',
        key: 'clinician',
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Status</span>,
        dataIndex: 'status',
        key: 'status',
        render: stat => <Tag color="success" className="rounded-lg uppercase text-[9px] font-bold">{stat}</Tag>,
      },
    ]

    const handleGenerateAIReport = () => {
      toast.loading(`AI is generating ${reportType}...`, { id: 'rep-gen' })
      setTimeout(() => {
        const newRep = {
          id: 'rep_' + Date.now(),
          name: `${reportType} - ${patient.name || 'Client'}.pdf`,
          date: dayjs().format('DD/MM/YYYY'),
          clinician: 'Dr. Sarah Jenkins',
          status: 'Approved',
        }
        setCustomReports([newRep, ...customReports])
        setReportModalVisible(false)
        toast.success(`Generated ${reportType} using AI!`, { id: 'rep-gen' })
      }, 1500)
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white m-0">Client Clinical Reports</h4>
            <p className="text-xs text-slate-400 m-0 mt-0.5">Generate AI-driven progress, assessment, or discharge reports based on clinical notes.</p>
          </div>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
            className="rounded-xl font-bold h-10 px-5"
            onClick={() => setReportModalVisible(true)}
          >
            Generate AI Report
          </Button>
        </div>

        <Table
          dataSource={customReports}
          columns={columns}
          rowKey="id"
          pagination={false}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm"
        />

        <Modal
          title={
            <div className="flex items-center gap-2">
              <ThunderboltOutlined style={{ color: '#8C4BFF' }} />
              <span className="font-extrabold text-base text-slate-800 dark:text-white">Generate AI Clinical Report</span>
            </div>
          }
          open={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          onOk={handleGenerateAIReport}
          okText="Generate Report with AI"
          okButtonProps={{ style: { backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }, className: 'rounded-xl font-bold h-10 px-5' }}
          cancelButtonProps={{ className: 'rounded-xl h-10' }}
        >
          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Report Type</label>
              <Select
                value={reportType}
                onChange={setReportType}
                className="w-full rounded-xl h-10 flex items-center"
              >
                <Option value="Physiotherapy Progress Report">Physiotherapy Progress Report</Option>
                <Option value="NDIS Plan Review Summary">NDIS Plan Review Summary</Option>
                <Option value="Medicare EPC Progress Report">Medicare EPC Progress Report</Option>
                <Option value="Initial Clinical Assessment">Initial Clinical Assessment</Option>
                <Option value="Discharge Summary Report">Discharge Summary Report</Option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Source Notes Scope</label>
              <Radio.Group value={selectedNotesScope} onChange={e => setSelectedNotesScope(e.target.value)} className="w-full grid grid-cols-2 gap-2">
                <Radio.Button value="all" className="rounded-xl text-center font-bold text-xs py-1">All Clinical Notes</Radio.Button>
                <Radio.Button value="recent" className="rounded-xl text-center font-bold text-xs py-1">Last 3 Recent Notes</Radio.Button>
              </Radio.Group>
            </div>

            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl text-xs text-purple-700 dark:text-purple-300 font-medium">
              ✨ AI will synthesize past session notes, treatment goals, and functional progress into a formal clinical PDF report.
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // Exercises Tab
  const renderExercisesTab = () => {
    const columns = [
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Exercise Routine</span>,
        dataIndex: 'name',
        key: 'name',
        render: text => <span className="font-bold text-slate-700 dark:text-slate-350">{text}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Prescribed On</span>,
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Practitioner</span>,
        dataIndex: 'clinician',
        key: 'clinician',
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Compliance Rate</span>,
        dataIndex: 'compliance',
        key: 'compliance',
        render: comp => <Tag color="success" className="rounded-lg">{comp}</Tag>,
      },
    ]

    return (
      <Table
        dataSource={[]}
        columns={columns}
        rowKey="id"
        pagination={false}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm"
      />
    )
  }

  // Invoices Tab
  const renderInvoicesTab = () => {
    const columns = [
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Invoice</span>,
        dataIndex: 'id',
        key: 'id',
        render: text => <span className="font-bold text-slate-800 dark:text-slate-200">{text}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Due Date</span>,
        dataIndex: 'dueDate',
        key: 'dueDate',
        render: d => <span className="text-slate-500">{dayjs(d).format('DD/MM/YYYY')}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Amount</span>,
        dataIndex: 'amount',
        key: 'amount',
        render: val => <span className="font-bold text-slate-700 dark:text-slate-350">${val.toFixed(2)}</span>,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Due</span>,
        dataIndex: 'due',
        key: 'due',
        render: val => (
          <span className={`font-bold ${val > 0 ? 'text-red-500' : 'text-slate-400'}`}>${val.toFixed(2)}</span>
        ),
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Status</span>,
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let color = 'default'
          if (status === 'Paid') color = 'success'
          if (status === 'Sent') color = 'processing'
          if (status === 'Draft') color = 'warning'
          return (
            <Tag color={color} className="rounded-lg border-none uppercase font-bold text-[9px]">
              {status}
            </Tag>
          )
        },
      },
    ]

    return (
      <Table
        dataSource={patientInvoices}
        columns={columns}
        rowKey="id"
        pagination={false}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm"
      />
    )
  }

  // Progress Notes Tab
  const renderProgressNotesTab = () => {
    const realNotes = (store.consultations || [])
      .filter(c => c.patientId === patient.id)
      .map(c => ({
        id: c.id,
        date: c.date ? dayjs(c.date).format('DD/MM/YYYY') : '—',
        practitionerName: c.practitionerName || 'Dr. Sarah Jenkins',
        title: c.notesTitle || 'Clinical Note',
        status: c.status === 'Completed' ? 'Signed' : c.status,
        content: c.notes || (c.soap ? `S: ${c.soap.subjective}\nO: ${c.soap.objective}\nA: ${c.soap.assessment}\nP: ${c.soap.plan}` : '')
      }))

    const allNotes = realNotes

    const columns = [
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Date</span>,
        dataIndex: 'date',
        key: 'date',
        width: 120,
        render: text => <span className="font-semibold text-slate-700 dark:text-slate-350">{text}</span>
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Practitioner</span>,
        dataIndex: 'practitionerName',
        key: 'practitionerName',
        width: 180,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Title / Type</span>,
        dataIndex: 'title',
        key: 'title',
        width: 150,
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Note Preview</span>,
        dataIndex: 'content',
        key: 'content',
        render: text => <div className="text-slate-500 truncate max-w-md font-medium">{text}</div>
      },
      {
        title: <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Status</span>,
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: status => (
          <Tag color={status === 'Signed' || status === 'Final' ? 'success' : 'warning'} className="rounded-lg border-none uppercase font-bold text-[9px]">
            {status}
          </Tag>
        )
      }
    ]

    return (
      <ClientProgressNotes patientId={patient.id} />
    )
  }

  // Funding Tab
  const renderFundingTab = () => {
    if (isNew) return <div className="p-6 text-center text-slate-400 text-sm">Save the client profile first to manage funding.</div>
    const sessionsUsed = patient.sessionsUsed || 0
    const sessionsAllocated = patient.sessionsAllocated || 10
    const sessionsRemaining = sessionsAllocated - sessionsUsed
    const isLowSessions = sessionsRemaining <= 2
    const progressPercent = Math.round((sessionsUsed / sessionsAllocated) * 100)
    const activeFunding = patient.fundingType || ''
    const patientTags = patient.tags || []

    const schemes = [
      { key: 'ndis', label: 'NDIS', color: '#8C4BFF', desc: 'National Disability Insurance Scheme', active: activeFunding === 'NDIS' || patientTags.includes('NDIS') },
      { key: 'epc', label: 'EPC (Medicare)', color: '#0E1B33', desc: 'Enhanced Primary Care Plan', active: activeFunding === 'EPC' || patientTags.includes('Medicare') },
      { key: 'worksafe', label: 'WorkCover / WorkSafe', color: '#F97316', desc: 'Work-related injury / Workers Compensation', active: activeFunding === 'WorkCover' || patientTags.includes('WorkCover') },
      { key: 'ctp', label: 'CTP (Motor Accident)', color: '#EF4444', desc: 'Compulsory Third Party Insurance', active: activeFunding === 'CTP' || patientTags.includes('CTP') },
      { key: 'dva', label: 'DVA', color: '#10B981', desc: 'Department of Veterans Affairs', active: activeFunding === 'DVA' || patientTags.includes('DVA') },
      { key: 'private', label: 'Private / Self-Funded', color: '#64748B', desc: 'Out-of-pocket payment', active: activeFunding === 'Private' || (!activeFunding && !patientTags.some(t => ['NDIS','EPC','Medicare','WorkCover','CTP','DVA'].includes(t))) },
    ]

    return (
      <div className="space-y-6 p-2">
        {/* Funding Scheme Cards */}
        <Card
          title={<span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2"><DollarOutlined style={{ color: '#10B981' }} /> Funding Overview</span>}
          className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {schemes.map(scheme => (
              <div
                key={scheme.key}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scheme.active ? '' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
                style={scheme.active ? {
                  borderColor: scheme.color,
                  backgroundColor: scheme.color + '10',
                } : {}}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    style={{ backgroundColor: scheme.color, color: 'white' }}
                  >
                    {scheme.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className={`font-extrabold text-xs mt-1 ${scheme.active ? '' : 'text-slate-500 dark:text-slate-400'}`} style={scheme.active ? { color: scheme.color } : {}}>{scheme.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{scheme.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Sessions Summary */}
        <Card
          title={<span className="font-extrabold text-sm text-slate-800 dark:text-white">Sessions Summary</span>}
          className="border border-slate-150 dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-sm"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-slate-800 dark:text-white">{sessionsAllocated}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Allocated</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-[#8C4BFF]">{sessionsUsed}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Used</p>
              </div>
              <div className="text-center p-4 rounded-xl border-2" style={{ borderColor: isLowSessions ? '#EF4444' : '#10B981', backgroundColor: isLowSessions ? '#FEF2F2' : '#F0FDF4' }}>
                <div className="flex items-center justify-center gap-1">
                  {isLowSessions && <ExclamationCircleOutlined className="text-red-500" />}
                  <p className="text-2xl font-black" style={{ color: isLowSessions ? '#EF4444' : '#10B981' }}>{sessionsRemaining}</p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: isLowSessions ? '#EF4444' : '#10B981' }}>Remaining</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Sessions used</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor={isLowSessions ? '#EF4444' : '#8C4BFF'}
                trailColor="#e2e8f0"
                strokeLinecap="round"
              />
              {isLowSessions && (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <ExclamationCircleOutlined /> Low sessions remaining — please review funding
                </p>
              )}
            </div>

            {patient.ndisPlanEnd && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                <span className="text-xs font-bold text-[#8C4BFF]">NDIS Plan Expiry</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{dayjs(patient.ndisPlanEnd).format('DD/MM/YYYY')}</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic text-center">Contact clinic admin to update funding details or session allocations.</p>
          </div>
        </Card>
      </div>
    )
  }

  // Outcome Measures Tab
  const renderOutcomeMeasuresTab = () => {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Outcome Measures</h3>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
            onClick={() => setOutcomeModalVisible(true)}
          >
            Record Measure
          </Button>
        </div>
        
        {outcomeMeasures.length === 0 ? (
          <div className="text-center py-8">
            <BarChartOutlined className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No outcome measures recorded yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Track patient progress using standardized assessment tools.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {outcomeMeasures.map((measure, index) => (
              <div key={measure.id || index} className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:border-[#8C4BFF] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{measure.type}</h4>
                    <p className="text-xs text-slate-500 font-medium">{dayjs(measure.date).format('MMMM D, YYYY')}</p>
                  </div>
                  <div className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="text-sm font-black text-[#8C4BFF]">{measure.score}</span>
                  </div>
                </div>
                {measure.notes && (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mt-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{measure.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Communications Tab
  const renderCommunicationsTab = () => {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Communications</h3>
        <div className="space-y-4">
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Email: Appointment Reminder</span>
              <span className="text-xs text-slate-500">2026-07-20 10:00 AM</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Sent automated reminder for upcoming appointment.</p>
          </div>
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">SMS: Feedback Request</span>
              <span className="text-xs text-slate-500">2026-07-15 02:30 PM</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Client replied: "Great session, thanks!"</p>
          </div>
        </div>
      </div>
    )
  }

  // Cases Tab (Dynamic & Live DB Connected)
  const renderCasesTab = () => {
    const totalApproved = casesList.reduce((sum, c) => sum + (Number(c.approvedSessions) || 0), 0)
    const totalUsed = casesList.reduce((sum, c) => sum + (Number(c.usedSessions) || 0), 0)
    const totalRemaining = Math.max(0, totalApproved - totalUsed)
    const activeCount = casesList.filter(c => (c.status || '').toLowerCase() === 'active').length

    return (
      <div className="space-y-6 font-sans">
        {/* Header with Title and Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white m-0 flex items-center gap-2">
              <FolderOpenOutlined style={{ color: '#8C4BFF' }} /> Clinical Cases & Funding Claims
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1 mb-0">
              Manage insurance claims (WorkCover, NDIS, Medicare EPC, DVA, TAC), approved session limits, and insurer details.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCaseModal(null)}
            className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-10 px-5 text-xs border-none shadow-sm text-white flex items-center"
            style={{ backgroundColor: '#8C4BFF', color: '#ffffff' }}
          >
            New Clinical Case
          </Button>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Cases</span>
            <h4 className="text-xl font-black text-slate-800 dark:text-white m-0 mt-1">{casesList.length}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Recorded profiles</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-500">Active Cases</span>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 m-0 mt-1">{activeCount}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Open clinical plans</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#8C4BFF]">Approved Sessions</span>
            <h4 className="text-xl font-black text-[#8C4BFF] m-0 mt-1">{totalApproved}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Total funded capacity</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-500">Sessions Remaining</span>
            <h4 className="text-xl font-black text-blue-600 dark:text-blue-400 m-0 mt-1">{totalRemaining}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">{totalUsed} sessions completed</span>
          </div>
        </div>

        {/* Cases List */}
        {casesLoading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-semibold">Loading clinical cases from live database...</p>
          </div>
        ) : casesList.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#8C4BFF]/10 text-[#8C4BFF] flex items-center justify-center mx-auto text-xl font-bold">
              <FolderOpenOutlined />
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white m-0">No Clinical Cases Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a case to link insurer details, claim numbers, and approved therapy session allowances for this client.
            </p>
            <Button
              type="primary"
              onClick={() => handleOpenCaseModal(null)}
              className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-9 text-xs border-none"
              style={{ backgroundColor: '#8C4BFF' }}
            >
              Add First Case
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {casesList.map((c) => {
              const approved = Number(c.approvedSessions) || 1
              const used = Number(c.usedSessions) || 0
              const percent = Math.min(100, Math.round((used / approved) * 100))
              const isActive = (c.status || '').toLowerCase() === 'active'

              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-[#8C4BFF] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Title, Claim No & Status */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-850 dark:text-white m-0">
                            {c.title}
                          </h4>
                          {c.claimNumber && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700">
                              #{c.claimNumber}
                            </span>
                          )}
                        </div>
                        {c.payerName && (
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 m-0 flex items-center gap-1">
                            <BankOutlined style={{ fontSize: 11 }} /> {c.payerName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag
                          color={isActive ? 'success' : c.status === 'Under Review' ? 'warning' : 'default'}
                          className="m-0 border-none font-bold text-[10px] uppercase rounded-full px-2.5"
                        >
                          {c.status || 'Active'}
                        </Tag>
                        <Tag color="purple" className="m-0 border-none font-bold text-[10px] uppercase rounded-full px-2.5">
                          {c.fundingType || 'Funding'}
                        </Tag>
                      </div>
                    </div>

                    {/* Case Manager / Contact Info */}
                    {(c.caseManager || c.contactPhone || c.contactEmail) && (
                      <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1 mb-3 text-xs">
                        {c.caseManager && (
                          <div className="font-semibold text-slate-700 dark:text-slate-250 flex items-center gap-1.5">
                            <UserOutlined style={{ color: '#8C4BFF' }} /> Contact: <span className="font-bold">{c.caseManager}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                          {c.contactPhone && (
                            <span className="flex items-center gap-1">
                              <PhoneOutlined /> {c.contactPhone}
                            </span>
                          )}
                          {c.contactEmail && (
                            <span className="flex items-center gap-1">
                              <MailOutlined /> {c.contactEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Primary Diagnosis */}
                    {c.diagnosis && (
                      <div className="mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Primary Diagnosis</span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 m-0 line-clamp-2">
                          {c.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Session Progress Bar */}
                    <div className="mb-3 p-3 bg-[#8C4BFF]/5 dark:bg-[#8C4BFF]/10 rounded-xl border border-[#8C4BFF]/15">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-slate-700 dark:text-slate-200">Therapy Sessions Allocated</span>
                        <span className="text-[#8C4BFF] font-black">{used} of {approved} Used ({approved - used} Left)</span>
                      </div>
                      <Progress
                        percent={percent}
                        strokeColor="#8C4BFF"
                        trailColor="rgba(140, 75, 255, 0.15)"
                        showInfo={false}
                        size="small"
                      />
                    </div>

                    {/* Dates & Notes */}
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold space-y-1">
                      {(c.startDate || c.expiryDate) && (
                        <div className="flex justify-between">
                          <span>Valid Duration:</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            {c.startDate ? dayjs(c.startDate).format('DD/MM/YYYY') : '—'} → {c.expiryDate ? dayjs(c.expiryDate).format('DD/MM/YYYY') : 'Ongoing'}
                          </span>
                        </div>
                      )}
                      {c.notes && (
                        <div className="pt-1 text-slate-500 dark:text-slate-400 text-xs italic line-clamp-2">
                          "{c.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-end items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenCaseModal(c)}
                      className="rounded-lg text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      Edit Details
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteCase(c)}
                      className="rounded-lg text-xs font-bold"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Appointments Tab (Dynamic & Live DB Connected)
  const renderAppointmentsTab = () => {
    const totalAppts = clientAppointments.length
    const scheduledCount = clientAppointments.filter(a => ['Scheduled', 'Confirmed', 'Arrived', 'In Progress'].includes(a.status)).length
    const completedCount = clientAppointments.filter(a => a.status === 'Completed').length
    const cancelledCount = clientAppointments.filter(a => ['Cancelled', 'No Show'].includes(a.status)).length

    const apptColumns = [
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Date & Time</span>,
        key: 'datetime',
        render: (_, record) => (
          <div>
            <span className="font-extrabold text-slate-850 dark:text-white text-xs block">
              {record.date ? dayjs(record.date).format('DD MMM YYYY') : 'Today'}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <ClockCircleOutlined style={{ fontSize: 10 }} />
              {record.startTime || record.time || '10:00 AM'} - {record.endTime || '10:45 AM'}
            </span>
          </div>
        )
      },
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Practitioner</span>,
        dataIndex: 'practitionerName',
        key: 'practitionerName',
        render: text => (
          <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
            {text || 'Dr. Sarah Jenkins'}
          </span>
        )
      },
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Service / Session</span>,
        key: 'service',
        render: (_, record) => (
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
              {record.serviceName || record.appointmentType || 'Standard Consultation'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {record.location || record.branchName || 'Melbourne Clinic'}
            </span>
          </div>
        )
      },
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Fee & Pay</span>,
        key: 'fee',
        render: (_, record) => (
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
              ${record.fee ? Number(record.fee).toFixed(2) : '120.00'} AUD
            </span>
            <Tag color={record.isPaid ? 'success' : 'default'} className="m-0 border-none text-[8px] font-bold uppercase rounded-md">
              {record.isPaid ? 'PAID' : 'UNPAID'}
            </Tag>
          </div>
        )
      },
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>,
        dataIndex: 'status',
        key: 'status',
        render: (status, record) => (
          <Select
            size="small"
            value={status || 'Scheduled'}
            onChange={(val) => handleUpdateApptStatus(record.id, val)}
            className="w-32 text-xs font-bold rounded-lg"
            bordered={false}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value="Scheduled"><Tag color="blue" className="m-0 border-none font-bold text-[9px] uppercase">Scheduled</Tag></Select.Option>
            <Select.Option value="Confirmed"><Tag color="cyan" className="m-0 border-none font-bold text-[9px] uppercase">Confirmed</Tag></Select.Option>
            <Select.Option value="Arrived"><Tag color="purple" className="m-0 border-none font-bold text-[9px] uppercase">Arrived</Tag></Select.Option>
            <Select.Option value="In Progress"><Tag color="processing" className="m-0 border-none font-bold text-[9px] uppercase">In Progress</Tag></Select.Option>
            <Select.Option value="Completed"><Tag color="success" className="m-0 border-none font-bold text-[9px] uppercase">Completed</Tag></Select.Option>
            <Select.Option value="Cancelled"><Tag color="error" className="m-0 border-none font-bold text-[9px] uppercase">Cancelled</Tag></Select.Option>
            <Select.Option value="No Show"><Tag color="default" className="m-0 border-none font-bold text-[9px] uppercase">No Show</Tag></Select.Option>
          </Select>
        )
      },
      {
        title: <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>,
        key: 'action',
        align: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button
              size="small"
              type="primary"
              onClick={() => handleTabChange('consultations')}
              className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-lg text-xs border-none text-white shadow-xs"
              style={{ backgroundColor: '#8C4BFF' }}
            >
              Consult Note
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAppt(record)}
              className="rounded-lg text-xs"
            />
          </Space>
        )
      }
    ]

    return (
      <div className="space-y-6 font-sans">
        {/* Header with Title and Book Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white m-0 flex items-center gap-2">
              <CalendarOutlined style={{ color: '#8C4BFF' }} /> Client Appointments & Calendar Schedule
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1 mb-0">
              Manage clinical consultation bookings, attendance statuses, rooms, and upcoming appointments for this client.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenApptModal}
            className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-10 px-5 text-xs border-none shadow-sm text-white flex items-center"
            style={{ backgroundColor: '#8C4BFF', color: '#ffffff' }}
          >
            Book Appointment
          </Button>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
            <h4 className="text-xl font-black text-slate-800 dark:text-white m-0 mt-1">{totalAppts}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Lifetime sessions</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-500">Upcoming / Scheduled</span>
            <h4 className="text-xl font-black text-blue-600 dark:text-blue-400 m-0 mt-1">{scheduledCount}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Active agenda</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-500">Completed Sessions</span>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 m-0 mt-1">{completedCount}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Attended & signed</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-rose-500">Cancelled / Missed</span>
            <h4 className="text-xl font-black text-rose-600 dark:text-rose-400 m-0 mt-1">{cancelledCount}</h4>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">No show or cancelled</span>
          </div>
        </div>

        {/* Appointments Table */}
        <Card className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm p-0 overflow-hidden">
          <Table
            dataSource={clientAppointments}
            columns={apptColumns}
            rowKey="id"
            loading={appointmentsLoading}
            pagination={{ pageSize: 8 }}
            className="bg-white dark:bg-slate-900"
            locale={{
              emptyText: (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#8C4BFF]/10 text-[#8C4BFF] flex items-center justify-center mx-auto text-xl font-bold">
                    <CalendarOutlined />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white m-0">No Appointments Scheduled</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Book an appointment for this client to schedule clinical consultation sessions.
                  </p>
                  <Button
                    type="primary"
                    onClick={handleOpenApptModal}
                    className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-9 text-xs border-none"
                    style={{ backgroundColor: '#8C4BFF' }}
                  >
                    Book First Appointment
                  </Button>
                </div>
              )
            }}
          />
        </Card>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: renderProfileTab(),
    },
    {
      key: 'cases',
      label: (
        <span>
          <FolderOpenOutlined /> Cases
        </span>
      ),
      children: renderCasesTab(),
      disabled: isNew,
    },
    {
      key: 'appointments',
      label: (
        <span>
          <CalendarOutlined /> Appointments
        </span>
      ),
      children: renderAppointmentsTab(),
      disabled: isNew,
    },
    {
      key: 'progress_notes',
      label: (
        <span>
          <FileTextOutlined style={{ color: '#8C4BFF' }} /> Progress Notes <span className="ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-full border border-slate-200 dark:border-slate-700">48</span>
        </span>
      ),
      children: renderProgressNotesTab(),
      disabled: isNew,
    },
    {
      key: 'consultations',
      label: (
        <span>
          <ClockCircleOutlined /> Consultations
        </span>
      ),
      children: <PractitionerConsultation patientId={patient?.id || id} clientPatient={patient} />,
      disabled: isNew,
    },
    {
      key: 'exercises',
      label: (
        <span>
          <HeartOutlined /> Exercises & Treatment Plans
        </span>
      ),
      children: <PractitionerExercisesPlans patientId={patient?.id || id} clientPatient={patient} />,
      disabled: isNew,
    },
    {
      key: 'notes_reports',
      label: (
        <span>
          <AuditOutlined /> Notes & Reports
        </span>
      ),
      children: <PractitionerNotesReports patientId={patient?.id || id} clientPatient={patient} />,
      disabled: isNew,
    },
    {
      key: 'referrals',
      label: (
        <span>
          <BranchesOutlined /> Referrals
        </span>
      ),
      children: <PractitionerReferrals patientId={patient?.id || id} clientPatient={patient} />,
      disabled: isNew,
    },
    {
      key: 'billing',
      label: (
        <span>
          <DollarOutlined /> Billing
        </span>
      ),
      children: <PractitionerBilling patientId={patient?.id || id} clientPatient={patient} />,
      disabled: isNew,
    },
  ]

  return (
    <div className="space-y-6 client-profile-container">
      {/* Back to patients link */}
      <div>
        <Link
          to={`${basePath}/patients`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#8C4BFF] transition-colors font-sans"
        >
          <ArrowLeftOutlined style={{ fontSize: 10 }} /> Back to patients management
        </Link>
      </div>

      {/* Page Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-2 gap-4">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Profile
        </h2>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold select-none shadow-inner flex-shrink-0"
          style={{ backgroundColor: '#8C4BFF' }}
        >
          {isNew ? 'N' : patient.name ? patient.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{isNew ? 'New client' : patient.name}</h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            DOB: {isNew ? '—' : patient.dob ? dayjs(patient.dob).format('DD/MM/YYYY') : '—'}
          </p>
        </div>
      </div>

      {/* Main Tab Panel */}
      <Tabs
        activeKey={activeSubTab}
        onChange={handleTabChange}
        items={tabItems}
        type="card"
        className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl"
      />

      {/* Outcome Measures Modal */}
      <Modal
        title="Record Outcome Measure"
        open={outcomeModalVisible}
        onCancel={() => {
          setOutcomeModalVisible(false)
          outcomeForm.resetFields()
        }}
        onOk={() => {
          outcomeForm.validateFields().then(values => {
            setOutcomeMeasures([{ id: Date.now(), ...values, date: dayjs().format('YYYY-MM-DD') }, ...outcomeMeasures])
            setOutcomeModalVisible(false)
            outcomeForm.resetFields()
          })
        }}
        okButtonProps={{ style: { backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' } }}
      >
        <Form form={outcomeForm} layout="vertical" className="mt-4">
          <Form.Item name="type" label="Assessment Type" rules={[{ required: true, message: 'Please select assessment type' }]}>
            <Select placeholder="Select assessment type">
              <Select.Option value="NPRS (Pain Scale)">NPRS (Pain Scale)</Select.Option>
              <Select.Option value="DASH (Disability of Arm)">DASH (Disability of Arm)</Select.Option>
              <Select.Option value="ODI (Oswestry Disability Index)">ODI (Oswestry Disability Index)</Select.Option>
              <Select.Option value="SF-36 (Quality of Life)">SF-36 (Quality of Life)</Select.Option>
              <Select.Option value="K10 (Psychological Distress)">K10 (Psychological Distress)</Select.Option>
              <Select.Option value="LEFS (Lower Extremity)">LEFS (Lower Extremity)</Select.Option>
              <Select.Option value="NDI (Neck Disability Index)">NDI (Neck Disability Index)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="score" label="Score" rules={[{ required: true, message: 'Please enter score' }]}>
            <Input placeholder="e.g. 7/10 or 42%" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional observations..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Clinical Case Create / Edit Modal */}
      <Modal
        title={
          <span className="font-extrabold text-base text-slate-850 dark:text-white flex items-center gap-2">
            <FolderOpenOutlined style={{ color: '#8C4BFF' }} />
            {editingCase ? 'Edit Clinical Case & Claim' : 'Create New Clinical Case'}
          </span>
        }
        open={caseModalVisible}
        onCancel={() => {
          setCaseModalVisible(false)
          caseForm.resetFields()
        }}
        onOk={handleSaveCase}
        okText={editingCase ? 'Save Changes' : 'Create Case'}
        okButtonProps={{
          className: 'bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-9 border-none text-white',
          style: { backgroundColor: '#8C4BFF', color: '#ffffff' }
        }}
        cancelButtonProps={{ className: 'rounded-xl font-bold' }}
        width={680}
        destroyOnClose
      >
        <Form form={caseForm} layout="vertical" className="mt-4 space-y-3 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="title"
              label={<span className="text-xs font-semibold text-slate-500">Case Title</span>}
              rules={[{ required: true, message: 'Please enter case title' }]}
            >
              <Input placeholder="e.g. WorkCover Claim - Shoulder Rehab" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="claimNumber"
              label={<span className="text-xs font-semibold text-slate-500">Claim / Policy / Approval Ref #</span>}
              rules={[{ required: true, message: 'Please enter claim / ref number' }]}
            >
              <Input placeholder="e.g. WC-2026-892 or NDIS-99120" className="rounded-xl h-10 font-mono" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="fundingType"
              label={<span className="text-xs font-semibold text-slate-500">Funding / Payer Scheme</span>}
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                <Select.Option value="WorkCover">WorkCover / Worker's Comp</Select.Option>
                <Select.Option value="NDIS">NDIS (National Disability Scheme)</Select.Option>
                <Select.Option value="Medicare EPC">Medicare EPC / CDM Plan</Select.Option>
                <Select.Option value="DVA">DVA (Department of Veterans Affairs)</Select.Option>
                <Select.Option value="TAC / CTP">TAC / CTP Motor Accident</Select.Option>
                <Select.Option value="Private Health">Private Health Insurance</Select.Option>
                <Select.Option value="Self-Funded">Self-Funded / Private</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="text-xs font-semibold text-slate-500">Case Status</span>}
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                <Select.Option value="Active">Active (Open for Treatment)</Select.Option>
                <Select.Option value="Under Review">Under Review</Select.Option>
                <Select.Option value="Pending Approval">Pending Insurer Approval</Select.Option>
                <Select.Option value="Closed">Closed / Completed</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
            <Form.Item
              name="payerName"
              label={<span className="text-xs font-semibold text-slate-500">Insurer / Payer Org</span>}
            >
              <Input placeholder="e.g. Allianz Insurance" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="caseManager"
              label={<span className="text-xs font-semibold text-slate-500">Case Manager / Contact</span>}
            >
              <Input placeholder="e.g. Sarah Conroy" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="contactPhone"
              label={<span className="text-xs font-semibold text-slate-500">Contact Phone</span>}
            >
              <Input placeholder="e.g. +61 3 9988 1234" className="rounded-xl h-10" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="startDate"
              label={<span className="text-xs font-semibold text-slate-500">Case Start / Injury Date</span>}
            >
              <DatePicker className="w-full rounded-xl h-10" format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="expiryDate"
              label={<span className="text-xs font-semibold text-slate-500">Approval Expiry / Review Date</span>}
            >
              <DatePicker className="w-full rounded-xl h-10" format="DD-MM-YYYY" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="approvedSessions"
              label={<span className="text-xs font-semibold text-slate-500">Approved Sessions Count</span>}
            >
              <Input type="number" min={1} placeholder="e.g. 12" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="usedSessions"
              label={<span className="text-xs font-semibold text-slate-500">Sessions Completed / Used</span>}
            >
              <Input type="number" min={0} placeholder="e.g. 3" className="rounded-xl h-10" />
            </Form.Item>
          </div>

          <Form.Item
            name="diagnosis"
            label={<span className="text-xs font-semibold text-slate-500">Primary Diagnosis & Treatment Goal</span>}
          >
            <Input.TextArea rows={2} placeholder="e.g. Right shoulder rotator cuff tendinopathy. Goal: Pain reduction and return to work." className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="notes"
            label={<span className="text-xs font-semibold text-slate-500">Billing & Case Management Notes</span>}
          >
            <Input.TextArea rows={2} placeholder="e.g. Invoicing requires medical certificate attached. Regular progress reports to insurer required every 4 weeks." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Book Client Appointment Modal */}
      <Modal
        title={
          <span className="font-extrabold text-base text-slate-850 dark:text-white flex items-center gap-2">
            <CalendarOutlined style={{ color: '#8C4BFF' }} />
            Book Client Appointment
          </span>
        }
        open={apptModalVisible}
        onCancel={() => {
          setApptModalVisible(false)
          apptForm.resetFields()
        }}
        onOk={handleSaveAppointment}
        okText="Book Session"
        okButtonProps={{
          className: 'bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 font-bold rounded-xl h-9 border-none text-white',
          style: { backgroundColor: '#8C4BFF', color: '#ffffff' }
        }}
        cancelButtonProps={{ className: 'rounded-xl font-bold' }}
        width={640}
        destroyOnClose
      >
        <Form form={apptForm} layout="vertical" className="mt-4 space-y-3 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="date"
              label={<span className="text-xs font-semibold text-slate-500">Appointment Date</span>}
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker className="w-full rounded-xl h-10" format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="practitionerName"
              label={<span className="text-xs font-semibold text-slate-500">Treating Practitioner</span>}
              rules={[{ required: true, message: 'Please select practitioner' }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                {practitionersList.length > 0 ? (
                  practitionersList.map(p => (
                    <Select.Option key={p.id || p.name} value={p.name}>{p.name} ({p.specialty || 'Physiotherapy'})</Select.Option>
                  ))
                ) : (
                  <>
                    <Select.Option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Physiotherapist)</Select.Option>
                    <Select.Option value="Dr. Michael Chang">Dr. Michael Chang (Chiropractor)</Select.Option>
                    <Select.Option value="Dr. Emma Watson">Dr. Emma Watson (Osteopath)</Select.Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="startTime"
              label={<span className="text-xs font-semibold text-slate-500">Start Time</span>}
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'].map(t => (
                  <Select.Option key={t} value={t}>{t}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="endTime"
              label={<span className="text-xs font-semibold text-slate-500">End Time</span>}
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                {['08:30 AM', '08:45 AM', '09:15 AM', '09:45 AM', '10:15 AM', '10:45 AM', '11:15 AM', '11:45 AM', '12:30 PM', '01:30 PM', '01:45 AM', '02:15 PM', '02:45 PM', '03:15 PM', '03:45 PM', '04:15 PM', '04:45 PM', '05:30 PM'].map(t => (
                  <Select.Option key={t} value={t}>{t}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="appointmentType"
              label={<span className="text-xs font-semibold text-slate-500">Service / Appointment Type</span>}
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl h-10 flex items-center">
                <Select.Option value="Physiotherapy Initial Consultation">Physiotherapy Initial Consultation (45 min)</Select.Option>
                <Select.Option value="Physiotherapy Standard Follow-up">Physiotherapy Standard Follow-up (30 min)</Select.Option>
                <Select.Option value="Physiotherapy Extended Session">Physiotherapy Extended Session (60 min)</Select.Option>
                <Select.Option value="Telehealth Consultation">Telehealth Video Consultation</Select.Option>
                <Select.Option value="NDIS Functional Assessment">NDIS Functional Capacity Assessment</Select.Option>
                <Select.Option value="WorkCover Progress Review">WorkCover Progress Review</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="branchName"
              label={<span className="text-xs font-semibold text-slate-500">Location / Branch</span>}
            >
              <Select className="rounded-xl h-10 flex items-center">
                {activeBranches.length > 0 ? (
                  activeBranches.map(b => (
                    <Select.Option key={b.id || b.name} value={b.name}>{b.name}</Select.Option>
                  ))
                ) : (
                  <>
                    <Select.Option value="Melbourne Main Clinic">Melbourne Main Clinic</Select.Option>
                    <Select.Option value="Sydney Wellness Center">Sydney Wellness Center</Select.Option>
                    <Select.Option value="Brisbane City Hub">Brisbane City Hub</Select.Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="fee"
              label={<span className="text-xs font-semibold text-slate-500">Session Fee ($ AUD)</span>}
            >
              <Input type="number" min={0} placeholder="120" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="text-xs font-semibold text-slate-500">Initial Status</span>}
            >
              <Select className="rounded-xl h-10 flex items-center">
                <Select.Option value="Scheduled">Scheduled</Select.Option>
                <Select.Option value="Confirmed">Confirmed</Select.Option>
                <Select.Option value="Arrived">Arrived</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-xs font-semibold text-slate-500">Clinical / Booking Notes</span>}
          >
            <Input.TextArea rows={2} placeholder="e.g. Follow-up on rotator cuff rehabilitation exercises and pain score check." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
