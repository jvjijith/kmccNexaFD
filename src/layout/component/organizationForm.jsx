import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import Autosuggest from 'react-autosuggest';
import { useNavigate } from 'react-router';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function OrganizationForm({ organizationDatas }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const identificationTypes = [
    { value: 'VAT', label: 'VAT' },
    { value: 'GST', label: 'GST' },
    { value: 'EIN', label: 'EIN' },
    { value: 'Company Registration', label: 'Company Registration' },
    { value: 'Other', label: 'Other' }
  ];
  const countryOptions = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Australia', label: 'Australia' },
    // Add more countries as needed
  ];
  const currencyOptions = [
    { name: 'US Dollar', code: 'USD', symbol: '$' },
    { name: 'Euro', code: 'EUR', symbol: '€' },
    { name: 'British Pound', code: 'GBP', symbol: '£' },
    // Add more currencies as needed
  ];
  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [mediaId, setMediaId] = useState([]);
  const [files, setFiles] = useState([]); 
  const [uploadProgress, setUploadProgress] = useState({});
  
    // Form state
  const [formData, setFormData] = useState({
      name: organizationDatas?.name || '',
      logo: organizationDatas?.logo || '',
      identificationDetails: organizationDatas?.identificationDetails || [],
      bankAccounts: organizationDatas?.bankAccounts || [],
      addresses: organizationDatas?.addresses || [],
      quoteTemplates: organizationDatas?.quoteTemplates || [],
      taxSettings: organizationDatas?.taxSettings || [],
      currency: organizationDatas?.currency || { code: "", symbol: "", name: "" }
    });


  // Determine if this is an edit (put) or create (post) operation
  const mutationHook = organizationDatas ? usePutData : usePostData;
  const api_url = organizationDatas ? `/organizations/${organizationDatas._id}` : '/organizations';
  const api_key = organizationDatas ? 'updateOrganization' : 'addOrganization';
  const { mutate: saveOrganization, isLoading, isError } = mutationHook(api_key, api_url);
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v', 'createdAt', 'updatedAt' ]) => {
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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (organizationDatas) {
        // Remove unwanted fields
        const cleanedContainer = removeUnwantedFields(organizationDatas);

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
          name: organizationDatas?.name,
          logo: organizationDatas?.logo,
          identificationDetails: cleanedContainer?.identificationDetails,
          bankAccounts: cleanedContainer?.bankAccounts,
          addresses: cleanedContainer?.addresses,
          quoteTemplates: cleanedContainer?.quoteTemplates,
          taxSettings: cleanedContainer?.taxSettings,
          currency: organizationDatas?.currency
        });
    }
    // setLoading(false);
}, [organizationDatas]);

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
    setFormData(prevValues => ({
      ...prevValues,
      logo: `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${file.name.split('.').pop()}`,
    }));
  } catch (error) {
    console.error("Upload error:", error);
    toast.error('Failed to upload attachment. Please try again.');
  }
};

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    saveOrganization(formData, {
      onSuccess: () => {
        toast.success('Organization saved successfully!');
        navigate('/organization');
      },
      onError: (error) => {
        toast.error('Failed to save organization.');
        console.error(error);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNestedChange = (field, index, nestedField, value) => {
    setFormData((prevData) => {
      const updatedField = [...prevData[field]];
      updatedField[index][nestedField] = value;
      return { ...prevData, [field]: updatedField };
    });
  };

  const addIdentificationDetail = () => {
    setFormData((prevData) => ({
      ...prevData,
      identificationDetails: [...prevData.identificationDetails, { type: "VAT", number: "" }]
    }));
  };

  const removeIdentificationDetail = (index) => {
    setFormData((prevData) => {
      const updatedDetails = prevData.identificationDetails.filter((_, i) => i !== index);
      return { ...prevData, identificationDetails: updatedDetails };
    });
  };

    // Handle input changes
    const handleBankDetailChange = (index, field, value) => {
        setFormData((prevData) => {
          const updatedBankAccounts = [...prevData.bankAccounts];
          updatedBankAccounts[index][field] = value;
          return { ...prevData, bankAccounts: updatedBankAccounts };
        });
      };
    
      // Add and remove bank details
      const addBankDetail = () => {
        setFormData((prevData) => ({
          ...prevData,
          bankAccounts: [...prevData.bankAccounts, { accountName: "", accountNumber: "", bankName: "", branchName: "", ifscCode: "", swiftCode: "" }]
        }));
      };
    
      const removeBankDetail = (index) => {
        setFormData((prevData) => {
          const updatedBankAccounts = prevData.bankAccounts.filter((_, i) => i !== index);
          return { ...prevData, bankAccounts: updatedBankAccounts };
        });
      };

      const handleAddressChange = (index, field, value) => {
        setFormData((prevData) => {
          const updatedAddresses = [...prevData.addresses];
          updatedAddresses[index][field] = value;
          return { ...prevData, addresses: updatedAddresses };
        });
      };
    
      const addAddress = () => {
        setFormData((prevData) => ({
          ...prevData,
          addresses: [...prevData.addresses, { street: "", city: "", state: "", country: "", postalCode: "" }]
        }));
      };
    
      const removeAddress = (index) => {
        setFormData((prevData) => {
          const updatedAddresses = prevData.addresses.filter((_, i) => i !== index);
          return { ...prevData, addresses: updatedAddresses };
        });
      };

      const handleTemplateChange = (index, field, value) => {
        setFormData((prevData) => {
          const updatedTemplates = [...prevData.quoteTemplates];
          updatedTemplates[index][field] = value;
          return { ...prevData, quoteTemplates: updatedTemplates };
        });
      };
    
      const handleSectionChange = (templateIndex, sectionIndex, field, value) => {
        setFormData((prevData) => {
          const updatedTemplates = [...prevData.quoteTemplates];
          updatedTemplates[templateIndex].sections[sectionIndex][field] = value;
          return { ...prevData, quoteTemplates: updatedTemplates };
        });
      };
    
      const addQuoteTemplate = () => {
        setFormData((prevData) => ({
          ...prevData,
          quoteTemplates: [
            ...prevData.quoteTemplates,
            {
              name: '',
              description: '',
              sections: [{ type: 'Header', content: '', order: 0, isEditable: true }],
              isDefault: true
            }
          ]
        }));
      };
    
      const removeQuoteTemplate = (index) => {
        setFormData((prevData) => ({
          ...prevData,
          quoteTemplates: prevData.quoteTemplates.filter((_, i) => i !== index)
        }));
      };
    
      const addSection = (templateIndex) => { 
        setFormData((prevData) => {
          const updatedTemplates = [...prevData.quoteTemplates];
          
          // Check if the last added section matches the default one
          const lastSection = updatedTemplates[templateIndex].sections.slice(-1)[0];
          if (
            lastSection &&
            lastSection.type === 'Custom' &&
            lastSection.content === '' &&
            lastSection.isEditable === true &&
            lastSection.order === updatedTemplates[templateIndex].sections.length - 1
          ) {
            return prevData; // Skip adding if last section is identical to the new one
          }
          
          updatedTemplates[templateIndex].sections.push({
            type: 'Custom',
            content: '',
            order: updatedTemplates[templateIndex].sections.length,
            isEditable: true
          });
          
          return { ...prevData, quoteTemplates: updatedTemplates };
        });
      };
      
    
      const removeSection = (templateIndex, sectionIndex) => {
        setFormData((prevData) => {
          const updatedTemplates = [...prevData.quoteTemplates];
          updatedTemplates[templateIndex].sections = updatedTemplates[templateIndex].sections.filter((_, i) => i !== sectionIndex);
          return { ...prevData, quoteTemplates: updatedTemplates };
        });
      };

      const addTaxSetting = () => {
        setFormData((prevData) => ({
          ...prevData,
          taxSettings: [...prevData.taxSettings, { name: "", country: "", type: "Single", components: [{ name: "", rate: 0, description: "" }], isDefault: true, applicableRegions: [""], notes: "" }]
        }));
      };
      
      const removeTaxSetting = (index) => {
        setFormData((prevData) => ({
          ...prevData,
          taxSettings: prevData.taxSettings.filter((_, i) => i !== index)
        }));
      };

      const handleComponentChange = (taxIndex, compIndex, field, value) => {
        setFormData((prevData) => {
          const updatedSettings = [...prevData.taxSettings];
          updatedSettings[taxIndex].components[compIndex][field] = value;
          return { ...prevData, taxSettings: updatedSettings };
        });
      };
      
      const addComponent = (taxIndex) => { 
        setFormData((prevData) => {
          const updatedSettings = [...prevData.taxSettings];
          
          // Check if the last added component matches the default one
          const lastComponent = updatedSettings[taxIndex].components.slice(-1)[0];
          if (
            lastComponent &&
            lastComponent.name === '' &&
            lastComponent.rate === 0 &&
            lastComponent.description === ''
          ) {
            return prevData; // Skip adding if the last component is identical to the new one
          }
          
          updatedSettings[taxIndex].components.push({
            name: '',
            rate: 0,
            description: ''
          });
          
          return { ...prevData, taxSettings: updatedSettings };
        });
      };
      
      
      const removeComponent = (taxIndex, compIndex) => {
        setFormData((prevData) => {
          const updatedSettings = [...prevData.taxSettings];
          updatedSettings[taxIndex].components = updatedSettings[taxIndex].components.filter((_, i) => i !== compIndex);
          return { ...prevData, taxSettings: updatedSettings };
        });
      };
      
      const handleApplicableRegionsChange = (index, selectedOptions) => {
        setFormData(prevData => {
          const updatedTaxSettings = [...prevData.taxSettings];
          updatedTaxSettings[index].applicableRegions = selectedOptions.map(option => option.value);
          return { ...prevData, taxSettings: updatedTaxSettings };
        });
      }

      // Handle change for the currency fields
  const handleCurrencyChange = (field, value) => {
    setFormData((prevData) => {
      let updatedCurrency = { ...prevData.currency, [field]: value };

      // Automatically fill in code and symbol based on the entered currency name
      if (field === 'name' && currencyOptions[value]) {
        updatedCurrency = {
          ...updatedCurrency,
          code: currencyOptions[value].code,
          symbol: currencyOptions[value].symbol,
        };
      }

      return { ...prevData, currency: updatedCurrency };
    });
  };

   // Function to handle currency auto-fill
   const handleCurrencySelection = (selectedCurrency) => {
    setFormData((prevData) => ({
      ...prevData,
      currency: {
        ...prevData.currency,
        name: selectedCurrency.name,
        code: selectedCurrency.code,
        symbol: selectedCurrency.symbol,
      },
    }));
  };

  // Autosuggest functions
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    return inputValue.length === 0
      ? []
      : currencyOptions.filter(
          (currency) =>
            currency.name.toLowerCase().includes(inputValue)
        );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    handleCurrencySelection(suggestion);
  };


  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  console.log("formData",formData);
  console.log("organizationDatas",organizationDatas);
  return (
    <div>
      <form onSubmit={handleSubmit}>

       {/* Name */}
<div className="flex flex-wrap">
  <div className="w-full p-4">
    <label className="block w-full mb-2 text-text-color primary-text">Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
    />
  </div>
  </div>

        {/* Logo */}
        <div className="w-full p-4">
  <label className="block w-full mb-4 text-text-color">Attachments</label>
  <div
    {...getRootProps({ className: "dropzone" })}
    className="w-full p-4 bg-secondary-card text-text-color border-2 border-border rounded mb-2"
  >
    <input {...getInputProps()} />
    <p className='text-text-color'>Drag & drop files here, or click to select files</p>
    <div className="w-full p-4">
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between mb-2">
          {/* File name */}
          <span>{file.name}</span>
          {/* Progress bar */}
          <progress
            value={uploadProgress[file.name] || 0}
            max="100"
            className="flex-1 mx-2"
          >
            {uploadProgress[file.name] || 0}%
          </progress>
          {/* Upload button */}
          <button
            className="ml-2 text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleUploadAttachment(file, index);
            }}
          >
            Upload
          </button>
          {/* Remove button */}
          <button
            className="ml-2 text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setFiles(files.filter((_, i) => i !== index));
            }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  </div>
  <div className="w-full p-4">
      <div  className="flex items-center justify-between mb-2">
        {/* File link */}
        <a
          href={formData.logo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400"
        >
          {formData.logo}
        </a>
        {/* Remove button */}
        <button
          className="ml-2 text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveAttachment(index);
          }}
        >
          X
        </button>
      </div>
  </div>
