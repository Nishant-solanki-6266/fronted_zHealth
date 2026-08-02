import React, { useState } from 'react'
import { Table, Button, Input, Modal, Form, Select, Dropdown } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { useClinicStore } from '../../../../store/clinicStore'

const { Option } = Select

const initialProducts = [
  { id: 'PROD-001', name: 'Hand Theraputty', category: 'Core - Consumables', vendor: '', stock: 9, price: 15.00, archived: false },
]

export default function ClinicAdminProducts() {
  const { darkMode } = useClinicStore()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form] = Form.useForm()

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchArchived = showArchived ? true : !p.archived
    return matchSearch && matchArchived
  })

  const openAdd = () => {
    setEditProduct(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditProduct(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSave = (values) => {
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...values } : p))
      toast.success('Product updated!')
    } else {
      const newProduct = {
        id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
        ...values,
        stock: parseInt(values.stock) || 0,
        price: parseFloat(values.price) || 0,
        archived: false,
      }
      setProducts(prev => [newProduct, ...prev])
      toast.success('Product added!')
    }
    setModalOpen(false)
    form.resetFields()
  }

  const handleArchive = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, archived: !p.archived } : p))
    toast.success('Product status updated!')
  }

  const columns = [
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Name</span>,
      dataIndex: 'name', 
      key: 'name',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Category</span>,
      dataIndex: 'category', 
      key: 'category',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Vendor</span>,
      dataIndex: 'vendor', 
      key: 'vendor',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Stock</span>,
      dataIndex: 'stock', 
      key: 'stock',
      render: val => <span className="font-medium text-slate-700 dark:text-slate-300 text-[13px]">{val}</span>,
    },
    {
      title: <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Actions</span>,
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit', onClick: () => openEdit(record) },
              { key: 'archive', label: record.archived ? 'Restore' : 'Archive', onClick: () => handleArchive(record.id) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-end pr-2">
            <EllipsisOutlined style={{ fontSize: 20 }} />
          </div>
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 p-8">
      {modalOpen ? (
        <div className="max-w-4xl">
          <div className="flex justify-between items-center mb-6 pb-2">
            <h1 className="text-[28px] font-bold text-[#344E41] dark:text-[#A3B18A] m-0">
              {editProduct ? 'Edit product' : 'New product'}
            </h1>
            <div className="flex gap-2">
              <Button onClick={() => { setModalOpen(false); form.resetFields() }} className="rounded-md font-medium text-[13px] h-9 px-6 border-[#d9d9d9] text-[#202020]">Cancel</Button>
              <Button type="primary" onClick={() => form.submit()} style={{ backgroundColor: '#8C4BFF', borderColor: '#8C4BFF' }} className="rounded-md font-bold text-white h-9 px-6">Save</Button>
            </div>
          </div>
          
          <Form form={form} layout="vertical" onFinish={handleSave} className="max-w-2xl">
            <Form.Item name="name" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></span>} rules={[{ required: true, message: '' }]}>
              <Input className="rounded-md h-10 border-[#d9d9d9]" placeholder="e.g. Hand Theraputty" />
            </Form.Item>
            
            <Form.Item name="category" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Category</span>}>
              <Input className="rounded-md h-10 border-[#d9d9d9]" placeholder="e.g. Core - Consumables" />
            </Form.Item>
            
            <Form.Item name="description" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Description</span>}>
              <Input.TextArea className="rounded-md border-[#d9d9d9]" rows={4} placeholder="" />
            </Form.Item>
            
            <Form.Item name="itemCode" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Item code</span>}>
              <Input className="rounded-md h-10 border-[#d9d9d9]" placeholder="e.g. 03_040000911_0103_1_1" />
            </Form.Item>
            
            <Form.Item name="vendor" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Vendor</span>}>
              <Input className="rounded-md h-10 border-[#d9d9d9]" />
            </Form.Item>
            
            <Form.Item name="tax" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Tax <span className="text-red-500">*</span></span>} rules={[{ required: true, message: '' }]} initialValue="GST Free Income">
              <Select className="rounded-md h-10">
                <Option value="GST Free Income">GST Free Income</Option>
                <Option value="GST on Income">GST on Income</Option>
              </Select>
            </Form.Item>

            <Form.Item name="xeroAccount" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Xero account</span>} initialValue="200 - Sales">
              <Select className="rounded-md h-10">
                <Option value="200 - Sales">200 - Sales</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            
            {/* Adding these so the app functionality doesn't break but placing them at the bottom */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Form.Item name="price" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Price <span className="text-red-500">*</span></span>} rules={[{ required: true, message: '' }]}>
                <Input type="number" className="rounded-md h-10 border-[#d9d9d9]" placeholder="0.00" />
              </Form.Item>
              <Form.Item name="stock" label={<span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Stock Quantity <span className="text-red-500">*</span></span>} rules={[{ required: true, message: '' }]}>
                <Input type="number" className="rounded-md h-10 border-[#d9d9d9]" placeholder="0" />
              </Form.Item>
            </div>
          </Form>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[28px] font-bold text-[#344E41] dark:text-[#A3B18A] m-0">Products</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowArchived(!showArchived)}
                className="rounded-md font-medium text-[13px] h-9 px-4 border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF] transition-colors bg-white dark:bg-slate-800"
              >
                {showArchived ? 'Hide archived products' : 'Display archived products'}
              </Button>
              <Button
                onClick={openAdd}
                className="rounded-md font-medium text-[13px] h-9 px-4 border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF] transition-colors bg-white dark:bg-slate-800"
              >
                + New product
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search for product by name"
              value={search} onChange={e => setSearch(e.target.value)}
              className="rounded-md h-[40px] flex-1 border-[#d9d9d9] dark:border-slate-700 dark:bg-slate-800 text-[13px]"
            />
            <Button
              className="rounded-md h-[40px] px-6 font-medium text-[13px] border-[#d9d9d9] text-[#202020] dark:text-slate-200 dark:border-slate-700 hover:border-[#8C4BFF] hover:text-[#8C4BFF] bg-white dark:bg-slate-800"
            >
              Search
            </Button>
          </div>

          {/* Table */}
          <div className="border border-[#e8e8e8] dark:border-slate-700 rounded-lg overflow-hidden">
            <Table
              dataSource={filtered} 
              columns={columns} 
              rowKey="id"
              expandable={{
                expandedRowRender: record => (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Product Price</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">${(record.price || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Current Stock</span>
                        <span className={`font-bold ${record.stock < 5 ? 'text-amber-500' : 'text-emerald-500'}`}>{record.stock} units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Vendor / Supplier</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{record.vendor || 'Direct Stock'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Product ID</span>
                        <span className="font-bold text-[#8C4BFF] font-mono">{record.id}</span>
                      </div>
                    </div>
                  </div>
                ),
                expandIcon: ({ expanded, onExpand, record }) => (
                  <div 
                    className="text-slate-400 cursor-pointer text-center w-6" 
                    onClick={e => onExpand(record, e)}
                  >
                    {expanded ? '-' : '+'}
                  </div>
                )
              }}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                position: ['bottomRight']
              }}
              className="products-table custom-pagination-table"
            />
          </div>

          <style jsx global>{`
            .products-table .ant-table-thead > tr > th {
              background-color: #F1F3F5 !important;
              border-bottom: 1px solid #e8e8e8 !important;
            }
            .dark .products-table .ant-table-thead > tr > th {
              background-color: #1e293b !important;
              border-bottom: 1px solid #334155 !important;
            }
            .products-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f0f0f0 !important;
              padding: 12px 16px !important;
            }
            .dark .products-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #334155 !important;
            }
            .products-table .ant-table-row:last-child > td {
              border-bottom: none !important;
            }
            
            /* Custom Pagination styles matching image */
            .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination {
              padding: 16px !important;
              margin: 0 !important;
              display: flex !important;
              align-items: center !important;
              background-color: white !important;
            }
            .dark .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination {
              background-color: #0f172a !important;
            }
            .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-total-text {
              margin-right: auto !important;
              font-size: 13px;
              color: #666 !important;
            }
            .dark .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-total-text {
              color: #94a3b8 !important;
            }
            .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item {
              border: none !important;
              background: transparent !important;
              font-weight: 500;
              width: auto !important;
              min-width: 32px !important;
              border-radius: 4px !important;
            }
            .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active {
              border: 1px solid #8C4BFF !important;
              border-radius: 4px !important;
              background-color: white !important;
            }
            .dark .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active {
              background-color: #1e293b !important;
            }
            .products-table.ant-table-wrapper .ant-table-pagination.ant-pagination .ant-pagination-item-active a {
              color: #8C4BFF !important;
            }
            .products-table.ant-table-wrapper .ant-select-selector {
              border-radius: 4px !important;
            }
          `}</style>
        </>
      )}
    </div>
  )
}


