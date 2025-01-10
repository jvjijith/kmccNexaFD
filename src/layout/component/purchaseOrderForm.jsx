import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

function PurchaseOrderForm({ purchaseOrder }) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    poTemplate: '',
    poStatus: "Draft",
    quoteId: '',
    quoteType: '',
    purchaser: '',
    vendor: '',
    poNotes: '',
    items: [],
    totalAmount: 0,
    totalDiscount: 0,
    finalAmount: 0,
    expectedDeliveryDate: '',
    shippingAddress: '',
    billingAddress: '',
    paymentTerms: '',
    termsAndConditions: [],
    paymentHistory: [],
    paymentStatus: '',
    createdBy: '',
    editedBy:'',
    editedNotes:[]
  });
  const poStatusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Received', label: 'Received' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const [loading, setLoading] = useState(true);
  const [quoteStatusOptions, setQuoteStatusOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [editedByOptions, setEditedByOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);


  const mutationHook = purchaseOrder ? usePutData : usePostData;
  const api_url = purchaseOrder ? `/purchaseOrders/${purchaseOrder._id}` : '/purchaseOrders';
  const api_key = purchaseOrder ? 'updatePurchaseOrder' : 'addPurchaseOrder';
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
    // Helper function to transform products
    const transformProducts = (products) =>
      products?.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        totalPrice: item.totalPrice || 0,
      })) || [];
  
    // If purchaseOrder is present, populate the form with its values
    if (purchaseOrder) {
      const cleanedContainer = removeUnwantedFields(purchaseOrder);
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };
  
      setFormValues({
        poTemplate: purchaseOrder.poTemplate,
        poStatus: purchaseOrder.poStatus,
        quoteId: purchaseOrder.quoteId,
        quoteType: purchaseOrder.quoteType,
        purchaser: purchaseOrder.purchaser?._id,
        vendor: purchaseOrder.vendor?._id,
        poNotes: purchaseOrder.poNotes,
        items: cleanedContainer?.items || [],
        totalAmount: purchaseOrder.totalAmount,
        totalDiscount: purchaseOrder.totalDiscount,
        finalAmount: purchaseOrder.finalAmount,
        expectedDeliveryDate: formatDate(purchaseOrder.expectedDeliveryDate),
        shippingAddress: purchaseOrder.shippingAddress,
        billingAddress: purchaseOrder.billingAddress,
        paymentTerms: purchaseOrder.paymentTerms,
        termsAndConditions: cleanedContainer?.termsAndConditions || [],
        paymentHistory:
          cleanedContainer?.paymentHistory?.map((payment) => ({
            ...payment,
            paymentDate: formatDate(payment.paymentDate),
          })) || [],
        paymentStatus: purchaseOrder.paymentStatus,
        createdBy: purchaseOrder.createdBy?._id,
        editedBy: purchaseOrder.editedBy?._id,
        editedNotes: purchaseOrder.editedNotes,
      });
    } else if (formValues.quoteId) {
      // If no purchaseOrder, process the selected quoteId
      const selectedQuote = quoteData?.quotes?.find(
        (quote) => quote._id === formValues.quoteId
      );
  
      if (selectedQuote?.products?.length > 0) {
        const transformedProducts = transformProducts(selectedQuote.products);
      
        // Perform calculations for totalAmount, totalDiscount, and finalAmount
        const totalAmount = transformedProducts.reduce(
          (sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0)),
          0
        );
        const totalDiscount = transformedProducts.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0) * (parseFloat(item.discount || 0) / 100)),
          0
        );
        const finalAmount = totalAmount - totalDiscount;
      
        // Update form values
        setFormValues((prevData) => ({
          ...prevData,
          items: transformedProducts,
          totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure 2 decimal places
          totalDiscount: parseFloat(totalDiscount.toFixed(2)), // Ensure 2 decimal places
          finalAmount: parseFloat(finalAmount.toFixed(2)), // Ensure 2 decimal places
        }));
      }
      
    }
  
    // Process Salesman and Vendor options
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
        .filter((customer) => customer.vendor)
        .map((vendor) => ({
          value: vendor._id,
          label: vendor.name,
        }));
      setVendorOptions(options);
    }
  
    // Process Quote Status options
    if (quoteData?.quotes) {
      const options = quoteData.quotes.map((quote) => ({
        value: quote._id,
        label: `Quote #${quote.quoteNumber} - ${quote.quoteStatus}`,
      }));
      setQuoteStatusOptions(options);
    }
  }, [
    quoteData,
    salseManData,
    vendorData,
    formValues.quoteId,
    purchaseOrder,
  ]);
  

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
  handleInputChange('poTemplate', selectedOption.value);
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
    const updatedItems = [...formValues.items];
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
      items: updatedItems,
      totalAmount: totalAmount,
      totalDiscount: totalDiscount,
      finalAmount: parseFloat(finalAmount), // Ensure 2 decimal places
    }));
  };
  

  const addProduct = () => {
    setFormValues({
      ...formValues,
      items: [...formValues.items, { productId: '', variantId: '', quantity: 0, unitPrice: 0, discount: 0, totalPrice: 0 }],
    });
  };

  const removeProduct = (index) => {
    const updatedItems = formValues.items.filter((_, i) => i !== index);
    setFormValues({ ...formValues, items: updatedItems });
  };

  const handleStatusChange = (selectedOption) => {
    handleInputChange('poStatus', selectedOption.value);
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
      navigate('/purchaseorder');
    } catch (error) {
      toast.error('Failed to save Purchase Order');
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("formValues",formValues);
  console.log("purchaseOrder",purchaseOrder);
  console.log("quoteData",quoteData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">PO Status</label>
            <Select
              options={poStatusOptions}
              value={poStatusOptions.find(option => option.value === formValues.poStatus)}
              onChange={handleStatusChange}
              placeholder="Select PO Status"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : 'black',
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
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer',
                }),
              }}
            />
          </div>

          {/* PO Template */}
          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color">Template</label>
  <Select
    options={quoteTemplateOptions}
    value={quoteTemplateOptions?.find(option => option.value === formValues.poTemplate)}
    onChange={handleQuoteTemplateChange}
    placeholder="Select Quote Template"
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        borderColor: state.isFocused ? 'white' : 'black',
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
        backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
        color: state.isSelected ? '#f8f9fa' : 'black',
        cursor: 'pointer',
      }),
    }}
  />