</div>


       {/* Identification Details */}
       <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Identification Details</label>
            <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addIdentificationDetail}>Add</button>
          </div>
          <div className="identification-container p-4 bg-secondary-card rounded-lg">
            {formData.identificationDetails.length === 0 && <p className='text-text-color'>No Identification Details added</p>}
            {formData.identificationDetails.map((detail, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <Select
                  options={identificationTypes}
                  value={identificationTypes.find(option => option.value === detail.type)}
                  onChange={(selectedOption) => handleNestedChange('identificationDetails', index, 'type', selectedOption.value)}
                  placeholder="Select Type"
                  className="w-1/3"
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
                    placeholder: (provided) => ({
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
                      color: 'white',
                      cursor: 'pointer',
                    }),
                  }}
                />
                <input
                  type="text"
                  value={detail.number}
                  onChange={(e) => handleNestedChange('identificationDetails', index, 'number', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="Identification Number"
                />
                <button
                  type="button"
                  className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
                  onClick={() => removeIdentificationDetail(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

         {/* Bank Details */}
         <div className=" mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Bank Details</label>
            <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addBankDetail}>Add</button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {(formData.bankAccounts.length === 0) && <p className='text-text-color'>No Bank Details added</p>}
            {formData.bankAccounts.map((bank, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  name={`accountName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="Account Name"
                  value={bank.accountName}
                  onChange={(e) => handleBankDetailChange(index, 'accountName', e.target.value)}
                />
                <input
                  type="text"
                  name={`accountNumber-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="Account Number"
                  value={bank.accountNumber}
                  onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                />
                <input
                  type="text"
                  name={`bankName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="Bank Name"
                  value={bank.bankName}
                  onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                />
                <input
                  type="text"
                  name={`branchName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="Branch Name"
                  value={bank.branchName}
                  onChange={(e) => handleBankDetailChange(index, 'branchName', e.target.value)}
                />
                <input
                  type="text"
                  name={`ifscCode-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="IFSC"
                  value={bank.ifscCode}
                  onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                />
                <input
                  type="text"
                  name={`swiftCode-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="SWIFT"
                  value={bank.swiftCode}
                  onChange={(e) => handleBankDetailChange(index, 'swiftCode', e.target.value)}
                />
                <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeBankDetail(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

         {/* Address Section */}
         <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Addresses</label>
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addAddress}>Add</button>
        </div>
        <div className="notes-container p-4 bg-secondary-card rounded-lg">
          {(formData.addresses.length === 0) && <p className='text-text-color'>No Addresses added</p>}
          {formData.addresses.map((address, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`street-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Street"
                value={address.street}
                onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
              />
              <input
                type="text"
                name={`city-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="City"
                value={address.city}
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
              />
              <input
                type="text"
                name={`state-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="State"
                value={address.state}
                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
              />
              <input
                type="text"
                name={`country-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="Country"
                value={address.country}
                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
              />
              <input
                type="text"
                name={`postalCode-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)}
              />
              <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeAddress(index)}>Remove</button>
            </div>
          ))}
        </div>
        </div>

         {/* Render each quote template */}
         <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Quote Template</label>
          <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded" onClick={addQuoteTemplate}>Add</button>
        </div>
        <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {(formData.quoteTemplates.length === 0) && <p className='text-text-color'>No Quote Template added</p>}
         {formData.quoteTemplates.map((template, templateIndex) => (
          <div key={templateIndex} className="mb-4 p-4 rounded border border-border">
         <div className=" mb-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Template Name"
                value={template.name}
                onChange={(e) => handleTemplateChange(templateIndex, 'name', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
              />
              <input
                type="text"
                placeholder="Template Description"
                value={template.description}
                onChange={(e) => handleTemplateChange(templateIndex, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
              />
            </div>
            </div>
            <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Template Sections</label>
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={() => addSection(templateIndex)}>Add</button>
        </div>
        <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {(template.sections.length === 0) &&
              <div className="mb-4 border p-4 rounded border-border"> <p className='text-text-color'>No Template Section added</p></div>}
            {template.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 border p-4 rounded border-border">
                <div className="flex justify-between items-center">
                <Select
                  options={[
                    { value: 'Header', label: 'Header' },
                    { value: 'Footer', label: 'Footer' },
                    { value: 'Terms', label: 'Terms' },
                    { value: 'IntroNote', label: 'IntroNote' },
                    { value: 'ItemTable', label: 'ItemTable' },
                    { value: 'Custom', label: 'Custom' }
                  ]}
                  value={{ value: section.type, label: section.type }}
                  onChange={(option) => handleSectionChange(templateIndex, sectionIndex, 'type', option.value)}
                  className="mb-2 w-1/2  ml-2"
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
                    placeholder: (provided) => ({
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
                      color: 'white',
                      cursor: 'pointer',
                    }),
                  }}
                />
                <input
                  type="text"
                  placeholder="Content"
                  value={section.content}
                  onChange={(e) => handleSectionChange(templateIndex, sectionIndex, 'content', e.target.value)}
                  className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color mb-2 ml-2"
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={section.order}
                  onChange={(e) => handleSectionChange(templateIndex, sectionIndex, 'order', e.target.value)}
                  className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color mb-2 ml-2"
                />
                
                </div>
                <div className="w-1/2 sm:w-1/2 p-4">
                {/* <div className="mb-2"> */}
                    <label className="relative inline-flex items-center cursor-pointer primary-text">
                    <input
                        type="checkbox"
                        name="isEditable"
                        checked={section.isEditable}
                        onChange={(e) => handleSectionChange(templateIndex, sectionIndex, 'isEditable', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                    <span className="ml-3 text-sm font-medium text-text-color">Editable</span>
                    </label>
                {/* </div> */}
                </div>
                <div className="flex flex-wrap justify-end mt-2">
                <button type="button" onClick={() => removeSection(templateIndex, sectionIndex)} className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2">
                  Remove
                </button>
                </div>
                
              </div>
            ))}
            </div>
            </div>
            <div className="flex flex-wrap justify-end">
            <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeQuoteTemplate(templateIndex)}>Remove</button>
            </div>
          </div>
        ))}
        </div>
        </div>

        {/* Render each tax setting */}
<div className=" mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Tax Settings</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addTaxSetting}>Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {(formData.taxSettings.length === 0) && <p className='text-text-color'>No Tax Setting added</p>}
    {formData.taxSettings.map((taxSetting, taxIndex) => (
      <div key={taxIndex} className="mb-4 p-4 rounded text-text-color border border-border">
        
        <div className="flex justify-between items-center mb-2">
          <input
            type="text"
            placeholder="Tax Name"
            value={taxSetting.name}
            onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'name', e.target.value)}
            className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
          />
          <input
            type="text"
            placeholder="Country"
            value={taxSetting.country}
            onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'country', e.target.value)}
            className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
          />
          
        </div>
        <div className="flex justify-between items-center mb-2">
          <Select
          options={[
            { value: 'Single', label: 'Single' },
            { value: 'Compound', label: 'Compound' },
            { value: 'Multiple', label: 'Multiple' }
          ]}
          value={{ value: taxSetting.type, label: taxSetting.type }}
          onChange={(option) => handleNestedChange('taxSettings', taxIndex, 'type', option.value)}
          className=" w-1/2 ml-2"
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
            placeholder: (provided) => ({
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
              color: 'white',
              cursor: 'pointer',
            }),
          }}
        />
          

        <Select
              isMulti
              options={countryOptions}
              value={countryOptions.filter(option => taxSetting.applicableRegions.includes(option.value))}
              onChange={(selectedOptions) => handleApplicableRegionsChange(taxIndex, selectedOptions)}
              className="w-1/2 ml-2"
              placeholder="Applicable Regions"
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
                  color: 'white',
                  cursor: 'pointer',
                }),
              }}
            />
            </div>
        <div className="flex justify-between items-center">
            <textarea
            type="text"
            placeholder="Notes"
            value={taxSetting.notes}
            onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'notes', e.target.value)}
            className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
          />
        </div>

        {/* <div className="w-1/2 sm:w-1/2 p-4">
          <label className="relative inline-flex items-center cursor-pointer primary-text">
            <input
              type="checkbox"
              checked={taxSetting.isDefault}
              onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'isDefault', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
            <span className="ml-3 text-sm font-medium text-text-color">Default</span>
          </label>
        </div> */}

        {/* Render each component */}
        <div className="flex items-center justify-between mb-2 mt-2">
          <label className="block w-full mb-2 text-text-color primary-text">Components</label>
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={() => addComponent(taxIndex)}>Add</button>
        </div>
        {(taxSetting.components.length === 0) &&<div className="mb-4 border p-4 rounded border-border"> <p className='text-text-color'>No Components added</p></div>}
        {taxSetting.components.map((component, compIndex) => (
          <div key={compIndex} className="mb-4 p-4 rounded border border-border">
        <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              placeholder="Component Name"
              value={component.name}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'name', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
            />
            <input
              type="number"
              placeholder="Rate (%)"
              value={component.rate}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'rate', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={component.description}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'description', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
            />
            <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeComponent(taxIndex, compIndex)}>Remove</button>
          </div>
          </div>
        ))}
                <div className="flex flex-wrap justify-end">
        <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeTaxSetting(taxIndex)}>Remove</button>
        </div>
      </div>
      
    ))}
  </div>
</div>

<div className="p-4">
      <h2 className="text-lg font-semibold text-text-color mb-4">Currency Details</h2>
      
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
        
      <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color">Currency Name</label>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            onSuggestionSelected={onSuggestionSelected}
            getSuggestionValue={(suggestion) => suggestion.name}
            renderSuggestion={(suggestion) => <div>{suggestion.name}</div>}
            inputProps={{
              placeholder: 'Enter currency name',
              value: formData.currency.name,
              onChange: (e, { newValue }) => {
                setFormData((prevData) => ({
                  ...prevData,
                  currency: { ...prevData.currency, name: newValue },
                }));
              },
              className:
                'block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color',
            }}
            theme={{
              container: 'relative', // Make sure the container is relatively positioned
              suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
              suggestion: 'p-2 cursor-pointer',
              suggestionHighlighted: 'bg-blue-500 text-black'
            }}
          />
        </div>
        {['code', 'symbol'].map((field) => (
          <div key={field} className="w-full sm:w-1/2 p-4">
            <label className="block mb-2 text-text-color capitalize">{field}</label>
            <input
              type="text"
              name={`currency.${field}`}
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              value={formData.currency[field]}
              readOnly
            />
          </div>
        ))}
</div>
      </div>
    </div>
{/* Submit Button */}
<div className="flex flex-wrap justify-end p-4">
        <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">Submit</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default OrganizationForm;
