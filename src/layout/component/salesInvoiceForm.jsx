import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

function SalesInvoiceForm({ invoiceData }) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    invoiceTemplate: '',
    invoiceStatus: 'Draft',
    quoteId: '',
    salesman: '',
    customer: '',
    invoiceNotes: '',
    products: [],
    totalAmount: 0,
    totalDiscount: 0,
    finalAmount: 0,
    dueDate: '',
    paymentTerms: '',
    paymentHistory: [],
    paymentStatus: '',
    termsAndConditions: [],
    createdBy: '',
    editedBy: '',
    editedNotes: []
  });
  
  const poStatusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Partially Paid', label: 'Partially Paid' },
    { value: 'Fully Paid', label: 'Fully Paid' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const [loading, setLoading] = useState(true);
  const [quoteStatusOptions, setQuoteStatusOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [editedByOptions, setEditedByOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);


  const mutationHook = invoiceData ? usePutData : usePostData;
  const api_url = invoiceData ? `/salesInvoices/${invoiceData._id}` : '/salesInvoices';
  const api_key = invoiceData ? 'updateSalesInvoices' : 'addSalesInvoices';
  const { mutate: savePurchaseOrder, isLoading } = mutationHook(api_key, api_url);
  const { data: organizationData, organizationLoading, organizationError, organizationRefetch } = useGetData(
    "OrganizationsData",
    `/organizations`,
    {}
  );
  const { data: quoteData, quoteLoading, quoteError, quoteRefetch } = useGetData(
    "QuoteData",
    `/quotes`,
    {}
  );
  const { data: salseManData, salseManDataLoading, salseManDataError, salseManDataRefetch } = useGetData(
    "salseManData",
    `/employee`,
    {}
  );
  const { data: vendorData, vendorDataLoading, vendorDataError, vendorDataRefetch } = useGetData(
    "vendorData",
    `/vendor`,
    {}
  );
  const { data: productData, productLoading, productError, productRefetch } = useGetData(
    "productData",
    `/product`,
    {}
  );
  const { data: varientData, varientLoading, varientError, varientRefetch } = useGetData(
    "varientData",
    `/variant/`,
    {}
  );   
  const { data: customerData, customerLoading, customerError, customerRefetch } = useGetData(
    "customerData",
    `/customer`,
    {}
  );

  const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v' ]) => {
    if (Array.isArray(data)) {
      return data.map((item) => removeUnwantedFields(item, fields));
    } else if (typeof data === 'object' && data !== null) {
      return Object.keys(data).reduce((acc, key) => {
        if (!fields.includes(key)) {
          acc[key] = removeUnwantedFields(data[key], fields);
        }
        return acc;
      }, {});
    }
    return data;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (invoiceData) {
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
      
        // Clean and transform invoice data as needed
        const cleanedInvoiceData = removeUnwantedFields(invoiceData);
      
        setFormValues({
          invoiceTemplate: invoiceData?.invoiceTemplate || '',
          invoiceStatus: invoiceData?.invoiceStatus || 'Draft',
          quoteId: invoiceData?.quoteId?._id || '',
          salesman: invoiceData?.salesman?._id || '',
          customer: invoiceData?.customer?._id || '',
          invoiceNotes: invoiceData?.invoiceNotes || '',
          products: cleanedInvoiceData?.products || [],
          totalAmount: invoiceData?.totalAmount || 0,
          totalDiscount: invoiceData?.totalDiscount || 0,
          finalAmount: invoiceData?.finalAmount || 0,
          dueDate: invoiceData?.dueDate ? formatDate(invoiceData.dueDate) : '',
          paymentTerms: invoiceData?.paymentTerms || '',
          paymentHistory: cleanedInvoiceData?.paymentHistory.map((payment) => ({
            ...payment,
            paymentDate: formatDate(payment.paymentDate), // Format paymentDate
          })) || [],
          paymentStatus: invoiceData?.paymentStatus || '',
          termsAndConditions: cleanedInvoiceData?.termsAndConditions || [],
          createdBy: invoiceData?.createdBy?._id || '',
          editedBy: invoiceData?.editedBy?._id || '',
          editedNotes: invoiceData?.editedNotes || []
        });
      }
      

    if (salseManData?.employees) {
        const options = salseManData.employees.map((employee) => ({
          value: employee._id,
          label: employee.name,
        }));
        setEmployeeOptions(options);
        setEditedByOptions(options);
      }

    if (vendorData?.customers) {
      const options = vendorData.customers
        .filter(customer => customer.vendor) // Ensure only vendors are included
        .map(vendor => ({
          value: vendor._id,
          label: vendor.name,
        }));
      setVendorOptions(options);
    }

    if (customerData?.customers) {
        const options = customerData.customers.map((customer) => ({
          value: customer._id,
          label: customer.name,
        }));
        setCustomerOptions(options);
      }

      if (quoteData?.quotes) {
        const options = quoteData.quotes.map((quote) => ({
          value: quote._id,
          label: `Quote #${quote.quoteNumber} - ${quote.quoteStatus}`,
        }));
        setQuoteStatusOptions(options);
      }

  }, [quoteData, salseManData, vendorData, customerData]);

  // Calculate Derived Fields