</div>


          {/* Organization Dropdown */}
          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Organization</label>
            <Select
              options={organizationOptions}
              value={organizationOptions?.find(option => option.value === formValues.organization)}
              onChange={handleOrganizationChange}
              placeholder="Select Organization"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : 'black',
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
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer',
                }),
              }}
            />
          </div> */}

          {/* Quote Status Dropdown */}
          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color">Quote</label>
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
        borderColor: state.isFocused ? 'white' : 'black',
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
        backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
        color: state.isSelected ? '#f8f9fa' : 'black',
        cursor: 'pointer',
      }),
    }}
  />
</div>


          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color" >Quote Type</label>
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
                  borderColor: state.isFocused ? 'white' : 'black',
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
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer',
                }),
              }}
              required
            />
          </div>


          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Purchaser</label>
          <Select
            name="purchaser"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.value === formValues.purchaser)}
            onChange={handlePurchaser}
            placeholder="Select Purchaser"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : 'black',
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
                backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              }),
            }}
          />
        </div>

 {/* Vendor Dropdown */}
 <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Vendor</label>
            <Select
              options={vendorOptions}
              value={vendorOptions.find(option => option.value === formValues.vendor)}
              onChange={handleVendorChange}
              placeholder="Select Vendor"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : 'black',
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
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer',
                }),
              }}
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">PO Notes</label>
            <textarea
              name="PO Notes"
              value={formValues.poNotes}
              onChange={(e) => handleInputChange('poNotes', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Shipping Address</label>
            <textarea
              name="Shipping Address"
              value={formValues.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Billing Address</label>
            <textarea
              name="Billing Address"
              value={formValues.billingAddress}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Payment Terms</label>
            <textarea
              name="Payment Terms"
              value={formValues.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Expected Delivery Date</label>
            <input
              type="date"
              id="expectedDeliveryDate"
              value={formValues.expectedDeliveryDate}
              onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              required
            />
          </div>

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Payment Status</label>
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
                  borderColor: state.isFocused ? 'white' : 'black',
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
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer',
                }),
              }}
              required
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color">Created By</label>
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
        borderColor: state.isFocused ? 'white' : 'black',
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
        backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
        color: state.isSelected ? '#f8f9fa' : 'black',
        cursor: 'pointer',
      }),
    }}
  />
