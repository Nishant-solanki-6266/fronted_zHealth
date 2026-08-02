import React, { useState } from 'react'
import { useClinicStore } from '../../../../store/clinicStore'
import { Card, Table, Tag, Button, Upload, Space, Modal, Input } from 'antd'
import { PictureOutlined, CheckCircleOutlined, FormOutlined, FileTextOutlined, CloudUploadOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

const { Dragger } = Upload

export default function PatientFormsDocuments() {
  const store = useClinicStore()
  const darkMode = store.darkMode

  const [fillFormOpen, setFillFormOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)

  const [formsList, setFormsList] = useState([
    { id: 'f_1', name: 'ZealthOS Clinical Intake & Medical History Form', category: 'Intake', status: 'Pending' },
    { id: 'f_2', name: 'General Patient Consent & Treatment Acknowledgment', category: 'Consent', status: 'Completed' },
    { id: 'f_3', name: 'NDIS Plan Participant Details & Service Agreement Form', category: 'NDIS', status: 'Pending' },
    { id: 'f_4', name: 'ODI (Oswestry Disability Index) Questionnaire', category: 'Outcome Measures', status: 'Completed' }
  ])

  const [documentsList, setDocumentsList] = useState([
    { id: 'doc_1', name: 'NDIS_Functional_Assessment_Sarah_Jenkins.pdf', type: 'Clinical Report', date: '08 Jun 2026', size: '2.4 MB' },
    { id: 'doc_2', name: 'GP_Referral_Letter_Arthur_Conan.pdf', type: 'Referral', date: '02 Jan 2026', size: '1.2 MB' },
    { id: 'doc_3', name: 'Lumbar_MRI_Scan_Report_Southside.pdf', type: 'Imaging', date: '12 Apr 2026', size: '3.8 MB' },
    { id: 'doc_4', name: 'Medical_Certificate_Low_Back_Strain.pdf', type: 'Medical Certificate', date: '14 May 2026', size: '420 KB' }
  ])

  const handleCompleteForm = (form) => {
    setSelectedForm(form)
    setFillFormOpen(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setFormsList(prev => prev.map(f => f.id === selectedForm.id ? { ...f, status: 'Completed' } : f))
    toast.success(`${selectedForm.name} submitted successfully!`)
    setFillFormOpen(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Intro header */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-808 dark:text-white m-0">Forms, Claims & Documents Center</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-semibold">
              Complete required clinical forms, view shared medical letters/referrals, and securely upload scan documents.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '24px' }}>
        {/* Left Columns: Forms & Documents list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Forms */}
          <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">My Actionable Clinic Forms</span>}>
            <div className="space-y-4">
              {formsList.map(form => (
                <div key={form.id} className="flex justify-between items-center p-3.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{form.name}</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block mt-0.5">Category: {form.category}</span>
                  </div>
                  <Button
                    size="small"
                    onClick={() => handleCompleteForm(form)}
                    style={form.status === 'Completed' ? { backgroundColor: darkMode ? '#064E3B' : '#ECFDF5', color: darkMode ? '#34D399' : '#059669', border: 'none' } : { backgroundColor: '#8C4BFF', color: 'white', border: 'none' }}
                    className="rounded-lg text-[10px] font-bold px-3 h-8 flex items-center justify-center gap-1"
                  >
                    {form.status === 'Completed' ? <CheckCircleOutlined /> : <FormOutlined />}
                    <span>{form.status === 'Completed' ? 'Done' : 'Complete Form'}</span>
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Stored Healthcare Documents */}
          <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">My Health Records & Reports Ledger</span>}>
            <Table
              dataSource={documentsList}
              rowKey="id"
              pagination={false}
              scroll={{ x: 700 }}
              className="border-none"
              columns={[
                {
                  title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Document Name</span>,
                  render: (_, rec) => (
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-[#8C4BFF] text-sm flex-shrink-0" />
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs block truncate max-w-[200px] sm:max-w-[320px]">{rec.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{rec.type} &bull; {rec.size}</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Received Date</span>,
                  dataIndex: 'date',
                  render: (d) => <span className="text-slate-500 font-semibold text-xs">{d}</span>
                },
                {
                  title: '',
                  align: 'right',
                  render: (_, rec) => (
                    <Button 
                      size="small" 
                      onClick={() => {
                        // Dummy download functionality
                        const element = document.createElement("a");
                        const file = new Blob(["Simulated PDF Content for " + rec.name], {type: 'application/pdf'});
                        element.href = URL.createObjectURL(file);
                        element.download = rec.name;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success(`${rec.name} downloaded successfully!`)
                      }}
                      className="rounded-lg text-[9px] font-bold h-7 border-slate-200"
                    >
                      Download
                    </Button>
                  )
                }
              ]}
            />
          </Card>

        </div>

        {/* Right Column: Upload Documents widget */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900" title={<span className="font-extrabold text-xs text-slate-700 dark:text-slate-350">Upload Medical Records / Scan Reports</span>}>
            <div className="space-y-4">
              <p className="text-slate-400 text-xs font-semibold">Upload referrals, radiology imaging scans, or NDIS plan letters for review by your Care Team practitioners.</p>
              
              <Dragger
                beforeUpload={(file) => {
                  const newDoc = {
                    id: `doc_${Date.now()}`,
                    name: file.name,
                    type: 'Uploaded Document',
                    date: 'Today',
                    size: `${Math.round(file.size / 1024)} KB`
                  }
                  setDocumentsList(prev => [newDoc, ...prev])
                  toast.success(`${file.name} uploaded and shared with care practitioners successfully!`)
                  return false
                }}
                maxCount={1}
                showUploadList={false}
                className="rounded-2xl text-center py-6"
                style={{
                  backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                  border: darkMode ? '1.5px dashed #334155' : '1.5px dashed #E2E8F0',
                  borderRadius: '16px',
                  padding: '16px'
                }}
              >
                <div className="w-12 h-12 bg-[#8C4BFF]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-[#8C4BFF]">
                  <CloudUploadOutlined style={{ fontSize: 20 }} />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-300 m-0">Drag & drop or click to upload</p>
                <span className="text-[10px] text-slate-400 block mt-1 mb-4">Accepts PDFs, Images, Scans</span>
                
                <Button type="primary" style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-xl font-bold text-xs h-8 px-5 shadow-sm text-white">
                  Browse Files
                </Button>
              </Dragger>
            </div>
          </Card>
        </div>
      </div>

      {/* Fill Form Modal */}
      {selectedForm && (
        <Modal
          open={fillFormOpen}
          onCancel={() => setFillFormOpen(false)}
          title={<span className="font-bold text-slate-808 dark:text-white text-sm">{selectedForm.name}</span>}
          footer={null}
          destroyOnHidden
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600">
              Please fill in all clinical questions below. The submitted form will be linked directly to your patient profile history.
            </div>

            {selectedForm.category === 'Intake' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chief Complaint & Pain Location</label>
                  <Input placeholder="e.g. Lower back stiffness, calf strain pain" required className="rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Active Medications</label>
                  <Input placeholder="e.g. Panadol, anti-inflammatories" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Known Allergies / Medical Conditions</label>
                  <Input.TextArea placeholder="e.g. Penicillin, diabetes" rows={2} className="rounded-xl" />
                </div>
              </div>
            )}

            {selectedForm.category === 'Consent' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  I hereby authorize ZealthOS partner practitioners to perform physical rehabilitation and assessments in alignment with my treatment plans.
                </p>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Signature / Name</label>
                  <Input placeholder="Type full name to sign" required className="rounded-xl" />
                </div>
              </div>
            )}

            {selectedForm.category !== 'Intake' && selectedForm.category !== 'Consent' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Participant NDIS Number</label>
                  <Input placeholder="e.g. 430912345" required className="rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Plan Coordinator Email</label>
                  <Input placeholder="e.g. claims@planpartners.com.au" className="rounded-xl" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setFillFormOpen(false)} className="rounded-xl font-bold border-slate-200">Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-xl font-bold text-xs text-white">Submit Secure Form</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}
