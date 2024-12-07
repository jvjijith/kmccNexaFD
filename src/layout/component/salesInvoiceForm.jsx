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
    invoiceNumber: '',
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
          invoiceTemplate: cleanedInvoiceData?.invoiceTemplate || '',
          invoiceNumber: cleanedInvoiceData?.invoiceNumber || '',
          invoiceStatus: cleanedInvoiceData?.invoiceStatus || 'Draft',
          quoteId: cleanedInvoiceData?.quoteId || '',
          salesman: cleanedInvoiceData?.salesman || '',
          customer: cleanedInvoiceData?.customer || '',
          invoiceNotes: cleanedInvoiceData?.invoiceNotes || '',
          products: cleanedInvoiceData?.products || [],
          totalAmount: cleanedInvoiceData?.totalAmount || 0,
          totalDiscount: cleanedInvoiceData?.totalDiscount || 0,
          finalAmount: cleanedInvoiceData?.finalAmount || 0,
          dueDate: cleanedInvoiceData?.dueDate ? formatDate(cleanedInvoiceData.dueDate) : '',
          paymentTerms: cleanedInvoiceData?.paymentTerms || '',
          paymentHistory: cleanedInvoiceData?.paymentHistory || [],
          paymentStatus: cleanedInvoiceData?.paymentStatus || '',
          termsAndConditions: cleanedInvoiceData?.termsAndConditions || [],
          createdBy: cleanedInvoiceData?.createdBy || '',
          editedBy: cleanedInvoiceData?.editedBy || '',
          editedNotes: cleanedInvoiceData?.editedNotes || []
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
  const finalAmount = updatedItems.reduce(
    (sum, item) => (parseFloat(sum + item.totalPrice || 0)).toFixed(2)
  );
  
    // Update formValues state
    setFormValues((prevValues) => ({
      ...prevValues,
      items: updatedItems,
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
      navigate('/invoiceDatas');
    } catch (error) {
      toast.error('Failed to save Purchase Order');
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("formValues",formValues);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Invoice Status </label>
            <Select
              options={poStatusOptions}
              value={poStatusOptions.find(option => option.value === formValues.invoiceStatus)}
              onChange={handleStatusChange}
              placeholder="Select Invoice Status"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
          </div>

          {/* Invoice Template */}
  <div className="w-full sm:w-1/2 p-4">
    <label className="block w-full mb-2 text-white">Invoice Template</label>
    <input
      type="text"
      name="invoiceTemplate"
      value={formValues.invoiceTemplate}
      onChange={(e) => handleInputChange('invoiceTemplate', e.target.value)}
      className="block w-full px-3 py-2 text-white bg-black border rounded"
    />
  </div>

          {/* Organization Dropdown */}
          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Organization</label>
            <Select
              options={organizationOptions}
              value={organizationOptions?.find(option => option.value === formValues.organization)}
              onChange={handleOrganizationChange}
              placeholder="Select Organization"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
          </div> */}

          {/* Quote Status Dropdown */}
          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-white">Quote</label>
  <Select
    name="quoteId"
    options={quoteStatusOptions}
    value={quoteStatusOptions.find((option) => option.value === formValues.quoteId)}
    onChange={(selectedOption) => setFormValues((prev) => ({ ...prev, quoteId: selectedOption.value }))}
    placeholder="Select Quote"
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        borderColor: state.isFocused ? 'white' : '#D3D3D3',
        borderBottomWidth: '2px',
        borderRadius: '0px',
        height: '40px',
        paddingLeft: '8px',
        paddingRight: '8px',
        color: 'white',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'white',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'black',
        color: 'white',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#007bff' : 'black',
        color: state.isSelected ? 'black' : 'white',
        cursor: 'pointer',
      }),
    }}
  />
</div>


          {/* <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-white" >Quote Type</label>
            <Select
              options={[
                { value: 'Quote Request', label: 'Quote Request' },
                { value: 'Quote', label: 'Quote' },
              ]}
              value={{ value: formValues.quoteType, label: formValues.quoteType }}
              onChange={(option) => handleInputChange('quoteType', option.value)}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
              required
            />
          </div> */}


          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-white">salesman</label>
          <Select
            name="purchaser"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.value === formValues.salesman)}
            onChange={handlePurchaser}
            placeholder="Select Salesman"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3',
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px',
                paddingLeft: '8px',
                paddingRight: '8px',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'black',
                color: 'white',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#007bff' : 'black',
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer',
              }),
            }}
          />
        </div>

 {/* Vendor Dropdown */}
 {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Vendor</label>
            <Select
              options={vendorOptions}
              value={vendorOptions.find(option => option.value === formValues.vendor)}
              onChange={handleVendorChange}
              placeholder="Select Vendor"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
          </div> */}

