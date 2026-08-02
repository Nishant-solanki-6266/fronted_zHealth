import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, Select, Tag, Space } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  TagOutlined,
  StarOutlined,
  HeartOutlined,
  WarningOutlined,
  FlagOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  ApiOutlined,
  AuditOutlined,
  SmileOutlined,
  CrownOutlined,
  FireOutlined,
  AlertOutlined
} from '@ant-design/icons'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

const tagIconsMap = {
  TagOutlined: <TagOutlined style={{ fontSize: 10 }} />,
  StarOutlined: <StarOutlined style={{ fontSize: 10 }} />,
  HeartOutlined: <HeartOutlined style={{ fontSize: 10 }} />,
  WarningOutlined: <WarningOutlined style={{ fontSize: 10 }} />,
  FlagOutlined: <FlagOutlined style={{ fontSize: 10 }} />,
  LockOutlined: <LockOutlined style={{ fontSize: 10 }} />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined style={{ fontSize: 10 }} />,
  InfoCircleOutlined: <InfoCircleOutlined style={{ fontSize: 10 }} />,
  ApiOutlined: <ApiOutlined style={{ fontSize: 10 }} />,
  AuditOutlined: <AuditOutlined style={{ fontSize: 10 }} />,
  SmileOutlined: <SmileOutlined style={{ fontSize: 10 }} />,
  CrownOutlined: <CrownOutlined style={{ fontSize: 10 }} />,
  FireOutlined: <FireOutlined style={{ fontSize: 10 }} />,
  AlertOutlined: <AlertOutlined style={{ fontSize: 10 }} />,
}

function renderTagIcon(iconName) {
  return tagIconsMap[iconName] || <TagOutlined style={{ fontSize: 10 }} />
}

function ClientTag({ label, clientTags }) {
  const matched = clientTags.find(t => t.name.toLowerCase() === label.toLowerCase())
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
      <span>{label}</span>
    </span>
  )
}

export default function PatientsPage() {
  const store = useClinicStore()
  const navigate = useNavigate()
  const basePath = window.location.pathname.split('/')[1] ? `/${window.location.pathname.split('/')[1]}` : '/clinic'
  const [searchText, setSearchText] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState('Clients name')

  const filteredPatients = store.patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (p.phone || '').includes(searchText)
    const matchesTag = selectedTag ? (p.tags || []).includes(selectedTag) : true
    return matchesSearch && matchesTag
  })

  // Paginate: show 15 per page
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE)
  const pageData = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* ── Header + Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white m-0">Clients Details</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-semibold">Manage your all registered patients</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <SearchOutlined
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 13 }}
            />
            <input
              type="text"
              placeholder="Search client here..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#8C4BFF] transition-colors"
            />
          </div>

          {/* Filters & Add Client Button Group */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Tag filter */}
            <Select
              placeholder="All tags"
              allowClear
              value={selectedTag || undefined}
              onChange={(v) => {
                setSelectedTag(v || '')
                setPage(1)
              }}
              className="rounded-xl flex-1 sm:flex-none"
              style={{ minWidth: 120, height: 38 }}
            >
              {store.clientTags.map((tag) => (
                <Option key={tag.id} value={tag.name}>
                  <span className="inline-flex items-center gap-1.5">
                    {renderTagIcon(tag.icon)}
                    <span>{tag.name}</span>
                  </span>
                </Option>
              ))}
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={setSortBy}
              className="rounded-xl flex-1 sm:flex-none"
              style={{ minWidth: 130, height: 38 }}
            >
              <Option value="Clients name">Clients name</Option>
              <Option value="Date of Birth">Date of Birth</Option>
              <Option value="Recent">Recent</Option>
            </Select>

            {/* Add Client Button */}
            <button
              onClick={() => navigate(`${basePath}/patients/new`)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-85 cursor-pointer whitespace-nowrap bg-[#8C4BFF] h-[38px] flex-shrink-0"
            >
              <PlusOutlined style={{ fontSize: 10 }} />
              add client
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="w-full">
            {/* Table Header */}
            <div
              className="hidden md:grid text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
              style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr 2fr', alignItems: 'stretch' }}
            >
              <span className="bg-slate-50 dark:bg-slate-800/60 py-3 px-6 font-bold text-slate-700 dark:text-slate-300">Client Name</span>
              <span className="py-3 px-4 flex items-center">Date of Birth</span>
              <span className="py-3 px-4 flex items-center">Contact Number</span>
              <span className="py-3 px-4 flex items-center">Email</span>
              <span className="py-3 px-4 flex items-center">Tags</span>
            </div>

            {/* Table Rows */}
            {pageData.map((patient, idx) => (
              <div
                key={patient.id}
                onClick={() => navigate(`${basePath}/patients/${patient.id}`)}
                className="flex flex-col md:grid border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group py-2 md:py-0"
                style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr 2fr', alignItems: 'stretch' }}
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#8C4BFF] transition-colors bg-slate-50/50 md:bg-slate-50 dark:bg-slate-800/50 md:dark:bg-slate-800 py-3 md:py-4 px-4 md:px-6 md:border-r border-slate-100/50 dark:border-slate-800/30 flex items-center justify-between">
                  <span className="md:hidden font-bold text-xs text-slate-400 uppercase tracking-wider">Client Name</span>
                  {patient.name}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400 py-1.5 md:py-4 px-4 flex items-center justify-between">
                  <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase tracking-wider">Date of Birth</span>
                  {patient.dob ? dayjs(patient.dob).format('D MMM, YYYY') : '—'}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400 py-1.5 md:py-4 px-4 flex items-center justify-between">
                  <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase tracking-wider">Contact</span>
                  {patient.phone || '—'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-500 py-1.5 md:py-4 px-4 flex items-center justify-between truncate">
                  <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="truncate">{patient.email || '—'}</span>
                </span>
                <div className="flex flex-wrap gap-1 py-3 md:py-4 px-4 items-center justify-start md:justify-start">
                  {(patient.tags || []).slice(0, 3).map((tag) => (
                    <ClientTag key={tag} label={tag} clientTags={store.clientTags} />
                  ))}
                </div>
              </div>
            ))}

            {pageData.length === 0 && (
              <div className="py-16 text-center text-slate-300">
                <p className="text-sm font-semibold text-slate-400">No clients found</p>
                <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredPatients.length)} out of {filteredPatients.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                {'< Previous'}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${page === p ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-slate-400 text-xs px-1">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-7 h-7 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 transition-colors"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                {'Next >'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
