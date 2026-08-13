import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Upload, Tooltip, Checkbox, Divider } from 'antd'
import { QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import logoImage from '../../../assets/logo2.png'
import { getClinicDetails, updateClinicDetails } from '../../calendar/api/clinicAdminApi'

const { Option } = Select

export default function ClinicDetailsTab() {
  const [form] = Form.useForm()
  const [logoPreview, setLogoPreview] = useState(logoImage)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadDetails = async () => {
      try {
        const res = await getClinicDetails()
        if (res && res.success && res.data && isMounted) {
          const clinic = res.data
          const flags = (clinic.featureFlags && typeof clinic.featureFlags === 'object') ? clinic.featureFlags : {}
          
          if (clinic.logoUrl) {
            setLogoPreview(clinic.logoUrl)
          }

          form.setFieldsValue({
            businessName: clinic.name || 'CEO Therapy',
            workspaceUrl: flags.workspaceUrl || 'ceo-physio.splose.com',
            website: clinic.website || 'www.ceotherapy.com.au',
            businessEmail: clinic.email || 'contact@ceotherapy.com.au',
            patientTerminology: flags.patientTerminology || 'Client',
            currencyCode: flags.currencyCode || 'AUD',
            country: clinic.country || 'Australia',
            currencySymbol: flags.currencySymbol || 'A$',
            defaultComms: flags.defaultComms || 'SMS & Email',
            taxLabel: flags.taxLabel || 'ABN',
            applyToExisting: flags.applyToExisting || false,
          })
        }
      } catch (err) {
        console.error("Failed to load clinic details from live database:", err)
      }
    }
    loadDetails()
    return () => { isMounted = false }
  }, [form])

  const handleSave = async (values) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        logoUrl: logoPreview
      }
      const res = await updateClinicDetails(payload)
      if (res && res.success) {
        toast.success('Clinic details saved to live database successfully!')
      } else {
        toast.error(res?.message || 'Failed to update clinic details')
      }
    } catch (err) {
      console.error("Error saving clinic details:", err)
      toast.error('Error saving clinic details to live database')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imgUrl = e.target.result
      setLogoPreview(imgUrl)
      try {
        await updateClinicDetails({ logoUrl: imgUrl })
        toast.success('Clinic logo updated in live database!')
      } catch (err) {
        console.error("Failed to update logo:", err)
      }
    }
    reader.readAsDataURL(file)
    return false
  }

  const labelWithTooltip = (label, required = false) => (
    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
      {label}
      <Tooltip title="Help information">
        <QuestionCircleOutlined className="text-slate-400 text-[11px]" />
      </Tooltip>
      {required && <span className="text-red-500">*</span>}
    </span>
  )

  const normalLabel = (label, required = false) => (
    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
  )

  return (
    <div className="max-w-[900px] pb-10">
      <h2 className="text-[22px] font-bold text-[#1a1a1a] dark:text-white mb-6">Clinic Details</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={false}
        initialValues={{
          businessName: 'CEO Therapy',
          workspaceUrl: 'ceo-physio.splose.com',
          website: 'www.ceotherapy.com.au',
          businessEmail: '',
          patientTerminology: 'Client',
          currencyCode: 'AUD',
          country: 'Australia',
          currencySymbol: 'A$',
          defaultComms: 'SMS & Email',
          taxLabel: 'ABN',
          applyToExisting: false,
        }}
      >
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column - Inputs */}
          <div className="flex-1 space-y-1">
            <Form.Item
              name="businessName"
              label={normalLabel('Business name', true)}
              rules={[{ required: true, message: 'Business name is required' }]}
              className="mb-4"
            >
              <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </Form.Item>

            <Form.Item
              name="workspaceUrl"
              label={labelWithTooltip('Workspace URL')}
              className="mb-4"
            >
              <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </Form.Item>

            <Form.Item
              name="website"
              label={normalLabel('Website')}
              className="mb-4"
            >
              <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </Form.Item>

            <Form.Item
              name="businessEmail"
              label={normalLabel('Business email', true)}
              rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
              className="mb-4"
            >
              <Input className="rounded-lg h-9 border-black dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm" />
            </Form.Item>
          </div>

          {/* Right Column - Logo */}
          <div className="w-[220px] flex flex-col items-center pt-6">
            <div className="w-full aspect-square border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center p-4 mb-3 bg-white dark:bg-slate-800 overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-400 text-sm">No logo</span>
              )}
            </div>
            
            <Upload showUploadList={false} accept="image/*" beforeUpload={handleLogoUpload}>
              <Button className="rounded-lg text-[13px] border-slate-300 h-8 px-5 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                Upload
              </Button>
            </Upload>
          </div>
        </div>

        <Divider className="my-6 border-slate-200 dark:border-slate-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <Form.Item
            name="patientTerminology"
            label={labelWithTooltip('Patient terminology', true)}
            className="mb-4"
          >
            <Select className="rounded-lg h-9" classNames={{ popup: { root: 'dark:bg-slate-800' } }}>
              <Option value="Client">Client</Option>
              <Option value="Patient">Patient</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="currencyCode"
            label={normalLabel('Currency code', true)}
            className="mb-4"
          >
            <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700" readOnly />
          </Form.Item>

          <Form.Item
            name="country"
            label={normalLabel('Country', true)}
            className="mb-4"
          >
            <Select className="rounded-lg h-9" classNames={{ popup: { root: 'dark:bg-slate-800' } }}>
              <Option value="Australia">Australia</Option>
              <Option value="New Zealand">New Zealand</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="currencySymbol"
            label={normalLabel('Currency symbol', true)}
            className="mb-4"
          >
            <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700" readOnly />
          </Form.Item>

          <div className="mb-4">
            <Form.Item
              name="defaultComms"
              label={labelWithTooltip('Default appointment communication preferences', true)}
              className="mb-2"
            >
              <Select className="rounded-lg h-9" classNames={{ popup: { root: 'dark:bg-slate-800' } }}>
                <Option value="SMS & Email">SMS & Email</Option>
                <Option value="SMS Only">SMS Only</Option>
              </Select>
            </Form.Item>
            <Form.Item name="applyToExisting" valuePropName="checked" className="mb-0">
              <Checkbox className="text-[11px] text-slate-600 dark:text-slate-400">
                Apply to all existing clients and override the current contact preferences.
              </Checkbox>
            </Form.Item>
          </div>

          <div className="mb-4">
            <Form.Item
              name="taxLabel"
              label={labelWithTooltip('Tax Label for invoices (E.g. ABN)', true)}
              className="mb-1"
            >
              <Input className="rounded-lg h-9 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </Form.Item>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Enter your business number in <Link to="/clinic/locations" className="text-[#8C4BFF] hover:underline">Location settings</Link>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }}
            className="rounded-lg font-semibold h-10 px-8 text-sm shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  )
}