<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-white">Customer</label>
      <Select
        name="customer"
        options={customerOptions}
        value={customerOptions.find((option) => option.value === formValues.customer)}
        onChange={handlePurchaser}
        placeholder="Select Customer"
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: 'black',
            borderColor: state.isFocused ? 'white' : '#D3D3D3',
            borderBottomWidth: '2px',
            borderRadius: '0px',
            height: '40px',
            paddingLeft: '8px',
            paddingRight: '8px',
            color: 'white',
          }),
          singleValue: (provided) => ({
            ...provided,
            color: 'white',
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: 'black',
            color: 'white',
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#007bff' : 'black',
            color: state.isSelected ? 'black' : 'white',
            cursor: 'pointer',
          }),
        }}
      />
    </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Invoice Notes</label>
            <textarea
              name="invoiceNotes"
              value={formValues.invoiceNotes}
              onChange={(e) => handleInputChange('invoiceNotes', e.target.value)}
              className="block w-full px-3 py-2 text-white bg-black border rounded"
            />
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Shipping Address</label>
            <textarea
              name="Shipping Address"
              value={formValues.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-white bg-black border rounded"
            />
          </div> */}

          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Billing Address</label>
            <textarea
              name="Billing Address"
              value={formValues.billingAddress}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-white bg-black border rounded"
            />
          </div> */}

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Payment Terms</label>
            <textarea
              name="Payment Terms"
              value={formValues.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              className="block w-full px-3 py-2 text-white bg-black border rounded"
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Due-Date</label>
            <input
              type="date"
              id="dueDate"
              value={formValues.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="block w-full px-3 py-2 text-white bg-black border rounded"
              required
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-white">Payment Status</label>
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
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
              required
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-white">Created By</label>
  <Select
    name="createdBy"
    options={employeeOptions}
    value={employeeOptions.find((option) => option.value === formValues.createdBy)}
    onChange={(selectedOption) => handleInputChange('createdBy', selectedOption.value)}
    placeholder="Select Employee"
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        borderColor: state.isFocused ? 'white' : '#D3D3D3',
        borderBottomWidth: '2px',
        borderRadius: '0px',
        height: '40px',
        paddingLeft: '8px',
        paddingRight: '8px',
        color: 'white',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'white',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'black',
        color: 'white',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#007bff' : 'black',
        color: state.isSelected ? 'black' : 'white',
        cursor: 'pointer',
      }),
    }}
  />
</div>

<div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-white">Edited By</label>
  <Select
    name="editedBy"
    options={employeeOptions}
    value={employeeOptions.find((option) => option.value === formValues.editedBy)}
    onChange={(selectedOption) => handleInputChange('editedBy', selectedOption.value)}
    placeholder="Select Employee"
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        borderColor: state.isFocused ? 'white' : '#D3D3D3',
        borderBottomWidth: '2px',
        borderRadius: '0px',
        height: '40px',
        paddingLeft: '8px',
        paddingRight: '8px',
        color: 'white',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'white',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'black',
        color: 'white',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#007bff' : 'black',
        color: state.isSelected ? 'black' : 'white',
        cursor: 'pointer',
      }),
    }}
  />
</div>


          {/* Edited Notes Section */}
