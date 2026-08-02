import api from '../../../api/axios'

export const getSuperAdminProfile = async () => {
  const res = await api.get('/api/super-admin/profile')
  return res.data
}

export const updateSuperAdminProfile = async (profileData) => {
  const res = await api.put('/api/super-admin/profile', profileData)
  return res.data
}

export const getSettingsTemplates = async () => {
  const res = await api.get('/api/super-admin/settings/templates')
  return res.data
}

export const createSettingsTemplate = async (templateData) => {
  const res = await api.post('/api/super-admin/settings/templates', templateData)
  return res.data
}

export const deleteSettingsTemplate = async (type, id) => {
  const res = await api.delete(`/api/super-admin/settings/templates/${type}/${id}`)
  return res.data
}

export const getServices = async () => {
  const res = await api.get('/api/super-admin/settings/services')
  return res.data
}

export const createService = async (serviceData) => {
  const res = await api.post('/api/super-admin/settings/services', serviceData)
  return res.data
}

export const updateService = async (id, serviceData) => {
  const res = await api.put(`/api/super-admin/settings/services/${id}`, serviceData)
  return res.data
}

export const deleteService = async (id) => {
  const res = await api.delete(`/api/super-admin/settings/services/${id}`)
  return res.data
}

export const getClientTags = async () => {
  const res = await api.get('/api/super-admin/settings/tags')
  return res.data
}

export const createClientTag = async (tagData) => {
  const res = await api.post('/api/super-admin/settings/tags', tagData)
  return res.data
}

export const updateClientTag = async (id, tagData) => {
  const res = await api.put(`/api/super-admin/settings/tags/${id}`, tagData)
  return res.data
}

export const deleteClientTag = async (id) => {
  const res = await api.delete(`/api/super-admin/settings/tags/${id}`)
  return res.data
}

export const getCancellationReasons = async () => {
  const res = await api.get('/api/super-admin/settings/cancellation-reasons')
  return res.data
}

export const createCancellationReason = async (reasonData) => {
  const res = await api.post('/api/super-admin/settings/cancellation-reasons', reasonData)
  return res.data
}

export const updateCancellationReason = async (id, reasonData) => {
  const res = await api.put(`/api/super-admin/settings/cancellation-reasons/${id}`, reasonData)
  return res.data
}

export const deleteCancellationReason = async (id) => {
  const res = await api.delete(`/api/super-admin/settings/cancellation-reasons/${id}`)
  return res.data
}

export const processDataImport = async (importData) => {
  const res = await api.post('/api/super-admin/settings/import', importData)
  return res.data
}

export const logDataExport = async (exportData) => {
  const res = await api.post('/api/super-admin/settings/export', exportData)
  return res.data
}

export const getDataLogs = async () => {
  const res = await api.get('/api/super-admin/settings/data-logs')
  return res.data
}

export const changeSuperAdminPassword = async (passwords) => {
  const res = await api.post('/api/super-admin/change-password', passwords)
  return res.data
}

export const getLoginHistoryLogs = async () => {
  const res = await api.get('/api/super-admin/login-history')
  return res.data
}

export const revokeDeviceSession = async (id) => {
  const res = await api.delete(`/api/super-admin/sessions/${id}`)
  return res.data
}
