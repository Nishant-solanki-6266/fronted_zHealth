import React, { useState } from 'react'
import { Table, Input, Select, Modal, Form, Space, Upload, Button, Tag, DatePicker } from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  SendOutlined,
  DownloadOutlined, 
  EyeOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'
import dayjs from 'dayjs'
import {
  getDocuments,
  createDocument as createDocumentApi,
  updateDocument as updateDocumentApi,
  deleteDocument as deleteDocumentApi
} from '../../../calendar/api/clinicAdminApi'


const { Option } = Select

export default function ClinicAdminDocuments() {
  const setAddDocModalOpen = useClinicStore(state => state.setAddDocModalOpen)

  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState(undefined)
  const [statusFilter, setStatusFilter] = useState(undefined)
  const [clientFilter, setClientFilter] = useState(undefined)
  const [uploadedByFilter, setUploadedByFilter] = useState(undefined)
  const [dateFilter, setDateFilter] = useState(null)

  const [liveDocs, setLiveDocs] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Modals state
  const [detailVisible, setDetailVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [viewVisible, setViewVisible] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [editForm] = Form.useForm()

  const fetchLiveDocuments = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchText,
        type: typeFilter,
        status: statusFilter,
        client: clientFilter,
        uploadedBy: uploadedByFilter,
        date: dateFilter
      }
      const res = await getDocuments(params)
      if (res && res.success && Array.isArray(res.data)) {
        setLiveDocs(res.data)
      }
    } catch (err) {
      console.error('Error fetching live documents:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchLiveDocuments()
  }, [searchText, typeFilter, statusFilter, clientFilter, uploadedByFilter, dateFilter])

  React.useEffect(() => {
    const handleDocumentAdded = () => fetchLiveDocuments()
    window.addEventListener('document-added', handleDocumentAdded)
    return () => window.removeEventListener('document-added', handleDocumentAdded)
  }, [])

  const filteredDocs = liveDocs

  // Extract unique clients & uploaders for filters
  const uniqueClients = Array.from(new Set(liveDocs.map(d => d.patientName).filter(Boolean)))
  const uniqueUploaders = Array.from(new Set(liveDocs.map(d => d.uploadBy).filter(Boolean)))


  const handleRowClick = (doc) => {
    setSelectedDoc(doc)
    setDetailVisible(true)
  }

  // Table Columns
  const columns = [
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Document Name</span>,
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span 
          onClick={() => handleRowClick(record)}
          className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-[#8C4BFF] transition-colors"
        >
          <FileTextOutlined style={{ color: '#3B82F6', fontSize: 15 }} />
          <span>{text}</span>
        </span>
      )
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Client</span>,
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text) => <span className="text-slate-700 dark:text-slate-300 font-semibold">{text}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Sent To</span>,
      dataIndex: 'sentTo',
      key: 'sentTo',
      render: (text) => <span className="text-slate-500 dark:text-slate-400 font-medium">{text || '—'}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Uploaded By</span>,
      dataIndex: 'uploadBy',
      key: 'uploadBy',
      render: (text) => <span className="text-slate-600 dark:text-slate-400 font-semibold">{text}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Date Uploaded</span>,
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span className="text-slate-500 dark:text-slate-400 font-semibold">{text}</span>
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Type</span>,
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="purple" className="rounded-lg border-none uppercase font-extrabold text-[9px]">
          {type || 'Assessment'}
        </Tag>
      )
    },
    {
      title: <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default'
        if (status === 'Active') color = 'success'
        if (status === 'Sent') color = 'processing'
        if (status === 'Draft') color = 'warning'
        if (status === 'Archived') color = 'default'
        return (
          <Tag color={color} className="rounded-lg border-none uppercase font-extrabold text-[9px]">
            {status || 'Active'}
          </Tag>
        )
      }
    }
  ]

  // Custom Pagination Item Renderer
  const itemRender = (current, type, originalElement) => {
    if (type === 'prev') {
      return <span className="text-slate-500 font-semibold cursor-pointer select-none">&lt; Previous</span>
    }
    if (type === 'next') {
      return <span className="text-slate-500 font-semibold cursor-pointer select-none">Next &gt;</span>
    }
    return originalElement
  }

  return (
    <div className="documents-page-container py-2 space-y-6">
      
      {/* ── Top Header and Controls ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">
              Documents
            </h1>
          </div>
          
          {/* Add Document button */}
          <button
            onClick={() => setAddDocModalOpen(true)}
            className="bg-[#8C4BFF] hover:bg-[#7B3DE8] text-white font-bold h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer border-none shadow-sm text-xs transition-colors duration-150"
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            <span>Add Document</span>
          </button>
        </div>
        
        {/* Row 2: Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search bar */}
          <Input
            placeholder="Search documents"
            prefix={<SearchOutlined className="text-slate-400 mr-1.5" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-56 h-10 border border-slate-200 rounded-xl"
            style={{ width: 200 }}
          />

          {/* Type Selector */}
          <Select
            placeholder="Type"
            allowClear
            value={typeFilter}
            onChange={setTypeFilter}
            className="rounded-xl"
            style={{ width: 140, height: 40 }}
          >
            {['Assessment', 'Plan', 'Consent', 'Note', 'Referral', 'Invoice'].map(t => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>

          {/* Status Selector */}
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            className="rounded-xl"
            style={{ width: 130, height: 40 }}
          >
            {['Active', 'Sent', 'Draft', 'Archived'].map(s => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>

          {/* Client Selector */}
          <Select
            placeholder="Client"
            allowClear
            value={clientFilter}
            onChange={setClientFilter}
            className="rounded-xl"
            style={{ width: 160, height: 40 }}
          >
            {uniqueClients.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>

          {/* Uploaded By Selector */}
          <Select
            placeholder="Uploaded By"
            allowClear
            value={uploadedByFilter}
            onChange={setUploadedByFilter}
            className="rounded-xl"
            style={{ width: 180, height: 40 }}
          >
            {uniqueUploaders.map(u => (
              <Option key={u} value={u}>{u}</Option>
            ))}
          </Select>

          {/* Date Selector */}
          <DatePicker
            placeholder="Date Uploaded"
            format="DD/MM/YYYY"
            value={dateFilter ? dayjs(dateFilter, 'DD/MM/YYYY') : null}
            onChange={(date, dateString) => setDateFilter(dateString)}
            className="rounded-xl border border-slate-200"
            style={{ width: 140, height: 40 }}
          />

        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden reports-card">
        <Table
          dataSource={filteredDocs}
          columns={columns}
          rowKey="id"
          className="border-none"
          pagination={{
            pageSize: 15,
            showTotal: (total, range) => (
              <span className="text-slate-400 font-bold text-xs select-none">
                Showing {range[0]}-{range[1]} out of {total}
              </span>
            ),
            itemRender: itemRender,
            className: "ant-table-pagination"
          }}
        />
      </div>

      {/* ── Document Details Modal ── */}
      <Modal
        title={selectedDoc ? `Document details: ${selectedDoc.name}` : ''}
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setSelectedDoc(null); }}
        footer={null}
        destroyOnClose
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        {selectedDoc && (
          <div className="space-y-6 mt-4 font-sans">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Document Name</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block select-all">{selectedDoc.name}</span>
              </div>
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Associated Client</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">{selectedDoc.patientName}</span>
              </div>
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Date Uploaded</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">{selectedDoc.date}</span>
              </div>
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Uploaded By</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">{selectedDoc.uploadBy}</span>
              </div>
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Last Modified Date</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">{selectedDoc.date}</span>
              </div>
              <div>
                <span className="text-slate-450 uppercase tracking-wider block font-bold text-[9px]">Type & Status</span>
                <div className="mt-1 flex gap-1.5">
                  <Tag color="purple" className="rounded-lg border-none font-bold text-[9px] uppercase">
                    {selectedDoc.type || 'Assessment'}
                  </Tag>
                  <Tag color="success" className="rounded-lg border-none font-bold text-[9px] uppercase">
                    {selectedDoc.status || 'Active'}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Sending History */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px] mb-2">Sending History</span>
              <div className="flex justify-between items-center text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                <span className="w-1/4">Sent To</span>
                <span className="w-1/4">Date Sent</span>
                <span className="w-1/4">Sent By</span>
                <span className="w-1/4 text-right">Delivery Status</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-semibold">
                <span className="w-1/4 truncate pr-2">{selectedDoc.sentTo || '—'}</span>
                <span className="w-1/4">{selectedDoc.status === 'Sent' ? selectedDoc.date : '—'}</span>
                <span className="w-1/4">{selectedDoc.status === 'Sent' ? selectedDoc.uploadBy : '—'}</span>
                <span className="w-1/4 text-right">
                  <Tag color={selectedDoc.status === 'Sent' ? 'blue' : 'default'} className="rounded-lg border-none uppercase font-bold text-[8px] m-0">
                    {selectedDoc.status === 'Sent' ? 'Delivered' : 'Not Sent'}
                  </Tag>
                </span>
              </div>
            </div>

            {/* Document operations */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px] mb-3">Document Actions</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => {
                    setDetailVisible(false)
                    setViewVisible(true)
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center"
                >
                  View
                </Button>

                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => {
                    const blob = new Blob(['Dummy document content for ' + selectedDoc.name], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = selectedDoc.name || 'document.txt'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast.success(`Downloaded ${selectedDoc.name}`)
                    setDetailVisible(false)
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center text-[#8C4BFF] border-[#8C4BFF]/25"
                >
                  Download
                </Button>

                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    editForm.setFieldsValue({
                      name: selectedDoc.name,
                      patientName: selectedDoc.patientName,
                    })
                    setEditVisible(true)
                    setDetailVisible(false)
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center"
                >
                  Edit
                </Button>

                <Button 
                  icon={<SendOutlined />} 
                  onClick={async () => {
                    try {
                      await updateDocumentApi(selectedDoc.id, { status: 'Sent' })
                      toast.success(`Document dispatched to ${selectedDoc.sentTo || 'Recipient'}`)
                      setDetailVisible(false)
                      fetchLiveDocuments()
                    } catch (err) {
                      toast.error('Failed to send document')
                    }
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center text-blue-600 border-blue-200"
                >
                  Send
                </Button>

                <Upload
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    try {
                      await updateDocumentApi(selectedDoc.id, { name: file.name })
                      toast.success(`File replaced with ${file.name} in live database!`)
                      setDetailVisible(false)
                      fetchLiveDocuments()
                    } catch (err) {
                      toast.error('Failed to replace file')
                    }
                    return false
                  }}
                  className="w-full"
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="rounded-xl font-bold text-xs h-10 flex items-center justify-center w-full"
                  >
                    Replace
                  </Button>
                </Upload>

                <Button 
                  icon={<FolderOpenOutlined />} 
                  onClick={async () => {
                    try {
                      await updateDocumentApi(selectedDoc.id, { status: 'Archived' })
                      toast.success('Document marked as Archived in live database')
                      setDetailVisible(false)
                      fetchLiveDocuments()
                    } catch (err) {
                      toast.error('Failed to archive document')
                    }
                  }}
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center text-slate-500 border-slate-200"
                >
                  Archive
                </Button>

                <Button 
                  icon={<DeleteOutlined />} 
                  onClick={async () => {
                    try {
                      await deleteDocumentApi(selectedDoc.id)
                      toast.success('Document deleted permanently from live database')
                      setDetailVisible(false)
                      fetchLiveDocuments()
                    } catch (err) {
                      toast.error('Failed to delete document')
                    }
                  }}
                  danger
                  className="rounded-xl font-bold text-xs h-10 flex items-center justify-center sm:col-span-2"
                >
                  Delete Document
                </Button>

              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        title={null}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        closeIcon={<span className="text-slate-400 hover:text-white transition-colors">✕</span>}
        className="[&_.ant-modal-content]:bg-[#1C1C28] [&_.ant-modal-content]:p-6 [&_.ant-modal-content]:rounded-[24px]"
        width={500}
      >
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white m-0">Edit document</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">Update document details</p>
        </div>

        <Form 
          layout="vertical" 
          form={editForm} 
          onFinish={async (values) => {
            try {
              await updateDocumentApi(selectedDoc.id, values)
              toast.success('Document updated successfully in live database!')
              setEditVisible(false)
              fetchLiveDocuments()
            } catch (err) {
              toast.error('Failed to update document in live database')
            }
          }}
        >

          <div className="grid grid-cols-1 gap-4">
            <Form.Item 
              name="name" 
              label={<span className="text-slate-300 font-semibold text-xs">Document name</span>} 
              rules={[{ required: true, message: 'Please enter document name' }]}
            >
              <Input className="w-full bg-[#2A2A36] text-white placeholder-slate-500 border-none rounded-lg h-10 hover:bg-[#323240] focus:bg-[#323240] transition-colors" />
            </Form.Item>
            <Form.Item 
              name="patientName" 
              label={<span className="text-slate-300 font-semibold text-xs">Patient name</span>} 
              rules={[{ required: true, message: 'Please enter patient name' }]}
            >
              <Input className="w-full bg-[#2A2A36] text-white placeholder-slate-500 border-none rounded-lg h-10 hover:bg-[#323240] focus:bg-[#323240] transition-colors" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              onClick={() => setEditVisible(false)}
              className="bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold rounded-xl h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="bg-[#8C4BFF] hover:bg-[#8C4BFF]/90 border-none font-bold rounded-xl h-10 px-6"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        title={null}
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={null}
        width={700}
        closeIcon={<span className="text-slate-400 hover:text-white transition-colors">✕</span>}
        className="[&_.ant-modal-content]:bg-[#1C1C28] [&_.ant-modal-content]:p-0 [&_.ant-modal-content]:rounded-[24px] [&_.ant-modal-content]:overflow-hidden"
      >
        {selectedDoc && (
          <div>
            {/* Header */}
            <div className="bg-[#8C4BFF]/10 border-b border-[#8C4BFF]/20 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8C4BFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileTextOutlined style={{ color: '#8C4BFF', fontSize: 18 }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base m-0">{selectedDoc.name}</h3>
                <span className="text-slate-400 text-xs font-medium">Document Preview</span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block mb-1">Client</span>
                <span className="text-white text-sm font-semibold">{selectedDoc.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block mb-1">Uploaded By</span>
                <span className="text-white text-sm font-semibold">{selectedDoc.uploadBy}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block mb-1">Date Uploaded</span>
                <span className="text-white text-sm font-semibold">{selectedDoc.date}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block mb-1">Type & Status</span>
                <div className="flex items-center gap-2">
                  <Tag color="purple" className="rounded-lg border-none uppercase font-extrabold text-[9px] m-0">{selectedDoc.type}</Tag>
                  <Tag color={selectedDoc.status === 'Active' ? 'success' : selectedDoc.status === 'Sent' ? 'processing' : 'default'} className="rounded-lg border-none uppercase font-extrabold text-[9px] m-0">{selectedDoc.status}</Tag>
                </div>
              </div>
            </div>

            {/* File Preview Area */}
            <div className="px-6 py-5">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block mb-3">File Contents</span>
              <div className="bg-[#0D0D14] border border-slate-800 rounded-xl p-5 min-h-[180px] flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-[#8C4BFF]/10 rounded-2xl flex items-center justify-center">
                  <FileTextOutlined style={{ color: '#8C4BFF', fontSize: 26 }} />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 font-semibold text-sm m-0">{selectedDoc.name}</p>
                  <p className="text-slate-500 text-xs mt-1 m-0">This is a simulated document file. In production, the actual file content would be rendered here.</p>
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const blob = new Blob([`Document: ${selectedDoc.name}\nClient: ${selectedDoc.patientName}\nUploaded By: ${selectedDoc.uploadBy}\nDate: ${selectedDoc.date}\nType: ${selectedDoc.type}\nStatus: ${selectedDoc.status}`], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = selectedDoc.name || 'document.txt'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast.success(`Downloaded ${selectedDoc.name}`)
                  }}
                  className="mt-1 rounded-xl font-bold text-xs h-9 border-[#8C4BFF]/40 text-[#8C4BFF] hover:border-[#8C4BFF]"
                >
                  Download File
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex justify-end">
              <Button
                onClick={() => setViewVisible(false)}
                className="bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold rounded-xl h-10 px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}


