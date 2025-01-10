import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function VendorQuoteRequestForm({ vendorRequest }) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    vendorQuoteRequestStatus: 'Draft', // Default value
    vendor: '',
    requestedBy: '',
    requestNotes: '',
    products: [], // Array of objects with product details
    requiredDeliveryDate: '',
    termsAndConditions: [], // Array of objects with terms details
    attachments: [], // Array of objects with attachment details
    createdBy: '',
    editedBy: '',
    editedNotes: []
});

  const poStatusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const [loading, setLoading] = useState(true);
  const [quoteStatusOptions, setQuoteStatusOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [editedByOptions, setEditedByOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]); 
  const [uploadProgress, setUploadProgress] = useState({});
  const [files, setFiles] = useState([]);
  const [mediaId, setMediaId] = useState([]);


  const mutationHook = vendorRequest ? usePutData : usePostData;
  const api_url = vendorRequest ? `/quoteRequests/${vendorRequest._id}` : '/quoteRequests';
  const api_key = vendorRequest ? 'updateQuoteRequests' : 'addQuoteRequests';
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

  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

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
    if (vendorRequest) {
        // Helper function to format date
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };
    
        // Transform products to include only necessary fields
        const transformedProducts = vendorRequest?.products?.map(item => ({
            productName: item?.productName,
            description: item?.description,
            quantity: item?.quantity,
        }));
    
        // Transform terms and conditions
        const transformedTerms = vendorRequest?.termsAndConditions?.map(term => ({
            name: term?.name,
            content: term?.content,
        }));
    
        // Transform attachments
        const transformedAttachments = vendorRequest?.attachments?.map(attachment => ({
            fileName: attachment?.fileName,
            fileUrl: attachment?.fileUrl,
        }));
    
        // Set the transformed data
        setFormValues({
            vendorQuoteRequestStatus: vendorRequest?.vendorQuoteRequestStatus || 'Draft',
            vendor: vendorRequest?.vendor?._id,
            requestedBy: vendorRequest?.requestedBy?._id,
            requestNotes: vendorRequest?.requestNotes,
            products: transformedProducts || [],
            requiredDeliveryDate: formatDate(vendorRequest?.requiredDeliveryDate),
            termsAndConditions: transformedTerms || [],
            attachments: transformedAttachments || [],
            createdBy: vendorRequest?.createdBy?._id,
            editedBy: vendorRequest?.editedBy?._id,
            editedNotes: vendorRequest?.editedNotes || []
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
    
    if (quoteData?.quotes) {
        const options = quoteData.quotes.map((quote) => ({
          value: quote._id,
          label: `Quote #${quote.quoteNumber} - ${quote.quoteStatus}`,
        }));
        setQuoteStatusOptions(options);
      }
  }, [quoteData, salseManData, vendorData]);

  // Calculate Derived Fields
//   useEffect(() => {
//     const totalAmount = formValues.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
//     const totalDiscount = formValues.items.reduce((sum, item) => sum + item.discount, 0);
//     const finalAmount = totalAmount - totalDiscount;

//     setFormValues((prev) => ({ ...prev, totalAmount, totalDiscount, finalAmount }));
//   }, [formValues.items]);

const { getRootProps, getInputProps } = useDropzone({
  onDrop: (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  }
});

const handleRemoveAttachment = (index) => {
  setFiles(files.filter((_, i) => i !== index));
};