</div>

<div className="w-full sm:w-1/2 p-4">
  <label className="block w-full mb-2 text-text-color">Edited By</label>
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
        borderColor: state.isFocused ? 'white' : 'black',
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
        backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
        color: state.isSelected ? '#f8f9fa' : 'black',
        cursor: 'pointer',
      }),
    }}
  />
</div>


          {/* Edited Notes Section */}
<div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color">Edited Notes</label>
    <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addEditedNote}>
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
            <label className="block w-full mb-2 text-text-color">Payment History</label>
            <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addPayment}>
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
                    className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Date"
                    value={payment.paymentDate}
                    onChange={(e) => handlePaymentChange(index, 'paymentDate', e.target.value)}
                  />
                  <input
                    type="number"
                    name={`paymentAmount-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                    placeholder="Payment Amount"
                    value={payment.paymentAmount}
                    onChange={(e) => handlePaymentChange(index, 'paymentAmount', e.target.value)}
                  />
                  <select
                    name={`paymentMethod-${index}`}
                    className="block w-1/4 h-10 px-2 py-1 ml-2 secondary-card text-text-color border-b border-nexa-gray focus:outline-none"
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
                    className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
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
    <label className="block w-full mb-2 text-text-color">Terms and Conditions</label>
    <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addTerm}>
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
            className="block w-2/6 h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
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
        <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addProduct}>
          Add
        </button>
      </div>
      <div className="products-container p-4 bg-secondary-card rounded-lg">
        {formValues.items.length === 0 && <p className='text-text-color'>No Products added</p>}

        {formValues.items.map((product, index) => (
          <div key={index} className="flex mb-2">
            {/* Product Dropdown */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Product</label>
              <Select
                options={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                value={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' })).find((option) => option.value === product.productId)}
                onChange={(selectedOption) => handleProductChange(index, 'productId', selectedOption.value)}
                className="w-full"
                styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'black',
                      borderColor: state.isFocused ? 'white' : 'black',
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
                      backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                      color: state.isSelected ? '#f8f9fa' : 'black',
                      cursor: 'pointer',
                    }),
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
                  ?.map((v) => ({ value: v._id, label: v.name })).find((option) => option.value === product.variantId)}
                onChange={(selectedOption) => handleProductChange(index, 'variantId', selectedOption.value)}
                isDisabled={!product.productId}
                className="w-full"
                styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'black',
                      borderColor: state.isFocused ? 'white' : 'black',
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
                      backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                      color: state.isSelected ? '#f8f9fa' : 'black',
                      cursor: 'pointer',
                    }),
                  }}
              />
            </div>

            {/* Quantity Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Quantity</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
              />
            </div>

            {/* Unit Price Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Unit Price</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
              />
            </div>

            {/* Discount Input */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Discount</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.discount}
                onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
              />
            </div>

            {/* Total Price Display */}
            <div className="w-1/6 ml-2">
              <label className="block text-text-color">Total Price</label>
              <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={product.totalPrice} readOnly />
            </div>

            {/* Remove Button */}
            <button type="button" className="bg-secondary-button-color h-10 text-text-color px-4 py-2 rounded ml-2 mt-6" onClick={() => removeProduct(index)}>
              Remove
            </button>
          </div>
        ))}

        {/* Summary Fields */}
       {formValues.items.length !== 0 &&
        <> 
       <div className="mt-4">
          <label className="block text-text-color">Total Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.totalAmount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-text-color">Total Discount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.totalDiscount} readOnly />
        </div>
        <div className="mt-4">
          <label className="block text-text-color">Final Amount</label>
          <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={formValues.finalAmount} readOnly />
        </div>
        </>}
      </div>
      
    </div>


        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-text-color px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PurchaseOrderForm;