//   useEffect(() => {
//     const totalAmount = formValues.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
//     const totalDiscount = formValues.items.reduce((sum, item) => sum + item.discount, 0);
//     const finalAmount = totalAmount - totalDiscount;

//     setFormValues((prev) => ({ ...prev, totalAmount, totalDiscount, finalAmount }));
//   }, [formValues.items]);

const quoteTemplateOptions = organizationData?.organizations?.[0]?.quoteTemplates.map(template => ({
  value: template._id,
  label: template.name,
}));

const handleQuoteTemplateChange = (selectedOption) => {
  handleInputChange('invoiceTemplate', selectedOption.value);
};

const handleEditedNoteChange = (index, value) => {
    setFormValues((prev) => {
      const updatedNotes = [...prev.editedNotes];
      updatedNotes[index] = value;
      return { ...prev, editedNotes: updatedNotes };
    });
  };
  
  const addEditedNote = () => {
    setFormValues((prev) => ({
      ...prev,
      editedNotes: [...prev.editedNotes, ''],
    }));
  };
  
  const removeEditedNote = (index) => {
    setFormValues((prev) => {
      const updatedNotes = prev.editedNotes.filter((_, i) => i !== index);
      return { ...prev, editedNotes: updatedNotes };
    });
  };
  

const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...formValues.paymentHistory];
    updatedPayments[index][field] = value;
    setFormValues((prev) => ({ ...prev, paymentHistory: updatedPayments }));
  };

  const addPayment = () => {
    setFormValues((prev) => ({
      ...prev,
      paymentHistory: [
        ...prev.paymentHistory,
        { paymentDate: '', paymentAmount: 0, paymentMethod: '', paymentReference: '' },
      ],
    }));
  };

  const removePayment = (index) => {
    const updatedPayments = formValues.paymentHistory.filter((_, i) => i !== index);
    setFormValues((prev) => ({ ...prev, paymentHistory: updatedPayments }));
  };


  // Function to handle changes in terms and conditions (name or content)