<div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-white">Edited Notes</label>
    <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addEditedNote}>
      Add
    </button>
  </div>
  <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
    {formValues?.editedNotes?.length === 0 && <p>No Edited Notes added</p>}
    {formValues?.editedNotes?.map((note, index) => (
      <div key={index} className="flex flex-col mb-4">
        <div className="flex items-center mb-2">
          <textarea
            name={`editedNote-${index}`}
            className="block w-full px-3 h-10 py-2 text-white bg-black border rounded"
            placeholder={`Edited Note ${index + 1}`}
            value={note}
            onChange={(e) => handleEditedNoteChange(index, e.target.value)}
          />
          <button
            type="button"
            className="bg-black w-1/6 text-white px-4 py-2 rounded ml-2"
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
            <label className="block w-full mb-2 text-white">Payment History</label>
            <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addPayment}>
              Add
            </button>
          </div>
          <div className="p-4 bg-sidebar-card-top rounded-lg">
            {formValues.paymentHistory.length === 0 && <p>No Payment History added</p>}
            {formValues.paymentHistory.map((payment, index) => (
              <div key={index} className="flex flex-col mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="date"
                    name={`paymentDate-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Date"
                    value={payment.paymentDate}
                    onChange={(e) => handlePaymentChange(index, 'paymentDate', e.target.value)}
                  />
                  <input
                    type="number"
                    name={`paymentAmount-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Amount"
                    value={payment.paymentAmount}
                    onChange={(e) => handlePaymentChange(index, 'paymentAmount', e.target.value)}
                  />
                  <select
                    name={`paymentMethod-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 bg-black text-white border-b border-nexa-gray focus:outline-none"
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
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Reference"
                    value={payment.paymentReference}
                    onChange={(e) => handlePaymentChange(index, 'paymentReference', e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-black text-white px-4 py-2 rounded ml-2"
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
    <label className="block w-full mb-2 text-white">Terms and Conditions</label>
    <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addTerm}>
      Add
    </button>
  </div>
  <div className="terms-container p-4 bg-sidebar-card-top rounded-lg">
    {formValues.termsAndConditions.length === 0 && <p>No Terms and Conditions added</p>}
    {formValues.termsAndConditions.map((term, index) => (
      <div key={index} className="flex flex-col mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            name={`termName-${index}`}
            className="block w-2/6 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
            placeholder={`Term Name ${index + 1}`}
            value={term.name}
            onChange={(e) => handleTermChange(index, 'name', e.target.value)}
          />
        {/* </div>
        <div className="flex items-center mb-2"> */}
          <textarea
            name={`termContent-${index}`}
            className="block w-3/6 px-3 h-10 py-2 text-white bg-black border rounded  ml-2"
            placeholder={`Content for Term ${index + 1}`}
            value={term.content}
            onChange={(e) => handleTermChange(index, 'content', e.target.value)}
          />
        <button
          type="button"
          className="bg-black w-1/6 text-white px-4 py-2 rounded ml-2"
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
        <label className="block text-white">Products</label>
        <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addProduct}>
          Add
        </button>
      </div>
      <div className="products-container p-4 bg-sidebar-card-top rounded-lg">
        {formValues.products.length === 0 && <p>No Products added</p>}

        {formValues.products.map((product, index) => (
          <div key={index} className="flex mb-2">
            {/* Product Dropdown */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Product</label>
              <Select
                options={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                value={productData?.products?.find((p) => p._id === product.productId)}
                onChange={(selectedOption) => handleProductChange(index, 'productId', selectedOption.value)}
                className="w-full"
                styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'black',
                      borderColor: state.isFocused ? 'white' : '#D3D3D3',
                      borderBottomWidth: '2px',
                      borderRadius: '0px',
                      height: '40px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      color: 'white',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'white',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'black',
                      color: 'white',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#007bff' : 'black',
                      color: state.isSelected ? 'black' : 'white',
                      cursor: 'pointer',
                    }),
                  }}
              />
            </div>

            {/* Variant Dropdown */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Variant</label>
              <Select
                options={varientData?.variants
                  ?.filter((v) => v.productId === product.productId)
                  ?.map((v) => ({ value: v._id, label: v.name }))}
                value={varientData?.variants?.find((v) => v._id === product.variantId)}
                onChange={(selectedOption) => handleProductChange(index, 'variantId', selectedOption.value)}
                isDisabled={!product.productId}
                className="w-full"
                styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'black',
                      borderColor: state.isFocused ? 'white' : '#D3D3D3',
                      borderBottomWidth: '2px',
                      borderRadius: '0px',
                      height: '40px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      color: 'white',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'white',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'black',
                      color: 'white',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#007bff' : 'black',
                      color: state.isSelected ? 'black' : 'white',
                      cursor: 'pointer',
                    }),
                  }}
              />
            </div>

            {/* Quantity Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Quantity</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
              />
            </div>

            {/* Unit Price Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Unit Price</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
              />
            </div>

            {/* Discount Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Discount</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition"
                value={product.discount}
                onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
              />
            </div>

            {/* Total Price Display */}
            <div className="w-1/6 ml-2">
              <label className="block text-white">Total Price</label>
              <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition" value={product.totalPrice} readOnly />
            </div>

            {/* Remove Button */}
            <button type="button" className="bg-black h-10 text-white px-4 py-2 rounded ml-2 mt-6" onClick={() => removeProduct(index)}>
              Remove
            </button>
          </div>
        ))}

        {/* Summary Fields */}
       {formValues.products.length !== 0 &&
        <> 
       <div className="mt-4">
          <label className="block text-white">Total Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition" value={formValues.totalAmount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-white">Total Discount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition" value={formValues.totalDiscount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-white">Final Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black text-white rounded-none focus:outline-none focus:border-white transition" value={formValues.finalAmount} readOnly />
        </div>
        </>}
      </div>
    </div>


        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalesInvoiceForm;