const handleUploadAttachment = async (file, index) => {
  try {
    console.log(`Generating signed URL for ${file.name}`);

    const signedUrlResponse = await generateSignedUrl({
      title: file.name,
      mediaType: "doc",
      ext: file.name.split('.').pop() || "",
      active: true,
      uploadStatus: "progressing",
      uploadProgress: 0,
    });

    if (!signedUrlResponse || !signedUrlResponse.signedUrl) {
      throw new Error('Invalid signed URL response');
    }

    const { signedUrl, media } = signedUrlResponse;
    const mediaId = media._id;

    setMediaId(mediaId);

    console.log("Signed URL:", signedUrl, "Media ID:", mediaId);
    console.log("signedUrlResponse:", signedUrlResponse);
    console.log("Media:", media);

    // Perform the file upload
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));

        if (progress === 100) {
          updateMediaStatus({
            mediaType: "doc",
            title: file.name,
            ext: file.name.split('.').pop() || "",
            active: true,
            uploadStatus: "completed",
            uploadProgress: 100,
          });
        }
      },
    });

    // Add the uploaded file to form values
    setFormValues(prevValues => ({
      ...prevValues,
      attachments: [
        ...prevValues.attachments,
        { fileName: file.name, fileUrl: `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${file.name.split('.').pop()}` },
      ],
    }));
  } catch (error) {
    console.error("Upload error:", error);
    toast.error('Failed to upload attachment. Please try again.');
  }
};


const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formValues.products];
    updatedProducts[index][field] = value;
    setFormValues((prev) => ({ ...prev, products: updatedProducts }));
  };
  
  const addProduct = () => {
    setFormValues((prev) => ({
      ...prev,
      products: [...prev.products, { productName: '', description: '', quantity: 0 }],
    }));
  };
  
  const removeProduct = (index) => {
    const updatedProducts = formValues.products.filter((_, i) => i !== index);
    setFormValues((prev) => ({ ...prev, products: updatedProducts }));
  };
  