const handleTermChange = (index, field, value) => {
    const updatedTerms = [...formValues.termsAndConditions];
    updatedTerms[index][field] = value;
    setFormValues((prevData) => ({
      ...prevData,
      termsAndConditions: updatedTerms,
    }));
  };
  
  // Function to add a new term
  const addTerm = () => {
    setFormValues((prevData) => ({
      ...prevData,
      termsAndConditions: [...prevData.termsAndConditions, { name: '', content: '' }],
    }));
  };
  
  // Function to remove a term
  const removeTerm = (index) => {
    const updatedTerms = formValues.termsAndConditions.filter((_, i) => i !== index);
    setFormValues((prevData) => ({
      ...prevData,
      termsAndConditions: updatedTerms,
    }));
  };

   // Helper Functions
   const handleProductChange = (index, field, value) => {
    const updatedItems = [...formValues.products];
    updatedItems[index][field] = value;
  
    // Reset dependent fields
    if (field === 'productId') {
      updatedItems[index].variantId = null; // Reset variant
    }
  
    // Extract product details for calculations
    const { quantity, unitPrice, discount } = updatedItems[index];
    const quantityValue = parseFloat(quantity || 0);
    const unitPriceValue = parseFloat(unitPrice || 0);
    const discountPercentage = parseFloat(discount || 0);
  
    // Calculate totalPrice for the specific item
    const totalBeforeDiscount = quantityValue * unitPriceValue;
    const discountAmount = totalBeforeDiscount * (discountPercentage / 100);
    updatedItems[index].totalPrice = parseFloat((totalBeforeDiscount - discountAmount).toFixed(2)); // Ensure 2 decimal places
  
 // Calculate totals
 const totalAmount = updatedItems.reduce(
    (sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0)),
    0
  );
  const totalDiscount = updatedItems.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0) * (parseFloat(item.discount || 0) / 100)),
    0
  );
  const finalAmount = totalAmount - totalDiscount;
  
    // Update formValues state
    setFormValues((prevValues) => ({
      ...prevValues,
      products: updatedItems,
      totalAmount: totalAmount,
      totalDiscount: totalDiscount,
      finalAmount: parseFloat(finalAmount), // Ensure 2 decimal places
    }));
  };
  

  const addProduct = () => {
    setFormValues({
      ...formValues,
      products: [...formValues.products, { productId: '', variantId: '', quantity: 0, unitPrice: 0, discount: 0, totalPrice: 0 }],
    });
  };

  const removeProduct = (index) => {
    const updatedItems = formValues.products.filter((_, i) => i !== index);
    setFormValues({ ...formValues, products: updatedItems });
  };

  const handleStatusChange = (selectedOption) => {
    handleInputChange('invoiceStatus', selectedOption.value);
  };

  const handleVendorChange = (selectedOption) => {
    setFormValues(prev => ({ ...prev, vendor: selectedOption.value }));
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationChange = (selectedOption) => {
    handleInputChange('organization', selectedOption.value);
  };

  const handlePurchaser = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormValues((prevData) => ({
      ...prevData,
      [name]: selectedOption.value,
    }));
  };

  const organizationOptions = organizationData?.organizations?.map(org => ({
    value: org._id,
    label: org.name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await savePurchaseOrder(formValues);
      toast.success('Purchase Order saved successfully');
      navigate('/salesInvoice');
    } catch (error) {
      toast.error('Failed to save Purchase Order');
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("formValues",formValues);
  console.log("varient",varientData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Invoice Status </label>
            <Select
              options={poStatusOptions}
              value={poStatusOptions.find(option => option.value === formValues.invoiceStatus)}
              onChange={handleStatusChange}
              placeholder="Select Invoice Status"
              classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
            />
          </div>

          {/* Invoice Template */}
          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Template</label>
  <Select
    options={quoteTemplateOptions}
    value={quoteTemplateOptions?.find(option => option.value === formValues.invoiceTemplate)}
    onChange={handleQuoteTemplateChange}
    placeholder="Select Quote Template"
    classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
  />
</div>


          {/* Organization Dropdown */}
          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Organization</label>
            <Select
              options={organizationOptions}
              value={organizationOptions?.find(option => option.value === formValues.organization)}
              onChange={handleOrganizationChange}
              placeholder="Select Organization"
              classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
            />
          </div> */}

          {/* Quote Status Dropdown */}
          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Quote</label>
  <Select
    name="quoteId"
    options={quoteStatusOptions}
    value={quoteStatusOptions.find((option) => option.value === formValues.quoteId)}
    onChange={(selectedOption) => setFormValues((prev) => ({ ...prev, quoteId: selectedOption.value }))}
    placeholder="Select Quote"
    classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
  />
</div>


          {/* <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color" >Quote Type</label>
            <Select
              options={[
                { value: 'Quote Request', label: 'Quote Request' },
                { value: 'Quote', label: 'Quote' },
              ]}
              value={{ value: formValues.quoteType, label: formValues.quoteType }}
              onChange={(option) => handleInputChange('quoteType', option.value)}
              classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
              required
            />
          </div> */}


          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">salesman</label>
          <Select
            name="salesman"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.value === formValues.salesman)}
            onChange={handlePurchaser}
            placeholder="Select Salesman"
            classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
          />
        </div>

 {/* Vendor Dropdown */}
 {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Vendor</label>
            <Select
              options={vendorOptions}
              value={vendorOptions.find(option => option.value === formValues.vendor)}
              onChange={handleVendorChange}
              placeholder="Select Vendor"
              classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
            />
          </div> */}

<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Customer</label>
      <Select
        name="customer"
        options={customerOptions}
        value={customerOptions.find((option) => option.value === formValues.customer)}
        onChange={handlePurchaser}
        placeholder="Select Customer"
        classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
      />
    </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Invoice Notes</label>
            <textarea
              name="invoiceNotes"
              value={formValues.invoiceNotes}
              onChange={(e) => handleInputChange('invoiceNotes', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Shipping Address</label>
            <textarea
              name="Shipping Address"
              value={formValues.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div> */}

          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Billing Address</label>
            <textarea
              name="Billing Address"
              value={formValues.billingAddress}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div> */}

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Payment Terms</label>
            <textarea
              name="Payment Terms"
              value={formValues.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Due-Date</label>
            <input
              type="date"
              id="dueDate"
              value={formValues.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              required
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Payment Status</label>
            <Select
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'partially_paid', label: 'Partially Paid' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'emi_paid', label: 'EMI Paid' },
                { value: 'emi_unpaid', label: 'EMI Unpaid' },
              ]}
              value={{ value: formValues.paymentStatus, label: formValues.paymentStatus }}
              onChange={(option) => handleInputChange('paymentStatus', option.value)}
              classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
              required
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Created By</label>
  <Select
    name="createdBy"
    options={employeeOptions}
    value={employeeOptions.find((option) => option.value === formValues.createdBy)}
    onChange={(selectedOption) => handleInputChange('createdBy', selectedOption.value)}
    placeholder="Select Employee"
    classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
  />
</div>

<div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Edited By</label>
  <Select
    name="editedBy"
    options={employeeOptions}
    value={employeeOptions.find((option) => option.value === formValues.editedBy)}
    onChange={(selectedOption) => handleInputChange('editedBy', selectedOption.value)}
    placeholder="Select Employee"
    classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
  />
</div>


          {/* Edited Notes Section */}
<div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Edited Notes</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addEditedNote}>
      Add
    </button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {formValues?.editedNotes?.length === 0 && <p className='text-text-color'>No Edited Notes added</p>}
    {formValues?.editedNotes?.map((note, index) => (
      <div key={index} className="flex flex-col mb-4">
        <div className="flex items-center mb-2">
          <textarea
            name={`editedNote-${index}`}
            className="block w-full px-3 h-10 py-2 text-text-color secondary-card border rounded"
            placeholder={`Edited Note ${index + 1}`}
            value={note}
            onChange={(e) => handleEditedNoteChange(index, e.target.value)}
          />
          <button
            type="button"
            className="bg-secondary-card w-1/6 text-text-color px-4 py-2 rounded ml-2"
            onClick={() => removeEditedNote(index)}
          >
            Remove
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


           {/* Payment History Section */}
        <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Payment History</label>
            <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addPayment}>
              Add
            </button>
          </div>
          <div className="p-4 bg-secondary-card rounded-lg">
            {formValues.paymentHistory.length === 0 && <p className='text-text-color'>No Payment History added</p>}
            {formValues.paymentHistory.map((payment, index) => (
              <div key={index} className="flex flex-col mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="date"
                    name={`paymentDate-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Date"
                    value={payment.paymentDate}
                    onChange={(e) => handlePaymentChange(index, 'paymentDate', e.target.value)}
                  />
                  <input
                    type="number"
                    name={`paymentAmount-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Amount"
                    value={payment.paymentAmount}
                    onChange={(e) => handlePaymentChange(index, 'paymentAmount', e.target.value)}
                  />
                  <select
                    name={`paymentMethod-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 secondary-card text-text-color border-b border-border focus:outline-none"
                    value={payment.paymentMethod}
                    onChange={(e) => handlePaymentChange(index, 'paymentMethod', e.target.value)}
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                  <input
                    type="text"
                    name={`paymentReference-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Reference"
                    value={payment.paymentReference}
                    onChange={(e) => handlePaymentChange(index, 'paymentReference', e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
                    onClick={() => removePayment(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>


          {/* Terms and Conditions Section */}
        <div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Terms and Conditions</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addTerm}>
      Add
    </button>
  </div>
  <div className="terms-container p-4 bg-secondary-card rounded-lg">
    {formValues.termsAndConditions.length === 0 && <p className='text-text-color'>No Terms and Conditions added</p>}
    {formValues.termsAndConditions.map((term, index) => (
      <div key={index} className="flex flex-col mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            name={`termName-${index}`}
            className="block w-2/6 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
            placeholder={`Term Name ${index + 1}`}
            value={term.name}
            onChange={(e) => handleTermChange(index, 'name', e.target.value)}
          />
        {/* </div>
        <div className="flex items-center mb-2"> */}
          <textarea
            name={`termContent-${index}`}
            className="block w-3/6 px-3 h-10 py-2 text-text-color secondary-card border rounded  ml-2"
            placeholder={`Content for Term ${index + 1}`}
            value={term.content}
            onChange={(e) => handleTermChange(index, 'content', e.target.value)}
          />
        <button
          type="button"
          className="bg-secondary-card w-1/6 text-text-color px-4 py-2 rounded ml-2"
          onClick={() => removeTerm(index)}
        >
          Remove
        </button>
        
        </div>
      </div>
    ))}
  </div>
</div>

          <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-text-color">Products</label>
        <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addProduct}>
          Add
        </button>
      </div>
      <div className="products-container p-4 bg-secondary-card rounded-lg">
        {formValues.products.length === 0 && <p className='text-text-color'>No Products added</p>}

        {formValues.products.map((product, index) => (
          <div key={index} className="flex mb-2">
            {/* Product Dropdown */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Product</label>
              <Select
                options={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                value={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                onChange={(selectedOption) => handleProductChange(index, 'productId', selectedOption.value)}
                classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
              />
            </div>

            {/* Variant Dropdown */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Variant</label>
              <Select
                options={varientData?.variants
                  ?.filter((v) => v.productId === product.productId)
                  ?.map((v) => ({ value: v._id, label: v.name }))}
                value={varientData?.variants
                  ?.filter((v) => v.productId === product.productId)
                  ?.map((v) => ({ value: v._id, label: v.name }))}
                onChange={(selectedOption) => handleProductChange(index, 'variantId', selectedOption.value)}
                isDisabled={!product.productId}
                classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
              />
            </div>

            {/* Quantity Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Quantity</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
              />
            </div>

            {/* Unit Price Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Unit Price</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
              />
            </div>

            {/* Discount Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Discount</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.discount}
                onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
              />
            </div>

            {/* Total Price Display */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Total Price</label>
              <input type="number" className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={product.totalPrice} readOnly />
            </div>

            {/* Remove Button */}
            <button type="button" className="bg-secondary-button-color h-10 text-text-color px-4 py-2 rounded ml-2 mt-6" onClick={() => removeProduct(index)}>
              Remove
            </button>
          </div>
        ))}

        {/* Summary Fields */}
       {formValues.products.length !== 0 &&
        <> 
       <div className="mt-4">
          <label className="block text-text-color">Total Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.totalAmount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-text-color">Total Discount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.totalDiscount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-text-color">Final Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-border secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.finalAmount} readOnly />
        </div>
        </>}
      </div>
    </div>


        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalesInvoiceForm;
