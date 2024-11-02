import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import Autosuggest from 'react-autosuggest';
import { useNavigate } from 'react-router';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    saveOrganization(formData, {
      onSuccess: () => {
        toast.success('Organization saved successfully!');
        // navigate('/organizations');
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

  console.log(formData);
  return (
    <div>
      <form onSubmit={handleSubmit}>

       {/* Name */}
<div className="flex flex-wrap">
  <div className="w-full sm:w-1/2 p-4">
    <label className="block w-full mb-2 text-white">Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      className="block w-full px-3 py-2 text-white bg-black border rounded"
    />
  </div>

        {/* Logo */}
  <div className="w-full sm:w-1/2 p-4">
    <label className="block w-full mb-2 text-white">Logo</label>
    <input
      type="text"
      name="logo"
      value={formData.logo}
      onChange={handleChange}
      className="block w-full px-3 py-2 text-white bg-black border rounded"
    />
  </div>
</div>


       {/* Identification Details */}
       <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-white">Identification Details</label>
            <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addIdentificationDetail}>Add</button>
          </div>
          <div className="identification-container p-4 bg-sidebar-card-top rounded-lg">
            {formData.identificationDetails.length === 0 && <p>No Identification Details added</p>}
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
                      backgroundColor: state.isSelected ? '#007bff' : 'black',
                      color: 'white',
                      cursor: 'pointer',
                    }),
                  }}
                />
                <input
                  type="text"
                  value={detail.number}
                  onChange={(e) => handleNestedChange('identificationDetails', index, 'number', e.target.value)}
                  className="block w-full px-3 py-2 text-white bg-black border rounded"
                  placeholder="Identification Number"
                />
                <button
                  type="button"
                  className="bg-black text-white px-4 py-2 rounded ml-2"
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
            <label className="block w-full mb-2 text-white">Bank Details</label>
            <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addBankDetail}>Add</button>
          </div>
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
            {(formData.bankAccounts.length === 0) && <p>No Bank Details added</p>}
            {formData.bankAccounts.map((bank, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  name={`accountName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="Account Name"
                  value={bank.accountName}
                  onChange={(e) => handleBankDetailChange(index, 'accountName', e.target.value)}
                />
                <input
                  type="text"
                  name={`accountNumber-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="Account Number"
                  value={bank.accountNumber}
                  onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                />
                <input
                  type="text"
                  name={`bankName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="Bank Name"
                  value={bank.bankName}
                  onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                />
                <input
                  type="text"
                  name={`branchName-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="Branch Name"
                  value={bank.branchName}
                  onChange={(e) => handleBankDetailChange(index, 'branchName', e.target.value)}
                />
                <input
                  type="text"
                  name={`ifscCode-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="IFSC"
                  value={bank.ifscCode}
                  onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                />
                <input
                  type="text"
                  name={`swiftCode-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  placeholder="SWIFT"
                  value={bank.swiftCode}
                  onChange={(e) => handleBankDetailChange(index, 'swiftCode', e.target.value)}
                />
                <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeBankDetail(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

         {/* Address Section */}
         <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Addresses</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addAddress}>Add</button>
        </div>
        <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
          {(formData.addresses.length === 0) && <p>No Addresses added</p>}
          {formData.addresses.map((address, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`street-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Street"
                value={address.street}
                onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
              />
              <input
                type="text"
                name={`city-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="City"
                value={address.city}
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
              />
              <input
                type="text"
                name={`state-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="State"
                value={address.state}
                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
              />
              <input
                type="text"
                name={`country-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="Country"
                value={address.country}
                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
              />
              <input
                type="text"
                name={`postalCode-${index}`}
                className="block w-1/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)}
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeAddress(index)}>Remove</button>
            </div>
          ))}
        </div>
        </div>

         {/* Render each quote template */}
         <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Quote Template</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addQuoteTemplate}>Add</button>
        </div>
        <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
        {(formData.quoteTemplates.length === 0) && <p>No Quote Template added</p>}
         {formData.quoteTemplates.map((template, templateIndex) => (
          <div key={templateIndex} className="mb-4 p-4 rounded border border-nexa-gray">
         <div className=" mb-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Template Name"
                value={template.name}
                onChange={(e) => handleTemplateChange(templateIndex, 'name', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
              />
              <input
                type="text"
                placeholder="Template Description"
                value={template.description}
                onChange={(e) => handleTemplateChange(templateIndex, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
              />
            </div>
            </div>
            <div className=" mb-4">
         <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Template Sections</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={() => addSection(templateIndex)}>Add</button>
        </div>
        <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
        {(template.sections.length === 0) &&
              <div className="mb-4 border p-4 rounded border-nexa-gray"> <p>No Template Section added</p></div>}
            {template.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 border p-4 rounded border-nexa-gray">
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
                      backgroundColor: state.isSelected ? '#007bff' : 'black',
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
                  className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white mb-2 ml-2"
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={section.order}
                  onChange={(e) => handleSectionChange(templateIndex, sectionIndex, 'order', e.target.value)}
                  className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white mb-2 ml-2"
                />
                
                </div>
                <div className="w-1/2 sm:w-1/2 p-4">
                {/* <div className="mb-2"> */}
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name="isEditable"
                        checked={section.isEditable}
                        onChange={(e) => handleSectionChange(templateIndex, sectionIndex, 'isEditable', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                    <span className="ml-3 text-sm font-medium text-white">Editable</span>
                    </label>
                {/* </div> */}
                </div>
                <div className="flex flex-wrap justify-end mt-2">
                <button type="button" onClick={() => removeSection(templateIndex, sectionIndex)} className="bg-black text-white px-4 py-2 rounded ml-2">
                  Remove
                </button>
                </div>
                
              </div>
            ))}
            </div>
            </div>
            <div className="flex flex-wrap justify-end">
            <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeQuoteTemplate(templateIndex)}>Remove</button>
            </div>
          </div>
        ))}
        </div>
        </div>

        {/* Render each tax setting */}
<div className=" mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-white">Tax Settings</label>
    <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addTaxSetting}>Add</button>
  </div>
  <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
    {(formData.taxSettings.length === 0) && <p>No Tax Setting added</p>}
    {formData.taxSettings.map((taxSetting, taxIndex) => (
      <div key={taxIndex} className="mb-4 p-4 rounded text-white border border-nexa-gray">
        
        <div className="flex justify-between items-center mb-2">
          <input
            type="text"
            placeholder="Tax Name"
            value={taxSetting.name}
            onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'name', e.target.value)}
            className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
          />
          <input
            type="text"
            placeholder="Country"
            value={taxSetting.country}
            onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'country', e.target.value)}
            className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
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
              backgroundColor: state.isSelected ? '#007bff' : 'black',
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
            className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
          />
        </div>

        {/* <div className="w-1/2 sm:w-1/2 p-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={taxSetting.isDefault}
              onChange={(e) => handleNestedChange('taxSettings', taxIndex, 'isDefault', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
            <span className="ml-3 text-sm font-medium text-white">Default</span>
          </label>
        </div> */}

        {/* Render each component */}
        <div className="flex items-center justify-between mb-2 mt-2">
          <label className="block w-full mb-2 text-white">Components</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={() => addComponent(taxIndex)}>Add</button>
        </div>
        {(taxSetting.components.length === 0) &&<div className="mb-4 border p-4 rounded border-nexa-gray"> <p>No Components added</p></div>}
        {taxSetting.components.map((component, compIndex) => (
          <div key={compIndex} className="mb-4 p-4 rounded border border-nexa-gray">
        <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              placeholder="Component Name"
              value={component.name}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'name', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
            />
            <input
              type="number"
              placeholder="Rate (%)"
              value={component.rate}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'rate', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={component.description}
              onChange={(e) => handleComponentChange(taxIndex, compIndex, 'description', e.target.value)}
              className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
            />
            <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeComponent(taxIndex, compIndex)}>Remove</button>
          </div>
          </div>
        ))}
                <div className="flex flex-wrap justify-end">
        <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeTaxSetting(taxIndex)}>Remove</button>
        </div>
      </div>
      
    ))}
  </div>
</div>

<div className="p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Currency Details</h2>
      
  <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
        
      <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-white">Currency Name</label>
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
                'block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white',
            }}
            theme={{
              container: 'relative', // Make sure the container is relatively positioned
              suggestionsContainer: 'absolute w-full bg-black rounded-md z-10',
              suggestion: 'p-2 cursor-pointer',
              suggestionHighlighted: 'bg-blue-500 text-black'
            }}
          />
        </div>
        {['code', 'symbol'].map((field) => (
          <div key={field} className="w-full sm:w-1/2 p-4">
            <label className="block mb-2 text-white capitalize">{field}</label>
            <input
              type="text"
              name={`currency.${field}`}
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
        <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">Submit</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default OrganizationForm;
