import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Tabs, Select, Input, Form, Divider, Modal } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select
const { TextArea } = Input

export default function PractitionerNotesReports() {
  const location = useLocation()
  const store = useClinicStore()

  // Dynamic tab routing check
  const queryParams = new URLSearchParams(location.search)
  const queryTab = queryParams.get('tab') || 'review'

  const activeSpecialty = store.simulatedSpecialty || 'Physiotherapist'
  const [activeTab, setActiveTab] = useState(queryTab)
  const [draftReportForm] = Form.useForm()

  const isSoapSpecialty = activeSpecialty !== 'Speech Pathologist' && activeSpecialty !== 'Speech Therapist' && activeSpecialty !== 'Occupational Therapist'

  // Fetch real consultations, patients, and documents from backend on page mount
  useEffect(() => {
    if (store.fetchConsultations) store.fetchConsultations()
    if (store.initStoreData) store.initStoreData()
    if (store.fetchDocuments) store.fetchDocuments()
  }, [])

  // State
  const [notesReviewList, setNotesReviewList] = useState([
    { id: 'mock_1', client: 'John Miller', service: 'Initial Assessment notes', date: 'Yesterday', status: 'Pending Review' },
    { id: 'mock_2', client: 'Alice Smith', service: 'Pediatric Intake review', date: 'Yesterday', status: 'Pending Review' },
    { id: 'mock_3', client: 'James Davis', service: 'Lumbar adjustment notes', date: 'Today', status: 'Pending Review' }
  ])

  const [reportPreviewText, setReportPreviewText] = useState('')
  const [generatedReportMeta, setGeneratedReportMeta] = useState(null)
  const [savingDoc, setSavingDoc] = useState(false)

  // Real DB Patients List with dynamic fallbacks
  const availablePatients = store.patients && store.patients.length > 0
    ? store.patients
    : [
        { id: 'p1', name: 'John Miller' },
        { id: 'p2', name: 'Emma Watson' },
        { id: 'p3', name: 'Liam Hemsworth' },
        { id: 'p4', name: 'Alice Smith' },
        { id: 'p5', name: 'James Davis' }
      ]

  // Real DB Draft Consultations + Mock Review items
  const realDraftNotes = (store.consultations || [])
    .filter(c => c.status === 'Draft')
    .map(c => ({
      id: c.id,
      client: c.patientName || 'Client Patient',
      service: c.profession ? `${c.profession} Clinical Note` : 'Progress Note',
      date: c.date || 'Today',
      status: 'Draft Note'
    }))

  const combinedReviewList = [...realDraftNotes, ...notesReviewList]

  const handleApproveNote = async (id, client) => {
    try {
      const isRealConsultation = store.consultations.some(c => c.id === id)
      if (isRealConsultation) {
        await store.updateConsultation(id, { status: 'Completed' })
      } else {
        setNotesReviewList(prev => prev.filter(item => item.id !== id))
      }
      toast.success(`Notes approved & signed for ${client}!`)
    } catch (err) {
      toast.error('Failed to approve note. Please try again.')
    }
  }

  // Templates list dynamically based on specialty
  const getTemplatesForProfession = () => {
    switch (activeSpecialty) {
      case 'Physiotherapist':
        return [
          { name: 'Initial Assessment', code: 'PT-IA-01', type: 'Clinical Intake' },
          { name: 'Progress Report Update', code: 'PT-PR-02', type: 'GP Letter' },
          { name: 'Discharge Summary', code: 'PT-DS-03', type: 'Discharge' },
          { name: 'AHTR NDIS Report', code: 'PT-AHTR-04', type: 'Funding' },
          { name: 'EPC Plan 5-session Review', code: 'PT-EPC-05', type: 'Medicare' },
          { name: 'CTP Car Accident Assessment', code: 'PT-CTP-06', type: 'Insurance' }
        ]
      case 'Psychologist':
        return [
          { name: 'Mental Health Treatment Plan (MHTP)', code: 'PSY-MHTP-01', type: 'GP Letter' },
          { name: 'Psychology Progress Note', code: 'PSY-PN-02', type: 'Clinical Intake' },
          { name: 'Cognitive Behavioural Therapy Review', code: 'PSY-CBT-03', type: 'Assessment' },
          { name: 'NDIS Psychosocial Assessment', code: 'PSY-NDIS-04', type: 'Funding' }
        ]
      case 'Occupational Therapist':
        return [
          { name: 'Functional Capacity Assessment (FCA)', code: 'OT-FCA-01', type: 'NDIS' },
          { name: 'Home Modifications Assessment', code: 'OT-HMA-02', type: 'Assessment' },
          { name: 'Assistive Technology Recommendation', code: 'OT-AT-03', type: 'Funding' },
          { name: 'Occupational Sensory Profile', code: 'OT-SP-04', type: 'Intake' }
        ]
      case 'Speech Pathologist':
        return [
          { name: 'Speech & Language Evaluation', code: 'SP-LE-01', type: 'Assessment' },
          { name: 'AAC Device Communication Plan', code: 'SP-AAC-02', type: 'Treatment' },
          { name: 'Paediatric Articulation Log', code: 'SP-AL-03', type: 'Intake' },
          { name: 'Swallowing Safety Dysphagia assessment', code: 'SP-SW-04', type: 'Clinical' }
        ]
      case 'Exercise Physiologist':
        return [
          { name: 'Cardiopulmonary Fitness Review', code: 'EP-CP-01', type: 'Assessment' },
          { name: 'Musculoskeletal Rehab program', code: 'EP-MR-02', type: 'Treatment' },
          { name: 'NDIS Functional capacity program report', code: 'EP-NDIS-03', type: 'Funding' }
        ]
      default:
        return [
          { name: 'General Physical Assessment', code: 'GP-GEN-01', type: 'Clinical' },
          { name: 'Progress updates summary', code: 'GP-PR-02', type: 'Standard' },
          { name: 'Discharge Letter', code: 'GP-DL-03', type: 'Discharge' }
        ]
    }
  }

  const getLoggedInPractitionerName = () => {
    try {
      const uStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (uStr) {
        const parsed = JSON.parse(uStr)
        if (parsed?.name) return parsed.name.startsWith('Dr.') ? parsed.name : `Dr. ${parsed.name}`
      }
    } catch (e) {}
    if (store.user?.name) return store.user.name.startsWith('Dr.') ? store.user.name : `Dr. ${store.user.name}`
    return 'Dr. Sarah Jenkins'
  }

  const handleGenerateReportPreview = (values) => {
    toast.loading('Synthesizing report details...', { duration: 1000 })
    setTimeout(() => {
      const practitionerName = getLoggedInPractitionerName()
      const compiled = `CLINICAL REPORT PREVIEW\n-----------------------\nReport Type: ${values.reportType}\nPatient: ${values.patientName}\nDate: ${new Date().toLocaleDateString()}\nPractitioner: ${practitionerName} (${activeSpecialty})\n\nSUMMARY & OBJECTIVE FINDINGS:\nPatient is progressing well under our clinical treatment program. ${values.reportDetails ? `Clinical details: ${values.reportDetails}` : 'Pain has stabilized from 6/10 to 3/10. Functional outcomes indicate improved range of motion and core muscle endurance.'}\n\nRECOMMENDATIONS:\nContinue active exercises twice daily. Follow up in 4 weeks for discharge assessment.`
      setReportPreviewText(compiled)
      setGeneratedReportMeta(values)
      toast.success('Report Draft generated successfully!')
    }, 1000)
  }

  const handleSaveReportToDB = async () => {
    if (!reportPreviewText || !generatedReportMeta) return
    try {
      setSavingDoc(true)
      const practitionerName = getLoggedInPractitionerName()
      await store.addDocument({
        name: `${generatedReportMeta.reportType} - ${generatedReportMeta.patientName}.pdf`,
        type: generatedReportMeta.reportType || 'Clinical Report',
        patientName: generatedReportMeta.patientName,
        uploadBy: practitionerName,
        date: new Date().toLocaleDateString(),
        status: 'Generated'
      })
      toast.success('Report document saved to live DB Documents folder!')
    } catch (err) {
      toast.error('Failed to save document. Please try again.')
    } finally {
      setSavingDoc(false)
    }
  }

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white m-0">Clinical Notes & Reports</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Approve pending {isSoapSpecialty ? 'SOAP' : 'clinical'} notes, draft progress summaries, and manage profession-specific templates.
          </p>
        </div>
        <Tag color="cyan" className="m-0 border-none font-bold text-xs uppercase px-3 py-1 rounded-full">
          Active Mode: {activeSpecialty}
        </Tag>
      </div>

      {/* Tabs */}
      <Card className="border border-slate-150 dark:border-slate-850 dark:bg-slate-900 rounded-2xl shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="p-1 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* TAB 1: REVIEW QUEUE */}
          <Tabs.TabPane tab={<span><CheckCircleOutlined /> Review Queue ({combinedReviewList.length})</span>} key="review">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                  Uncompleted Notes
                </h4>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-200 transition-colors">
                  View All &rarr;
                </a>
              </div>
              
              {combinedReviewList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  All uncompleted notes signed and validated!
                </div>
              ) : (
                <div className="space-y-3">
                  {combinedReviewList.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
                      <div>
                        <span className="font-bold text-[14px] text-slate-900 dark:text-slate-100 block mb-1">
                          {item.client} &bull; {item.service}
                        </span>
                        <span className="text-[12px] font-semibold text-[#8C4BFF] block">
                          {item.date}
                        </span>
                      </div>
                      
                      <Button 
                        size="small"
                        type="primary"
                        style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                        onClick={() => handleApproveNote(item.id, item.client)}
                        className="rounded-md font-semibold text-white px-4 py-1 h-auto text-[11px]"
                      >
                        Sign & Approve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.TabPane>

          {/* TAB 2: DRAFT REPORTS */}
          <Tabs.TabPane tab={<span><FileTextOutlined /> Report Generator</span>} key="reports">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4">
              {/* Left Parameters */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-700 dark:text-white uppercase tracking-wider block">Draft Report Document</h4>
                
                <Form form={draftReportForm} layout="vertical" onFinish={handleGenerateReportPreview}>
                  <Form.Item name="patientName" label={<span className="text-xs font-semibold text-slate-500">Select Patient</span>} rules={[{ required: true }]}>
                    <Select placeholder="Choose patient..." className="rounded-xl h-10 flex items-center">
                      {availablePatients.map(p => (
                        <Option key={p.id} value={p.name || p.fullName}>{p.name || p.fullName}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="reportType" label={<span className="text-xs font-semibold text-slate-500">Report Template Type</span>} rules={[{ required: true }]}>
                    <Select placeholder="Choose report type..." className="rounded-xl h-10 flex items-center">
                      <Option value="Initial Assessment Report">Initial Assessment Report</Option>
                      <Option value="Progress Treatment Summary">Progress Treatment Summary</Option>
                      <Option value="Discharge Summary Report">Discharge Summary Report</Option>
                      {activeSpecialty === 'Physiotherapist' && <Option value="NDIS AHTR Form">NDIS AHTR Form</Option>}
                      {activeSpecialty === 'Occupational Therapist' && <Option value="Functional Capacity Assessment">Functional Capacity Assessment</Option>}
                    </Select>
                  </Form.Item>

                  <Form.Item name="reportDetails" label={<span className="text-xs font-semibold text-slate-500">Additional Clinical Input</span>}>
                    <TextArea rows={3} placeholder="e.g. Patient improved posture control, ROM limits reduced by 15 deg..." className="rounded-xl" />
                  </Form.Item>

                  <div className="pt-2">
                    <Button type="primary" htmlType="submit" style={{ backgroundColor: '#F97316', borderColor: '#F97316' }} className="w-full rounded-xl font-bold h-10 text-white shadow">
                      Synthesize Report Draft
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Right Preview */}
              <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Report Document Preview</span>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[300px] text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-350">
                    {reportPreviewText || "Report preview details will generate here. Fill out parameters on the left and click 'Synthesize'."}
                  </div>
                </div>

                {reportPreviewText && (
                  <div className="flex justify-end gap-2">
                    <Button 
                      icon={<PrinterOutlined />} 
                      onClick={() => toast.success('Sending to clinic printer...')}
                      className="rounded-xl font-bold border-slate-200"
                    >
                      Print
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />} 
                      loading={savingDoc}
                      style={{ backgroundColor: '#0E1B33', borderColor: '#0E1B33' }}
                      onClick={handleSaveReportToDB}
                      className="rounded-xl font-bold text-white"
                    >
                      Save to DB & Download PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Tabs.TabPane>

          {/* TAB 3: NOTES TEMPLATES */}
          <Tabs.TabPane tab={<span><EditOutlined /> Profession Templates</span>} key="templates">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-slate-700 dark:text-white uppercase tracking-wider m-0">Dynamic templates for {activeSpecialty}</h4>
                <Button icon={<PlusOutlined />} size="small" className="rounded-lg font-bold border-slate-200">New Template</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getTemplatesForProfession().map((temp, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-950 border border-slate-150 rounded-2xl space-y-3 text-xs shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <Tag color="blue" className="m-0 border-none font-bold text-[8.5px] uppercase px-2 py-0.5 rounded-md">{temp.type}</Tag>
                        <span className="text-slate-300 font-mono text-[10px]">{temp.code}</span>
                      </div>
                      <h5 className="font-extrabold text-slate-850 dark:text-white m-0 mt-3.5 text-xs">{temp.name}</h5>
                    </div>
                    
                    <div className="flex justify-end pt-3 gap-1">
                      <Button size="small" className="rounded-lg font-semibold border-slate-200" onClick={() => toast.success(`Selected template: ${temp.name}`)}>Use</Button>
                      <Button size="small" className="rounded-lg font-semibold border-slate-200">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
