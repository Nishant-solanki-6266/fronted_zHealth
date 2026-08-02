import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, ForgotPasswordPage, RegisterPage } from './features/auth'
import DashboardLayout from './layouts/DashboardLayout'
import { DashboardPage, SuperAdminDashboardPage, SalesExecutiveDashboardPage, ClinicAdminDashboardPage, PractitionerDashboardPage, PatientPortalDashboardPage } from './features/dashboard'
import { CalendarPage, SuperAdminCalendarPage, SalesExecutiveCalendarPage, ClinicAdminCalendarPage, PractitionerCalendarPage, PatientPortalCalendarPage } from './features/calendar'
import { PatientsPage, ClientProfilePage, WaitlistPage, ContactsPage, ContactProfilePage } from './features/patients'
import { InvoicesPage } from './features/invoices'
import { ReportsPage, DocumentsPage } from './features/reports'
import { SettingsPage, SuperAdminSettingsPage, SalesExecutiveSettingsPage, ClinicAdminSettingsPage, PractitionerSettingsPage, PatientPortalSettingsPage, AdminPage, BranchPage, DoctorsManagePage, SubscriptionPage, AiNotePage, TenantPage, PaymentTermsPage, TemplateManagePage, AdminProfilePage } from './features/settings'
import { PaymentsPage } from './features/payments'
import { ProductsPage } from './features/products'
import { useClinicStore } from './store/clinicStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const darkMode = useClinicStore((state) => state.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#020617'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#F8FAFC'
    }
  }, [darkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: darkMode ? '#8C4BFF' : '#0E1B33', // Primary purple in dark mode, Navy in light
            colorSuccess: '#30D2BE', // Brand Teal
            colorInfo: '#8C4BFF', // Brand Purple
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Clinic Dashboard Panel Routes */}
            <Route 
              path="/clinic" 
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/clinic/:section" 
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              } 
            />
            {/* Role-Specific Dashboard Routes */}
            <Route path="/head-admin/dashboard" element={<DashboardLayout><SuperAdminDashboardPage /></DashboardLayout>} />
            <Route path="/sales/dashboard" element={<DashboardLayout><SalesExecutiveDashboardPage /></DashboardLayout>} />
            <Route path="/clinic-admin/dashboard" element={<DashboardLayout><ClinicAdminDashboardPage /></DashboardLayout>} />
            <Route path="/practitioner/dashboard" element={<DashboardLayout><PractitionerDashboardPage /></DashboardLayout>} />
            <Route path="/patient/dashboard" element={<DashboardLayout><PatientPortalDashboardPage /></DashboardLayout>} />

            <Route 
              path="/clinic/calendar" 
              element={
                <DashboardLayout>
                  <CalendarPage />
                </DashboardLayout>
              } 
            />
            {/* Role-Specific Calendar Routes */}
            <Route 
              path="/head-admin/calendar" 
              element={<DashboardLayout><SuperAdminCalendarPage /></DashboardLayout>} 
            />
            <Route 
              path="/sales/calendar" 
              element={<DashboardLayout><SalesExecutiveCalendarPage /></DashboardLayout>} 
            />
            <Route 
              path="/clinic-admin/calendar" 
              element={<DashboardLayout><ClinicAdminCalendarPage /></DashboardLayout>} 
            />
            <Route 
              path="/practitioner/calendar" 
              element={<DashboardLayout><PractitionerCalendarPage /></DashboardLayout>} 
            />

            {/* Custom Clinic Admin Menu Overrides */}
            <Route path="/clinic-admin/patients" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="patients" /></DashboardLayout>} />
            <Route path="/clinic-admin/contacts" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="contacts" /></DashboardLayout>} />
            <Route path="/clinic-admin/waitlist" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="waitlist" /></DashboardLayout>} />
            <Route path="/clinic-admin/invoices" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="invoices" /></DashboardLayout>} />
            <Route path="/clinic-admin/payments-centre" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="payments-centre" /></DashboardLayout>} />
            <Route path="/clinic-admin/products" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="products" /></DashboardLayout>} />
            <Route path="/clinic-admin/reports" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="reports" /></DashboardLayout>} />
            <Route path="/clinic-admin/documents" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="documents" /></DashboardLayout>} />
            <Route path="/clinic-admin/details" element={<DashboardLayout><ClinicAdminDashboardPage sectionOverride="details" /></DashboardLayout>} />

            {['head-admin', 'sales', 'clinic-admin', 'practitioner', 'patient'].map(role => (
              <Route key={role} path={`/${role}`}>
<Route 
              path="patients" 
              element={
                <DashboardLayout>
                  <PatientsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="patients/:id" 
              element={
                <DashboardLayout>
                  <ClientProfilePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="contacts" 
              element={
                <DashboardLayout>
                  <ContactsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="contacts/:id" 
              element={
                <DashboardLayout>
                  <ContactProfilePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="waitlist" 
              element={
                <DashboardLayout>
                  <WaitlistPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="invoices" 
              element={
                <DashboardLayout>
                  <InvoicesPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="reports" 
              element={
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="documents" 
              element={
                <DashboardLayout>
                  <DocumentsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="settings" 
              element={
                <DashboardLayout>
                  {role === 'head-admin' && <SuperAdminSettingsPage />}
                  {role === 'sales' && <SalesExecutiveSettingsPage />}
                  {role === 'clinic-admin' && <ClinicAdminSettingsPage />}
                  {role === 'practitioner' && <PractitionerSettingsPage />}
                  {role === 'patient' && <PatientPortalSettingsPage />}
                </DashboardLayout>
              } 
            />

            <Route 
              path="details" 
              element={
                <DashboardLayout>
                  <ClientProfilePage />
                </DashboardLayout>
              } 
            />

            <Route 
              path="profile" 
              element={
                <DashboardLayout>
                  <AdminProfilePage />
                </DashboardLayout>
              } 
            />

            <Route 
              path="profile/:id" 
              element={
                <DashboardLayout>
                  <AdminProfilePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="branch" 
              element={
                <DashboardLayout>
                  <BranchPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="admin" 
              element={
                <DashboardLayout>
                  <AdminPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="practitioners" 
              element={
                <DashboardLayout>
                  <DoctorsManagePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="subscription" 
              element={
                <DashboardLayout>
                  <SubscriptionPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="ai-notes" 
              element={
                <DashboardLayout>
                  <AiNotePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="tenants" 
              element={
                <DashboardLayout>
                  <TenantPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="payment-terms" 
              element={
                <DashboardLayout>
                  <PaymentTermsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="templates" 
              element={
                <DashboardLayout>
                  <TemplateManagePage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="payments-centre" 
              element={
                <DashboardLayout>
                  <PaymentsPage />
                </DashboardLayout>
              } 
            />
            <Route 
              path="products" 
              element={
                <DashboardLayout>
                  <ProductsPage />
                </DashboardLayout>
              } 
            />
            
            
              </Route>
            ))}
            <Route path="/head-admin/:section" element={<DashboardLayout><SuperAdminDashboardPage /></DashboardLayout>} />
            <Route path="/sales/:section" element={<DashboardLayout><SalesExecutiveDashboardPage /></DashboardLayout>} />
            <Route path="/clinic-admin/:section" element={<DashboardLayout><ClinicAdminDashboardPage /></DashboardLayout>} />
            <Route path="/practitioner/:section" element={<DashboardLayout><PractitionerDashboardPage /></DashboardLayout>} />
            <Route path="/patient/:section" element={<DashboardLayout><PatientPortalDashboardPage /></DashboardLayout>} />
            
            {/* Catch-all redirects to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" toastOptions={{ duration: 1500 }} />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
