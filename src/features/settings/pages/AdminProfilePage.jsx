import React, { useState, useEffect } from 'react'
import { Form, Input, Button, DatePicker, Select, Radio, Space, Upload, Card, Divider } from 'antd'
import { UploadOutlined, DeleteOutlined, LockOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useClinicStore } from '../../../store/clinicStore'
import { toast } from 'react-hot-toast'
import PractitionerProfilePage from './PractitionerProfilePage'

const { Option } = Select

export default function AdminProfilePage() {
  const [form] = Form.useForm()
  const store = useClinicStore()
  const [saving, setSaving] = useState(false)
  
  if (store.userRole === 'practitioner') {
    return <PractitionerProfilePage />
  }
  
  // This state holds the loaded user details to display in the header card
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    id: '',
    username: '',
    status: 'Active',
    avatar: null
  })

  useEffect(() => {
    const authUserId = localStorage.getItem('userId') || '1'
    let authUser = null

    if (store.userRole === 'practitioner' && store.practitioners) {
      authUser = store.practitioners.find(p => p.id === authUserId) || store.practitioners[0]
    } else if (store.userRole === 'patient' && store.patients) {
      authUser = store.patients.find(p => p.id === authUserId) || store.patients[0]
    } else if ((store.userRole === 'clinic' || store.userRole === 'head_admin') && store.admins) {
      authUser = store.admins.find(a => a.id === authUserId) || store.admins[0]
    }

    let roleDisplay = 'Clinic Admin'
    let nameDisplay = 'Admin User'

    if (store.userRole === 'head_admin') {
      roleDisplay = 'Super Admin'
      nameDisplay = 'Alex Sadman'
    } else if (store.userRole === 'clinic') {
      roleDisplay = 'Clinic Admin'
      nameDisplay = 'Clinic Manager'
    } else if (store.userRole === 'sales') {
      roleDisplay = 'Sales Executive'
      nameDisplay = 'Sales Representative'
    } else if (store.userRole === 'patient') {
      roleDisplay = 'Patient'
    }

    if (authUser) {
      setUserInfo({
        name: nameDisplay, // Override the name with a clean default for demo
        role: roleDisplay,
        id: authUser.id || (store.userRole === 'patient' ? 'p1' : '6351651'),
        username: authUser.username || authUser.email?.split('@')[0] || store.userRole,
        status: authUser.status || 'Active',
        avatar: authUser.avatar || null
      })

      form.setFieldsValue({
        name: nameDisplay,
        mobile: authUser.phone || '+61 400 000 000',
        email: authUser.email || `${store.userRole}@clinic.com`,
        dob: authUser.dob ? dayjs(authUser.dob) : dayjs('1985-06-15'),
        gender: authUser.gender || 'Female',
        street: '123 Health Ave',
        city: 'Medical District',
        state: 'NSW',
        country: 'Australia',
        postalCode: '2000'
      })
    } else {
      setUserInfo({
        name: nameDisplay,
        role: roleDisplay,
        id: '6351651',
        username: `${store.userRole}_admin`,
        status: 'Active',
        avatar: null
      })
      form.setFieldsValue({
        name: nameDisplay,
        mobile: '+61 412 345 678',
        email: `${store.userRole}@clinic.com`,
        dob: dayjs('1980-01-01'),
        gender: 'Female',
        street: '45 Care Street',
        city: 'Sydney',
        state: 'NSW',
        country: 'Australia',
        postalCode: '2000'
      })
    }
  }, [store, form])

  const handleSave = (values) => {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile updated successfully!')
      setUserInfo(prev => ({
        ...prev,
        name: values.name
      }))
      // Reset password fields after save
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }, 800)
  }

  const handleAvatarRemove = () => {
    setUserInfo(prev => ({ ...prev, avatar: null }))
    toast.success('Profile photo removed')
  }

  const beforeUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUserInfo(prev => ({ ...prev, avatar: e.target.result }))
    }
    reader.readAsDataURL(file)
    return false // Prevent automatic upload
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto p-4 lg:p-6 text-slate-800 dark:text-slate-200">
      
      {/* Top Card: Profile Summary */}
      <div className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex gap-5 items-center">
          {/* Avatar Box & Actions */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-[100px] h-[100px] rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-[#252836] flex items-center justify-center">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs text-center px-2">No Photo</span>
              )}
            </div>
            <div className="flex gap-1 mt-1">
              <Upload showUploadList={false} beforeUpload={beforeUpload}>
                <Button size="small" type="text" className="text-[10px] uppercase font-bold text-[#8C4BFF] hover:bg-[#8C4BFF]/10">Change</Button>
              </Upload>
              {userInfo.avatar && (
                <Button size="small" type="text" danger className="text-[10px] uppercase font-bold" onClick={handleAvatarRemove}>Remove</Button>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex flex-col justify-center h-full">
            <h2 className="text-xl font-medium m-0 text-slate-800 dark:text-slate-200 tracking-wide">
              {userInfo.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-[13px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{userInfo.role}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>@{userInfo.username}</span>
            </div>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 m-0 mt-1">
              Account ID: {userInfo.id.replace('usr_', '')}
            </p>
          </div>
        </div>

        {/* Active Badge */}
        <div className="border border-slate-300 dark:border-slate-600 rounded-full px-4 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
          ● {userInfo.status}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={false}
        className="admin-profile-form space-y-6"
      >
        {/* Personal Information */}
        <div className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <Form.Item name="name" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Full Name</span>} rules={[{ required: true }]}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="email" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Email Address</span>} rules={[{ required: true, type: 'email' }]}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="mobile" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Mobile Number</span>}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="dob" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Date of Birth</span>}>
              <DatePicker className="h-11 w-full rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" format="MM/DD/YYYY" />
            </Form.Item>

            <Form.Item name="gender" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Gender</span>}>
              <Select className="h-11 w-full" popupClassName="dark:bg-[#1f222b]">
                <Option value="Female">Female</Option>
                <Option value="Male">Male</Option>
                <Option value="Non-binary">Non-binary</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Address */}
        <div className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">Address Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <Form.Item name="street" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Street Address</span>} className="md:col-span-2">
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="city" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">City</span>}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="state" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">State/Province</span>}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="postalCode" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Postal Code</span>}>
              <Input className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="country" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Country</span>}>
              <Select className="h-11 w-full" popupClassName="dark:bg-[#1f222b]">
                <Option value="Australia">Australia</Option>
                <Option value="United States">United States</Option>
                <Option value="United Kingdom">United Kingdom</Option>
                <Option value="New Zealand">New Zealand</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Security */}
        <div className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <LockOutlined className="text-[#8C4BFF]" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider m-0">Security & Password</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <Form.Item name="currentPassword" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Current Password</span>}>
              <Input.Password className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>
            <div className="hidden md:block"></div>
            
            <Form.Item name="newPassword" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">New Password</span>}>
              <Input.Password className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>

            <Form.Item name="confirmPassword" label={<span className="text-slate-600 dark:text-slate-400 text-[13px]">Confirm New Password</span>}>
              <Input.Password className="h-11 rounded-lg bg-transparent border-slate-300 dark:border-slate-700 dark:text-slate-200" />
            </Form.Item>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button 
            className="h-11 px-6 rounded-lg bg-transparent border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-200 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 font-medium shadow-none"
            onClick={() => form.resetFields()}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            className="h-11 px-8 rounded-lg bg-[#8C4BFF] hover:bg-[#7b3fe6] border-none text-white transition-colors shadow-md shadow-purple-500/20 font-bold"
          >
            Save Changes
          </Button>
        </div>
      </Form>

      <style jsx global>{`
        .admin-profile-form .ant-select-selector {
          background-color: transparent !important;
          border-color: #cbd5e1 !important;
          border-radius: 0.5rem !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          color: inherit !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-select-selector {
          border-color: #334155 !important;
        }
        .admin-profile-form .ant-select-arrow {
          color: #94a3b8 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-select-selection-item {
          color: #e2e8f0 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-picker-input > input {
          color: #e2e8f0 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-input-password {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: #334155 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-input-password:hover,
        :root[class~="dark"] .admin-profile-form .ant-input-password:focus-within {
          border-color: #475569 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-input-password input {
          background-color: transparent !important;
          color: #e2e8f0 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-input-password .anticon {
          color: #94a3b8 !important;
        }
        
        /* Ensure normal inputs also look right if Tailwind classes get overridden */
        :root[class~="dark"] .admin-profile-form .ant-input {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
        :root[class~="dark"] .admin-profile-form .ant-input:hover,
        :root[class~="dark"] .admin-profile-form .ant-input:focus {
          border-color: #475569 !important;
        }
      `}</style>
    </div>
  )
}
