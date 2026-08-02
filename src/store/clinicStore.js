import { create } from 'zustand'
import dayjs from 'dayjs'

export const useClinicStore = create((set, get) => ({
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false,
  toggleDarkMode: () => {
    const next = !get().darkMode
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(next))
    }
    set({ darkMode: next })
  },

  /* Active practitioners */
  practitioners: [],

  /* Custom client tags */
  clientTags: [
    { id: 't1', name: 'NDIS', color: '#30D2BE', icon: 'SafetyCertificateOutlined' },
    { id: 't2', name: 'Private', color: '#64748B', icon: 'LockOutlined' },
    { id: 't3', name: 'Medicare', color: '#8C4BFF', icon: 'HeartOutlined' },
    { id: 't4', name: 'WorkCover', color: '#F59E0B', icon: 'AuditOutlined' },
    { id: 't5', name: 'High Priority', color: '#EF4444', icon: 'WarningOutlined' },
    { id: 't6', name: 'Falls Risk', color: '#F97316', icon: 'InfoCircleOutlined' },
    { id: 't7', name: 'Telehealth', color: '#06B6D4', icon: 'ApiOutlined' },
  ],

  /* Active branches list */
  branches: [],

  /* Admin users */
  admins: [],

  /* Third-party integrations */
  integrations: [
    { id: 'xero', name: 'Xero', type: 'Accounting', connected: false, lastSync: null },
    { id: 'myob', name: 'MYOB', type: 'Accounting', connected: false, lastSync: null },
    { id: 'physitrack', name: 'Physitrack', type: 'Exercise Prescription', connected: false, lastSync: null },
    { id: 'vald', name: 'VALD HUB', type: 'Exercise Prescription', connected: false, lastSync: null },
    { id: 'stripe', name: 'Stripe', type: 'Payments', connected: false, lastSync: null },
    { id: 'zoom', name: 'Zoom', type: 'Video Consultations', connected: false, lastSync: null },
    { id: 'gmeet', name: 'Google Meet', type: 'Video Consultations', connected: false, lastSync: null },
    { id: 'hicaps', name: 'HICAPS', type: 'Health Claiming', connected: false, lastSync: null },
    { id: 'tyro', name: 'Tyro Health', type: 'Health Claiming', connected: false, lastSync: null },
  ],

  /* Form templates */
  formTemplates: [],

  /* Letter templates */
  letterTemplates: [],

  /* Note templates */
  noteTemplates: [],

  /* Invoice layout preferences */
  invoiceTemplates: {
    logoUrl: null,
    paymentTerms: '7 Days',
    footerText: 'Thank you for choosing ZealthOS practice network.',
    layouts: [
      { id: 'inv1', type: 'Private Client Invoice', desc: 'Auto-applies standard service price.' },
      { id: 'inv2', type: 'NDIS Invoice', desc: 'Adds line codes and nominee fields.' },
      { id: 'inv3', type: 'DVA Invoice', desc: 'Formatted with Veteran file reference.' },
      { id: 'inv4', type: 'WorkCover Invoice', desc: 'Includes Injury Case identifiers.' },
    ],
  },

  /* Services offered */
  services: [],

  /* Cancellation reasons */
  cancellationReasons: [
    { id: 'cr1', reason: 'Client Cancelled', archived: false },
    { id: 'cr2', reason: 'Practitioner Cancelled', archived: false },
    { id: 'cr3', reason: 'Sick', archived: false },
    { id: 'cr4', reason: 'Hospital Admission', archived: false },
    { id: 'cr5', reason: 'No Show', archived: false },
  ],

  /* Calendar settings */
  workHours: { startTime: '09:00', endTime: '17:00' },
  visibleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  calendarInterval: 30,

  /* Primary patients registry */
  patients: [],

  /* Waitlist data */
  waitlist: [],

  /* Contacts */
  contacts: [],

  /* Invoices list */
  invoices: [],

  /* Documents center */
  documents: [],
  addDocModalOpen: false,
  salesLeadModalOpen: false,
  salesDemoModalOpen: false,
  salesTaskModalOpen: false,
  salesProposalModalOpen: false,
  salesConvertModalOpen: false,
  salesSelectedLeadId: null,

  /* Import & Export logs */
  importExportLogs: [],

  /* User role state */
  userRole: typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'clinic' : 'clinic',
  setUserRole: (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role)
    }
    set({ userRole: role })
  },

  /* Appointments schedule list */
  appointments: [],

  /* Message board */
  messageBoard: [],

  /* Settings Actions */
  updateSettings: (key, value) => {
    set((state) => ({ [key]: value }))
  },
  toggleIntegration: (id) => {
    set((state) => ({
      integrations: state.integrations.map((item) => {
        if (item.id === id) {
          const nowConnected = !item.connected
          return {
            ...item,
            connected: nowConnected,
            lastSync: nowConnected ? new Date().toLocaleString() : null,
          }
        }
        return item
      }),
    }))
  },
  addMessageBoardItem: (msg) => {
    set((state) => ({
      messageBoard: [
        ...state.messageBoard,
        {
          id: `mb_${Date.now()}`,
          ...msg,
          timestamp: new Date().toLocaleString(),
        },
      ],
    }))
  },

  /* Services CRUD */
  addService: (service) => {
    const newService = {
      id: `s_${Date.now()}`,
      archived: false,
      ndisCode: '',
      gst: false,
      ...service,
    }
    set((state) => ({ services: [...state.services, newService] }))
  },
  editService: (service) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === service.id ? service : s)),
    }))
  },
  archiveService: (id) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, archived: true } : s)),
    }))
  },
  removeService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    }))
  },

  /* Cancellation reasons CRUD */
  addCancellationReason: (reasonText) => {
    const newReason = { id: `cr_${Date.now()}`, reason: reasonText, archived: false }
    set((state) => ({ cancellationReasons: [...state.cancellationReasons, newReason] }))
  },
  editCancellationReason: (id, text) => {
    set((state) => ({
      cancellationReasons: state.cancellationReasons.map((item) =>
        item.id === id ? { ...item, reason: text } : item
      ),
    }))
  },
  archiveCancellationReason: (id) => {
    set((state) => ({
      cancellationReasons: state.cancellationReasons.map((item) =>
        item.id === id ? { ...item, archived: true } : item
      ),
    }))
  },

  /* Client tags CRUD */
  addClientTag: (tag) => {
    const newTag = { id: `t_${Date.now()}`, ...tag }
    set((state) => ({ clientTags: [...state.clientTags, newTag] }))
  },
  editClientTag: (tag) => {
    set((state) => ({
      clientTags: state.clientTags.map((t) => (t.id === tag.id ? tag : t)),
    }))
  },
  deleteClientTag: (id) => {
    set((state) => ({
      clientTags: state.clientTags.filter((t) => t.id !== id),
    }))
  },

  /* Branches CRUD */
  addBranch: (branch) => {
    const newBranch = {
      id: `b_${Date.now()}`,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      phone: '',
      address: '',
      timezone: 'AEST',
      businessHours: { startTime: '09:00', endTime: '17:00' },
      ...branch,
    }
    set((state) => ({ branches: [...state.branches, newBranch] }))
  },
  editBranch: (branch) => {
    set((state) => ({
      branches: state.branches.map((b) => (b.id === branch.id ? branch : b)),
    }))
  },
  deleteBranch: (id) => {
    set((state) => ({
      branches: state.branches.filter((b) => b.id !== id),
    }))
  },

  /* Import & Export Logs */
  addImportExportLog: (log) => {
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      errors: [],
      ...log,
    }
    set((state) => ({ importExportLogs: [newLog, ...state.importExportLogs] }))
  },

  /* Patient CRUD */
  addPatient: (patient) => {
    const newPatient = {
      id: `p_${Date.now()}`,
      sessionsUsed: 0,
      sessionsAllocated: 10,
      status: 'active',
      tags: [],
      diagnosis: [],
      alerts: '',
      ...patient,
    }
    set((state) => ({ patients: [...state.patients, newPatient] }))
  },
  updatePatient: (updatedPatient) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)),
    }))
  },
  deletePatient: (patientId) => {
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== patientId),
      appointments: state.appointments.filter((a) => a.patientId !== patientId),
    }))
  },

  /* Waitlist Actions */
  addToWaitlist: (entry) => {
    const newEntry = {
      id: `w_${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'Waiting',
      ...entry,
    }
    set((state) => ({ waitlist: [...state.waitlist, newEntry] }))
  },
  updateWaitlistStatus: (id, status) => {
    set((state) => ({
      waitlist: (state.waitlist || []).map((w) => (w && w.id === id ? { ...w, status } : w)),
    }))
  },
  removeFromWaitlist: (id) => {
    set((state) => ({
      waitlist: (state.waitlist || []).filter((w) => w && w.id !== id),
    }))
  },

  /* Contacts Actions */
  addContact: (contact) => {
    const newContact = { id: `c_${Date.now()}`, associatedClients: [], ...contact }
    set((state) => ({ contacts: [...state.contacts, newContact] }))
  },
  updateContact: (updatedContact) => {
    set((state) => ({
      contacts: (state.contacts || []).map((c) => (c && c.id === updatedContact?.id ? updatedContact : c)),
    }))
  },
  deleteContact: (id) => {
    set((state) => ({
      contacts: (state.contacts || []).filter((c) => c && c.id !== id),
    }))
  },

  /* Invoice management Actions */
  addInvoice: (invoice) => {
    const newInvoice = {
      id: `INV-${String(get().invoices.length + 1).padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due: invoice.amount || 0,
      status: 'Draft',
      sentStatus: 'Not Sent',
      ...invoice,
    }
    set((state) => ({ invoices: [...state.invoices, newInvoice] }))
  },
  updateInvoiceStatus: (id, status, dueVal) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, status, due: dueVal !== undefined ? dueVal : inv.due } : inv
      ),
    }))
  },
  deleteInvoice: (id) => {
    set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }))
  },

  /* Documents Actions */
  setAddDocModalOpen: (isOpen) => set({ addDocModalOpen: isOpen }),
  setSalesLeadModalOpen: (isOpen) => set({ salesLeadModalOpen: isOpen }),
  setSalesDemoModalOpen: (isOpen) => set({ salesDemoModalOpen: isOpen }),
  setSalesTaskModalOpen: (isOpen) => set({ salesTaskModalOpen: isOpen }),
  setSalesProposalModalOpen: (isOpen) => set({ salesProposalModalOpen: isOpen }),
  setSalesConvertModalOpen: (isOpen) => set({ salesConvertModalOpen: isOpen }),
  setSalesSelectedLeadId: (id) => set({ salesSelectedLeadId: id }),

  addDocument: (doc) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: doc.name || 'Docname.doc',
      date: doc.date || dayjs().format('D MMM YYYY'),
      uploadBy: doc.uploadBy || 'Admin',
      ...doc,
    }
    set((state) => ({ documents: [newDoc, ...state.documents] }))
  },
  updateDocument: (updatedDoc) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)),
    }))
  },
  deleteDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }))
  },

  /* Appointment Actions */
  addAppointment: (appointment) => {
    const newAppt = {
      id: `a_${Date.now()}`,
      location: 'Melbourne Clinic',
      room: 'Room A',
      ...appointment,
    }
    set((state) => ({ appointments: [...state.appointments, newAppt] }))
  },
  updateAppointment: (updated) =>
    set((state) => ({
      appointments: (state.appointments || []).map((a) => (a.id === updated.id ? updated : a)),
    })),
  deleteAppointment: (id) =>
    set((state) => ({
      appointments: (state.appointments || []).filter((a) => a.id !== id),
    })),

  /* Subscription State */
  subscription: {
    plan: 'Growth',
    billingCycle: 'Monthly',
    mrr: 349,
    smsCredits: { total: 500, used: 0 },
    planLimits: {
      Starter: { price: 199, smsCredits: 200 },
      Growth: { price: 349, smsCredits: 500 },
      Enterprise: { price: 799, smsCredits: 1500 },
    },
    billingHistory: [],
  },
  updateSubscription: (data) => {
    set((state) => ({ subscription: { ...state.subscription, ...data } }))
  },
  updateSmsCredits: (used) => {
    set((state) => ({
      subscription: {
        ...state.subscription,
        smsCredits: { ...state.subscription.smsCredits, used },
      },
    }))
  },
  upgradePlan: (plan) => {
    const planLimits = get().subscription.planLimits
    const limits = planLimits[plan] || {}
    set((state) => ({
      subscription: {
        ...state.subscription,
        plan,
        mrr: limits.price || state.subscription.mrr,
      },
    }))
  },

  /* AI Notes State */
  aiNotes: {
    plan: 'Growth',
    limits: {
      Starter: { monthlyGenerations: 50, tokensPerNote: 500, historyDays: 7 },
      Growth: { monthlyGenerations: 300, tokensPerNote: 1500, historyDays: 30 },
      Enterprise: { monthlyGenerations: -1, tokensPerNote: 4000, historyDays: -1 },
    },
    usage: { generationsUsed: 0, tokensUsed: 0, resetDate: '2026-07-01' },
    analyticsHistory: [],
    topTemplates: [],
    restrictionEnabled: true,
    warningThreshold: 80,
  },
  updateAiNotesUsage: (data) => {
    set((state) => ({ aiNotes: { ...state.aiNotes, usage: { ...state.aiNotes.usage, ...data } } }))
  },
  setAiNotesPlan: (plan) => {
    set((state) => ({ aiNotes: { ...state.aiNotes, plan } }))
  },

  /* Multi-tenant Workspace Controls */
  tenants: [],
  addTenant: (tenant) => {
    const newTenant = {
      id: `tn_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Trial',
      quotas: { practitioners: 3, patients: 100, storage: 2, branches: 1 },
      usage: { practitioners: 0, patients: 0, storage: 0, branches: 0 },
      ...tenant,
    }
    set((state) => ({ tenants: [...state.tenants, newTenant] }))
  },
  editTenant: (updated) => {
    set((state) => ({ tenants: state.tenants.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)) }))
  },
  deleteTenant: (id) => {
    set((state) => ({ tenants: state.tenants.filter((t) => t.id !== id) }))
  },
  setTenantStatus: (id, status) => {
    set((state) => ({ tenants: state.tenants.map((t) => (t.id === id ? { ...t, status } : t)) }))
  },

  /* Custom Payment Terms */
  paymentTerms: [
    { id: 'pt1', name: 'Immediate', days: 0, isDefault: false, description: 'Payment due immediately upon receipt.' },
    { id: 'pt2', name: 'Net 7', days: 7, isDefault: true, description: 'Payment due within 7 days of invoice date.' },
    { id: 'pt3', name: 'Net 14', days: 14, isDefault: false, description: 'Payment due within 14 days of invoice date.' },
    { id: 'pt4', name: 'Net 30', days: 30, isDefault: false, description: 'Payment due within 30 days of invoice date.' },
  ],
  addPaymentTerm: (term) => {
    const newTerm = { id: `pt_${Date.now()}`, isDefault: false, ...term }
    set((state) => ({ paymentTerms: [...state.paymentTerms, newTerm] }))
  },
  editPaymentTerm: (updated) => {
    set((state) => ({ paymentTerms: state.paymentTerms.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)) }))
  },
  deletePaymentTerm: (id) => {
    set((state) => ({ paymentTerms: state.paymentTerms.filter((p) => p.id !== id) }))
  },
  setDefaultPaymentTerm: (id) => {
    set((state) => ({
      paymentTerms: state.paymentTerms.map((p) => ({ ...p, isDefault: p.id === id })),
    }))
  },

  /* Template Management */
  allTemplates: [],
  addTemplate: (template) => {
    const newT = {
      id: `tmpl_${Date.now()}`,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Active',
      ...template,
    }
    set((state) => ({ allTemplates: [newT, ...state.allTemplates] }))
  },
  editTemplate: (updated) => {
    set((state) => ({
      allTemplates: state.allTemplates.map((t) =>
        t.id === updated.id ? { ...t, ...updated, lastModified: new Date().toISOString().split('T')[0] } : t
      ),
    }))
  },
  deleteTemplate: (id) => {
    set((state) => ({ allTemplates: state.allTemplates.filter((t) => t.id !== id) }))
  },
  cloneTemplate: (id) => {
    const state = get()
    const original = state.allTemplates.find((t) => t.id === id)
    if (!original) return
    const clone = {
      ...original,
      id: `tmpl_${Date.now()}`,
      name: `${original.name} (Copy)`,
      lastModified: new Date().toISOString().split('T')[0],
    }
    set((s) => ({ allTemplates: [clone, ...s.allTemplates] }))
  },
  archiveTemplate: (id) => {
    set((state) => ({
      allTemplates: state.allTemplates.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Archived' ? 'Active' : 'Archived' } : t
      ),
    }))
  },

  /* Sales CRM State */
  clinics: [],
  setClinics: (clinicsList) => set({ clinics: clinicsList }),
  salesList: [],
  leads: [],
  salesTasks: [],
  salesCalendarEvents: [],
  salesMessages: [],

  addLead: (lead) => {
    const newLead = {
      id: `lead_${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      history: [{ time: new Date().toLocaleString(), text: 'Lead registered.' }],
      notes: '',
      ...lead,
    }
    set((state) => ({ leads: [...state.leads, newLead] }))
  },
  updateLead: (updated) => {
    set((state) => ({
      leads: state.leads.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)),
    }))
  },
  deleteLead: (id) => {
    set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }))
  },
  moveLeadStage: (id, newStage) => {
    set((state) => ({
      leads: state.leads.map((l) => {
        if (l.id === id) {
          const oldStage = l.stage
          return {
            ...l,
            stage: newStage,
            history: [
              ...(l.history || []),
              { time: new Date().toLocaleString(), text: `Moved stage from "${oldStage}" to "${newStage}"` },
            ],
          }
        }
        return l
      }),
    }))
  },
  addLeadActivity: (leadId, activityText) => {
    set((state) => ({
      leads: state.leads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            history: [...(l.history || []), { time: new Date().toLocaleString(), text: activityText }],
          }
        }
        return l
      }),
    }))
  },
  addSalesTask: (task) => {
    const newTask = { id: `task_${Date.now()}`, status: 'Pending', ...task }
    set((state) => ({ salesTasks: [...state.salesTasks, newTask] }))
  },
  updateSalesTask: (id, updates) => {
    set((state) => ({
      salesTasks: state.salesTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },
  deleteSalesTask: (id) => {
    set((state) => ({ salesTasks: state.salesTasks.filter((t) => t.id !== id) }))
  },
  addSalesCalendarEvent: (evt) => {
    const newEvt = { id: `evt_${Date.now()}`, ...evt }
    set((state) => ({ salesCalendarEvents: [...state.salesCalendarEvents, newEvt] }))
  },
  addSalesMessage: (msg) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg,
    }
    set((state) => ({ salesMessages: [...state.salesMessages, newMsg] }))
  },
  setClinicStatus: (clinicId, status) => {
    set((state) => ({
      clinics: state.clinics.map((c) => (c.id === clinicId ? { ...c, status } : c)),
    }))
  },
  addClinic: (newClinic) => {
    set((state) => ({ clinics: [newClinic, ...state.clinics] }))
  },
  editClinic: (updated) => {
    set((state) => ({
      clinics: state.clinics.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    }))
  },
  deleteClinic: (id) => {
    set((state) => ({ clinics: state.clinics.filter((c) => c.id !== id) }))
  },
  setSalesList: (newList) => {
    set({ salesList: newList })
  },

  /* Practitioner Workspace State */
  simulatedSpecialty: undefined,
  setSimulatedSpecialty: (spec) => set({ simulatedSpecialty: spec }),
  practitionerBillingEnabled: true,
  setPractitionerBillingEnabled: (enabled) => set({ practitionerBillingEnabled: enabled }),

  /* Consultations */
  consultations: [],
  addConsultation: (cons) =>
    set((state) => ({
      consultations: [{ id: `cons_${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Draft', ...cons }, ...state.consultations],
    })),
  updateConsultation: (id, updated) =>
    set((state) => ({
      consultations: state.consultations.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    })),

  /* Prescribed Exercises */
  prescribedExercises: [],
  addPrescribedExercise: (prog) =>
    set((state) => ({
      prescribedExercises: [
        { id: `ex_${Date.now()}`, date: new Date().toISOString().split('T')[0], compliance: { viewed: false, started: false, completed: false }, ...prog },
        ...state.prescribedExercises,
      ],
    })),
  updatePrescribedExerciseCompliance: (id, compliance) =>
    set((state) => ({
      prescribedExercises: state.prescribedExercises.map((e) =>
        e.id === id ? { ...e, compliance: { ...e.compliance, ...compliance } } : e
      ),
    })),

  /* Referrals */
  referrals: [],
  addReferral: (ref) =>
    set((state) => ({
      referrals: [{ id: `ref_${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Draft', ...ref }, ...state.referrals],
    })),
  updateReferral: (id, updated) =>
    set((state) => ({
      referrals: state.referrals.map((r) => (r.id === id ? { ...r, ...updated } : r)),
    })),

  /* Practitioner Tasks */
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [{ id: `t_${Date.now()}`, status: 'Pending', ...task }, ...state.tasks],
    })),
  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  /* Communication Messages */
  messages: { internal: [], patient: [] },
  addMessage: (type, msg) =>
    set((state) => {
      const list = state.messages[type] || []
      return {
        messages: {
          ...state.messages,
          [type]: [...list, { timestamp: 'Just now', ...msg }],
        },
      }
    }),
}))
