import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

function QuoteForm({ quotes }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quoteTemplateOptions, setQuoteTemplateOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [editedByOptions, setEditedByOptions] = useState([]);
  const [enquiryOptions, setEnquiryOptions] = useState([]);


  const mutationHook = quotes ? usePutData : usePostData;
  const api_url = quotes ? `/quotes/${quotes._id}` : '/quotes';
  const api_key = quotes ? 'updateQuote' : 'addQuote';
  const { mutate: saveQuote, isLoading } = mutationHook(api_key, api_url);
  const { data: organizationData, organizationLoading, organizationError, organizationRefetch } = useGetData(
    "OrganizationsData",
    `/organizations`,
    {}
  );
  const { data: salseManData, salseManDataLoading, salseManDataError, salseManDataRefetch } = useGetData(
    "salseManData",
    `/employee`,
    {}
  );
  const { data: customerData, customerLoading, customerError, customerRefetch } = useGetData(
    "customerData",
    `/customer`,
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
  const { data: enquiryData, enquiryLoading, enquiryError, enquiryRefetch } = useGetData(
    "enquiryData",
    `/enquiry`,
    {}
  );


  const [formData, setFormData] = useState({
    quoteTemplate: '',
    quoteStatus: 'Draft',
    enquiryId: '',
    salesman: '',
    customer: '',
    quoteNotes: '',
    products:  [
      { productId: '', variantId: '', quantity: 0, unitPrice: 0, discount: 0, totalPrice: 0 },
    ],
    totalAmount:  0,
    totalDiscount:  0,
    finalAmount:  0,
    validUntil: '2024-11-02',
    termsAndConditions: [{ name: '', content: '' }],
    createdBy: '',
    editedBy: '',
    editedNotes: [''],
  });

  const quoteStatusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Ready To Sent', label: 'Ready To Sent' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
  ];

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
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    
  // Transform products from enquiries
  const transformProducts = (products) =>
    products?.map((item) => ({
      productId: item.productId?._id || null,
      variantId: item.VariantId?._id || null,
      quantity: item.quantity || 0,
    })) || [];

  // Update products when enquiryId changes
  if (formData.enquiryId) {
    const selectedEnquiry = enquiryData?.enquiries?.find(
      (enquiry) => enquiry._id === formData.enquiryId
    );

    if (selectedEnquiry?.products?.length > 0) {
      const transformedProducts = transformProducts(selectedEnquiry.products);
      console.log("transformedProducts",transformedProducts);
      setFormData((prevData) => ({
        ...prevData,
        products: transformedProducts,
      }));
    }
  }

    if (quotes) {
      // Remove unwanted fields
      const cleanedContainer = removeUnwantedFields(quotes);

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      // Transform items to only include itemType and itemId
      // const transformedItems = elementsDatas.items?.map(item => ({
      //     itemType: item.itemType,
      //     itemId: item.itemId?._id,
      // }));

      // Transform availability to only include appId as a string
      // const transformedAppId = elementsDatas.availability?.map(avail => ({
      //     appId: avail.appId?._id,
      // }));

      // const appId = layoutDatas?.appId?._id;

      // Set the transformed data
      
      setFormData({
        quoteTemplate: quotes?.quoteTemplate,
        quoteStatus: quotes?.quoteStatus,
        enquiryId: quotes?.enquiryId?._id,
        salesman: quotes?.salesman._id,
        customer: quotes?.customer._id,
        quoteNotes: quotes?.quoteNotes,
        products: cleanedContainer?.products,
        totalAmount: quotes?.totalAmount,
        totalDiscount: quotes?.totalDiscount,
        finalAmount: quotes?.finalAmount,
        validUntil: formatDate(quotes?.validUntil),
        termsAndConditions: cleanedContainer?.termsAndConditions,
        createdBy: quotes?.createdBy._id,
        editedBy: quotes?.editedBy._id,
        editedNotes: quotes?.editedNotes,
      });
  }
  
  if (organizationData?.organizations) {
    const options = organizationData.organizations.flatMap((org) =>
      org.quoteTemplates.map((template) => ({
        value: template._id,
        label: template.name,
      }))
    );
    setQuoteTemplateOptions(options);
  }

  if (customerData?.customers) {
    const options = customerData.customers.map((customer) => ({
      value: customer._id,
      label: customer.name,
    }));
    setCustomerOptions(options);
  }

  if (enquiryData?.enquiries) {
    const options = enquiryData.enquiries.map((enquiry) => ({
      value: enquiry._id,
      label: `${enquiry.enquiryNumber} - ${enquiry.customer.name} (${enquiry.customer.email})`,
    }));
    setEnquiryOptions(options);
  }

  if (salseManData?.employees) {
    const options = salseManData.employees.map((employee) => ({
      value: employee._id,
      label: employee.name,
    }));
    setEmployeeOptions(options);
    setEditedByOptions(options);
  }
  }, [organizationData, customerData, salseManData, enquiryData, quotes, formData.enquiryId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditedByChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      editedBy: selectedOption.value,
    }));
  };

  const handleEnquiryChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      enquiryId: selectedOption.value,
    }));
  };

  const handleCustomerChange = (selectedOption) => {
    // Update formData with the selected customer ID
    setFormData((prevData) => ({
      ...prevData,
      customer: selectedOption.value, // Assuming selectedOption contains { value: id, label: name }
    }));
  
    // Optionally log the selected customer
    console.log('Selected Customer:', selectedOption);
  };
  

  const handleCreatedByChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption.value,
    }));
  };

  const salesmanOptions = salseManData?.employees.map((employee) => ({
    value: employee._id,
    label: employee.name,
  }));
  

  const handleSalesmanChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      salesman: selectedOption.value,
    }));
  };

  const handleTemplateChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      quoteTemplate: selectedOption.value,
    }));
  };

  const handleStatusChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      quoteStatus: selectedOption.value,
    }));
  };

  // Function to handle changes in terms and conditions (name or content)