const handlePurchaserChange = (selectedOption) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      vendor: selectedOption.value,
    }));
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



  const handleStatusChange = (selectedOption) => {
    handleInputChange('vendorQuoteRequestStatus', selectedOption.value);
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
      navigate('/quoterequest');
    } catch (error) {
      toast.error('Failed to save Purchase Order');
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("formValues",formValues);
  console.log("vendorRequest",vendorRequest);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Vendor Quote Request Status</label>
            <Select
              options={poStatusOptions}
              value={poStatusOptions.find(option => option.value === formValues.vendorQuoteRequestStatus)}
              onChange={handleStatusChange}
              placeholder="Select Vendor Quote Request Status"
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
  {/* <div className="w-full sm:w-1/2 p-4">
    <label className="block w-full mb-2 text-text-color">PO Template</label>
    <input
      type="text"
      name="poTemplate"
      value={formValues.poTemplate}
      onChange={(e) => handleInputChange('poTemplate', e.target.value)}
      className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
    />
  </div> */}

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
          {/* <div className="w-full sm:w-1/2 p-4">
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
</div> */}


          {/* <div className="w-full md:w-1/2 p-4">
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
          </div> */}


          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color">Requested By</label>
          <Select
            name="requestedBy"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.value === formValues.requestedBy)}
            onChange={handlePurchaser}
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
            <label className="block w-full mb-2 text-text-color">Request Notes</label>
            <textarea
              name="Request Notes"
              value={formValues.requestNotes}
              onChange={(e) => handleInputChange('requestNotes', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
            />
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
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
          </div> */}

          <div className="w-full md:w-1/2 p-4">
            <label className="block w-full mb-2 text-text-color">Required Delivery Date</label>
            <input
              type="date"
              id="requiredDeliveryDate"
              value={formValues.requiredDeliveryDate}
              onChange={(e) => handleInputChange('requiredDeliveryDate', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              required
            />
          </div>

          {/* <div className="w-full md:w-1/2 p-4">
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
          </div> */}

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


<div className="w-full p-4">
  {/* Upload File Header */}
    <label className="block w-full mb-2 text-text-color">Upload file</label>

  {/* Dropzone */}
  <div
    {...getRootProps({
      className: "dropzone",
    })}
    className="w-full p-4 border-dashed border-2 border-gray-300 rounded-lg text-center mb-4"
  >
    <input {...getInputProps()} />
    <p className="text-gray-600">
      <span className="font-semibold">Drop items here</span> or{" "}
      <span className="text-black font-semibold cursor-pointer">
        Browse files
      </span>
    </p>
    <p className="text-sm text-gray-400 mt-2">
      Up to 25 MB • File name without special characters
    </p>
  </div>

  {/* File List */}
  <div className="space-y-2">
    {files.map((file, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 border rounded-md bg-secondary-card"
      >
        {/* Image Preview and Info */}
        <div className="flex items-center">
          {/* Image Preview */}
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-10 h-10 object-cover rounded-md mr-8"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center mr-4">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 8h10M7 12h4m1 8h.01M5 12a7 7 0 117 7A7 7 0 015 12z"
                ></path>
              </svg>
            </div>
          )}

          {/* File Info */}
          <div>
            <span className="block font-medium gray-300">{file.name}</span>
            {/* {file.size > 25 * 1024 * 1024 ? (
              <span className="text-xs text-red-500">
                File is too large (max. 25 MB)
              </span>
            ) : ( */}
              <span className="text-xs text-gray-500">
                {Math.round(file.size / (1024 * 1024))} MB
              </span>
            {/* )} */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center">
          {/* Upload Button */}
          <button
            className="mr-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleUploadAttachment(file, index);
            }}
          >
            Upload
          </button>
          {/* Remove Button */}
          <button
            className="text-gray-600 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setFiles(files.filter((_, i) => i !== index));
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
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
        {/* <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color">Payment History</label>
            <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addPayment}>
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

{/* Products Section */}
<div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color">Products</label>
    <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addProduct}>
      Add
    </button>
  </div>
  <div className="p-4 bg-secondary-card rounded-lg">
    {formValues.products.length === 0 && <p className='text-text-color'>No Products added</p>}
    {formValues.products.map((product, index) => (
      <div key={index} className="flex flex-col mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            name={`productName-${index}`}
            className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
            placeholder="Product Name"
            value={product.productName}
            onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
          />
          {/* <Select
                options={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                value={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                onChange={(selectedOption) => handleProductChange(index, 'productName', selectedOption.value)}
                className="w-1/4"
                placeholder="Select Product"
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
              /> */}
          <input
            type="text"
            name={`description-${index}`}
            className="block w-1/2 h-10 px-2 py-1 ml-2 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
            placeholder="Description"
            value={product.description}
            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
          />
          <input
            type="number"
            name={`quantity-${index}`}
            className="block w-1/4 h-10 px-2 py-1 ml-2 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
            placeholder="Quantity"
            value={product.quantity}
            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
          />
          <button
            type="button"
            className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
            onClick={() => removeProduct(index)}
          >
            Remove
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


          {/* <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-text-color">Products</label>
        <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addProduct}>
          Add
        </button>
      </div>
      <div className="products-container p-4 bg-secondary-card rounded-lg">
        {formValues.items.length === 0 && <p className='text-text-color'>No Products added</p>}

        {formValues.items.map((product, index) => (
          <div key={index} className="flex mb-2"> */}
            {/* Product Dropdown */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Product</label>
              <Select
                options={productData?.products?.map((p) => ({ value: p._id, label: p.name || 'Unnamed Product' }))}
                value={productData?.products?.find((p) => p._id === product.productId)}
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
            </div> */}

            {/* Variant Dropdown */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Variant</label>
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

            {/* Quantity Input */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Quantity</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
              />
            </div> */}

            {/* Unit Price Input */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Unit Price</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
              />
            </div> */}

            {/* Discount Input */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Discount</label>
              <input
                type="number"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition"
                value={product.discount}
                onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
              />
            </div> */}

            {/* Total Price Display */}
            {/* <div className="w-1/6 ml-2">
              <label className="block text-text-color">Total Price</label>
              <input type="number" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card text-text-color rounded-none focus:outline-none focus:border-white transition" value={product.totalPrice} readOnly />
            </div> */}

            {/* Remove Button */}
            {/* <button type="button" className="bg-secondary-button-color h-10 text-text-color px-4 py-2 rounded ml-2 mt-6" onClick={() => removeProduct(index)}>
              Remove
            </button>
          </div>
        ))} */}

        {/* Summary Fields */}
       {/* {formValues.items.length !== 0 &&
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
    </div> */}


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

export default VendorQuoteRequestForm;