const handleTermChange = (index, field, value) => {
  const updatedTerms = [...formData.termsAndConditions];
  updatedTerms[index][field] = value;
  setFormData((prevData) => ({
    ...prevData,
    termsAndConditions: updatedTerms,
  }));
};

// Function to add a new term
const addTerm = () => {
  setFormData((prevData) => ({
    ...prevData,
    termsAndConditions: [...prevData.termsAndConditions, { name: '', content: '' }],
  }));
};

// Function to remove a term
const removeTerm = (index) => {
  const updatedTerms = formData.termsAndConditions.filter((_, i) => i !== index);
  setFormData((prevData) => ({
    ...prevData,
    termsAndConditions: updatedTerms,
  }));
};

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
  
    // Extract product details for calculations
    const { quantity, unitPrice, discount } = updatedProducts[index];
    const quantityValue = parseFloat(quantity || 0);
    const unitPriceValue = parseFloat(unitPrice || 0);
    const discountPercentage = parseFloat(discount || 0);
  
    // Calculate totalPrice for the specific product
    const totalBeforeDiscount = quantityValue * unitPriceValue;
    const discountAmount = totalBeforeDiscount * (discountPercentage / 100);
    updatedProducts[index].totalPrice = totalBeforeDiscount - discountAmount;
  
    // Calculate totals
    const totalAmount = updatedProducts.reduce(
      (sum, product) => sum + (parseFloat(product.unitPrice || 0) * parseFloat(product.quantity || 0)),
      0
    );
    const totalDiscount = updatedProducts.reduce(
      (sum, product) =>
        sum +
        (parseFloat(product.unitPrice || 0) * parseFloat(product.quantity || 0) * (parseFloat(product.discount || 0) / 100)),
      0
    );
    const finalAmount = totalAmount - totalDiscount;
  
    // Update formData state
    setFormData((prevData) => ({
      ...prevData,
      products: updatedProducts,
      totalAmount,
      totalDiscount,
      finalAmount,
    }));
  };
  

  const addProduct = () => {
    setFormData((prevData) => ({
      ...prevData,
      products: [
        ...prevData.products,
        { productId: '', variantId: '', quantity: 0, unitPrice: 0, discount: 0, totalPrice: 0 },
      ],
    }));
  };

  const removeProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      products: updatedProducts,
    }));
  };

  const handleEditedNoteChange = (index, value) => {
    const updatedNotes = [...formData.editedNotes];
    updatedNotes[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      editedNotes: updatedNotes,
    }));
  };

  const addEditedNote = () => {
    setFormData((prevData) => ({
      ...prevData,
      editedNotes: [...prevData.editedNotes, ''],
    }));
  };

  const removeEditedNote = (index) => {
    const updatedNotes = formData.editedNotes.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      editedNotes: updatedNotes,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveQuote(formData, {
      onSuccess: (response) => {
        toast.success('Quotes saved successfully!');
        navigate('/quote');
      },
      onError: (error) => {
        toast.error('Failed to save Quotes.');
        console.error(error);
      }
    });
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("productData",productData);
  console.log("varientData",varientData);
  console.log("formData",formData);
  console.log("quotes",quotes);
  console.log("enquiryData",enquiryData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Quote Number</label>
            <input
              type="text"
              name="quoteNumber"
              value={formData.quoteNumber}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div> */}

          {/* Quote Template Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Quote Template</label>
          <Select
            options={quoteTemplateOptions}
            value={quoteTemplateOptions.find((option) => option.value === formData.quoteTemplate)}
            onChange={handleTemplateChange}
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


          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Quote Status</label>
            <Select
              options={quoteStatusOptions}
              value={quoteStatusOptions.find(option => option.value === formData.quoteStatus)}
              onChange={handleStatusChange}
              placeholder="Select Quote Status"
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

          {/* Enquiry Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Enquiry ID</label>
          <Select
            options={enquiryOptions}
            value={enquiryOptions.find((option) => option.value === formData.enquiryId)}
            onChange={handleEnquiryChange}
            placeholder="Select Enquiry ID"
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
          <label className="block w-full mb-2 text-text-color">Salesman</label>
          <Select
            options={salesmanOptions}
            value={salesmanOptions.find(option => option.value === formData.salesman)}
            onChange={handleSalesmanChange}
            placeholder="Select Salesman"
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
          <label className="block w-full mb-2 text-text-color">Customer</label>
          <Select
            options={customerOptions}
            value={customerOptions.find(option => option.value === formData.customer)}
            onChange={handleCustomerChange}
            placeholder="Select a Customer"
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
            <label className="block w-full mb-2 text-text-color">Valid Until</label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Terms and Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div> */}

          <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Quote Notes</label>
            <textarea
              name="quoteNotes"
              value={formData.quoteNotes}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Created By</label>
          <Select
            name="createdBy"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.value === formData.createdBy)}
            onChange={handleCreatedByChange}
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

        {/* Edited By Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Edited By</label>
          <Select
            options={editedByOptions}
            value={editedByOptions.find((option) => option.value === formData.editedBy)}
            onChange={handleEditedByChange}
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

        {/* <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Edited Count</label>
          <input
            type="number"
            name="editedCount"
            value={formData.editedCount}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div> */}


        {/* Terms and Conditions Section */}
        <div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color">Terms and Conditions</label>
    <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addTerm}>
      Add
    </button>
  </div>
  <div className="terms-container p-4 bg-secondary-card rounded-lg">
    {formData.termsAndConditions.length === 0 && <p className='text-text-color'>No Terms and Conditions added</p>}
    {formData.termsAndConditions.map((term, index) => (
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


        {/* Edited Notes Section */}
        <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color">Edited Notes</label>
            <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addEditedNote}>
              Add
            </button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {formData.editedNotes.length === 0 && <p className='text-text-color'>No Notes added</p>}
            {formData.editedNotes.map((note, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  name={`editedNote-${index}`}
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                  placeholder={`Note ${index + 1}`}
                  value={note}
                  onChange={(e) => handleEditedNoteChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
                  onClick={() => removeEditedNote(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

           {/* Products */}
        <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block mb-2 text-text-color">Products</label>
            <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addProduct}>
              Add
            </button>
          </div>
          <div className="products-container p-4 bg-secondary-card rounded-lg">
            {formData?.products?.length === 0 && <p className='text-text-color'>No Products added</p>}
            {formData?.products?.map((product, index) => (
               <div key={index} className="flex mb-2">
               {/* Product Dropdown */}
               
        <div className="w-1/6 ml-2">
             <label className="block text-text-color w-full">Product</label>
               <Select
                 options={productData?.products?.map((p) => ({
                   value: p._id,
                   label: p.name || "Unnamed Product",
                 }))}
                 value={productData?.products?.map((p) => ({
                  value: p._id,
                  label: p.name || "Unnamed Product",
                })).find((option) => option.value === product.productId)}
                 onChange={(selectedOption) =>
                   handleProductChange(index, "productId", selectedOption.value)
                 }
                //  placeholder="Select Product"
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
               <label className="block text-text-color w-full">Variant</label>
               <Select
                 options={varientData?.variants
                   ?.filter((v) => v.productId === product.productId)
                   .map((v) => ({ value: v._id, label: v.name }))}
                 value={varientData?.variants
                   ?.filter((v) => v.productId === product.productId)
                   .map((v) => ({ value: v._id, label: v.name }))
                   .find((option) => option.value === product.variantId)}
                 onChange={(selectedOption) =>
                   handleProductChange(index, "variantId", selectedOption.value)
                 }
                //  placeholder="Select Variant"
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
                 isDisabled={!product.productId}
               />
       </div>
       
       <div className="w-1/6 ml-2">
               <label className="block text-text-color w-full">Quantity</label>
               <input
                 type="number"
                 className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                 placeholder="Quantity"
                 value={product.quantity}
                 onChange={(e) =>
                   handleProductChange(index, "quantity", parseFloat(e.target.value))
                 }
               />
               </div>
       <div className="w-1/6 ml-2">
               <label className="block text-text-color w-full">Unit Price</label>
               <input
                 type="number"
                 className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                 placeholder="Unit Price"
                 value={product.unitPrice}
                 onChange={(e) =>
                   handleProductChange(index, "unitPrice", parseFloat(e.target.value))
                 }
               /> 
               </div>
               <div className="w-1/6 ml-2">
                       <label className="block text-text-color w-full">Discount</label>
               <input
                 type="number"
                 className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                 placeholder="Discount"
                 value={product.discount}
                 onChange={(e) =>
                   handleProductChange(index, "discount", parseFloat(e.target.value))
                 }
               /> 
               </div>
               <div className="w-1/6 ml-2">
                       <label className="block text-text-color w-full">Total Price</label>
               <input
                 type="number"
                 className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                 placeholder="Total Price"
                 value={product.totalPrice}
                 readOnly
               /> </div>
               <button
                 type="button"
                 className="bg-secondary-card h-10 text-text-color px-4 py-2 rounded ml-2 mt-6"
                 onClick={() => removeProduct(index)}
               >
                 Remove
               </button>
             </div>
           ))}
       
           {/* Total Amount, Discount, and Final Amount */}
           { !(formData?.products?.length === 0) &&
            <>
            <div className="mt-4">
             <label className="block text-text-color">Total Amount</label>
             <input
               type="number"
               className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
               value={formData.totalAmount}
               readOnly
             />
           </div>
           <div className="mt-4">
             <label className="block text-text-color">Total Discount</label>
             <input
               type="number"
               className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
               value={formData.totalDiscount}
               readOnly
             />
           </div>
           <div className="mt-4">
             <label className="block text-text-color">Final Amount</label>
             <input
               type="number"
               className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
               value={formData.finalAmount}
               readOnly
             />
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

export default QuoteForm;
