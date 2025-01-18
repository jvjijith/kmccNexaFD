import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { vendorDefault, stateCountryCurrencyMapping, languages } from '../../constant';
import Select from 'react-select';
import Autosuggest from 'react-autosuggest';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';

const states = Object.keys(stateCountryCurrencyMapping);

function VendorForm({ typeData, vendor }) {
  
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState(vendorDefault);
  const [isIndividual, setIsIndividual] = useState(false);
  const [identificationNumbers, setIdentificationNumbers] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [isStoreUser, setStoreUser] = useState(false);
  const [categories, setCategories] = useState([]);
  const [languageValue, setLanguageValue] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [stateValue, setStateValue] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const [changeCategories, setChangeCategories] = useState(false);
  
  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? `/vendor/update/${vendor?._id}` : '/vendor/add';
  const api_key = typeData === 'update' ? 'updateVendor' : 'addVendor';
  const { mutate: saveCustomer, isLoading, isError } = mutationHook(api_key, api_url);
  const { data: categoryData, isPending: isCategories, refetch: refetchCategories } = useGetData("categories", "/category");
  const { mutate: signup, isPending: isSigningUp, error: signupError } = usePostData("signup", "/auth/signup");

  // Simulate loading for 10 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 10 seconds delay

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, []);


  useEffect(() => {
    refetchCategories();
  }, [ refetchCategories]);


  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }

    if (vendor) {
      setCustomerData(vendor);
      setIdentificationNumbers(vendor.identificationNumbers || [{ type: '', number: '' }]);
      setBankDetails(vendor.bankDetails || [{ accountNumber: '', bankName: '', location: '', IBAN: '', swiftCode: '', IFSC: '' }]);
      setIsIndividual(vendor.individual);
      setStoreUser(vendor.storeUser);
      setStateValue(vendor.state);
      const selectedLanguage = languages?.find(lang => lang.code === vendor.language);
      setLanguageValue(selectedLanguage.name);
      // const value=categories.find(option => option._id === customerDetail.category);
      // setCategories(value.categoryName);
    }
    
  }, [categoryData,vendor]);
  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : languages.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const onLanguageChange = (event, { newValue }) => {
   
    setLanguageValue(newValue);
    const selectedLanguage = languages?.find(lang => lang.name === newValue);
    if (selectedLanguage) {
      setCustomerData(prevState => ({
        ...prevState,
        language: selectedLanguage.code
      }));
    }

  };

  const categoryOptions = categoryData?.categories?.map(category => ({
    value: category._id, 
    label: category.categoryName
  }));
  
  const selectedCategoryOption = categoryOptions?.find(option => option.value === (vendor ? changeCategories ? customerData.category : customerData.category?._id : customerData.category));


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'state') {
      updateCountryAndCurrency(value);
    }
  };

  const updateCountryAndCurrency = (state) => {
    const mapping = stateCountryCurrencyMapping[state];
    if (mapping) {
      setCustomerData(prevState => ({
        ...prevState,
        country: mapping.country,
        currency: mapping.currency
      }));
    }
  };

  const handleStateSuggestionsFetchRequested = ({ value }) => {
    setStateSuggestions(getStateSuggestion(value));
  };

  const handleStateSuggestionsClearRequested = () => {
    setStateSuggestions([]);
  };

  const getStateSuggestion = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : states.filter(state =>
      state.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const getStateSuggestionValue = (suggestion) => suggestion;

  const renderStateSuggestion = (suggestion) => (
    <div>
      {suggestion}
    </div>
  );

  const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion) => (
  <div>
    {suggestion.name}
  </div>
);

  const onStateChange = (event, { newValue }) => {
    setStateValue(newValue);
    setCustomerData(prevState => ({
      ...prevState,
      state: newValue
    }));
    updateCountryAndCurrency(newValue);
  };



  const handleIdentificationChange = (index, field, value) => {
    const newIdentificationNumbers = [...identificationNumbers];
    newIdentificationNumbers[index][field] = value;
    setIdentificationNumbers(newIdentificationNumbers);
  };

  const handleBankDetailChange = (index, field, value) => {
    const newBankDetails = [...bankDetails];
    newBankDetails[index][field] = value;
    setBankDetails(newBankDetails);
  };

  const addIdentificationNumber = () => {
    setIdentificationNumbers([...identificationNumbers, { type: '', number: '' }]);
  };

  const removeIdentificationNumber = (index) => {
    const newIdentificationNumbers = identificationNumbers.filter((_, i) => i !== index);
    setIdentificationNumbers(newIdentificationNumbers);
  };

  const addBankDetail = () => {
    setBankDetails([...bankDetails, { accountNumber: '', bankName: '', location: '', IBAN: '', swiftCode: '', IFSC: '' }]);
  };

  const removeBankDetail = (index) => {
    const newBankDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(newBankDetails);
  };

  const handleToggle = (field) => {
    if (field === 'storeUser') {
      setStoreUser(!isStoreUser);
    }
    if (field === 'individual') {
      setIsIndividual(!isIndividual);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const cleanedIdentificationNumbers = customerData.identificationNumbers.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });
  
    const cleanedBankDetails = customerData.bankDetails.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });
  
    const { _id, __v, ...cleanedData } = customerData;
  
    const payload = vendor ? {
      ...cleanedData, // Spread the cleaned customer data
      category: changeCategories ? customerData.category : customerData.category._id,
      storeUser: isStoreUser,
      individual: isIndividual,
      active: true,
      customerUserId: null, // Set to null as signup is not needed
      identificationNumbers: cleanedIdentificationNumbers,
      bankDetails: cleanedBankDetails,
    }:{
      ...cleanedData, // Spread the cleaned customer data
      category: changeCategories ? customerData.category : customerData.category._id,
      storeUser: isStoreUser,
      individual: isIndividual,
      active: true,
      customerUserId: null, // Set to null as signup is not needed
      identificationNumbers,
      bankDetails,
    };
  
    try {
      await saveCustomer(payload);
      resetForm();
      toast.success('Customer saved successfully!');
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error('Error saving customer.');
    }
  };

  const resetForm = () => {
    setCustomerData(vendorDefault);
    setStateValue('');
    setLanguageValue('');
    setStoreUser(false);
    setIsIndividual(false);
    setIdentificationNumbers([]);
    setBankDetails([]);
    setCategories([]);
    if (vendor) {
      navigate("/vendor/list");
    }
  };

  if (isLoading || loading || isSigningUp) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Vendor Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Vendor Name"
                autoComplete="off"
                value={customerData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Email Address *</label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Vendor Email"
                autoComplete="off"
                value={customerData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Phone *</label>
              <input
                type="text"
                name="phone"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Phone Number"
                autoComplete="off"
                value={customerData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Website</label>
              <input
                type="text"
                name="website"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Vendor Website"
                autoComplete="off"
                value={customerData.website}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4 relative">
    <div className="mb-4">
      <label className="float-left inline-block mb-2 text-text-color primary-text">State</label>
      <Autosuggest
        suggestions={stateSuggestions}
        onSuggestionsFetchRequested={handleStateSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleStateSuggestionsClearRequested}
        getSuggestionValue={getStateSuggestionValue}
        renderSuggestion={renderStateSuggestion}
        inputProps={{
          placeholder: 'Enter State',
          value: stateValue,
          onChange: onStateChange,
          className: 'block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color'
        }}
        theme={{
          container: 'relative', // Make sure the container is relatively positioned
          suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
          suggestion: 'p-2 cursor-pointer',
          suggestionHighlighted: 'bg-blue-500 text-black'
        }}
      />
    </div>
  </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Location</label>
              <input
                type="text"
                name="location"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Location"
                autoComplete="off"
                value={customerData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Country</label>
              <input
                type="text"
                name="country"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Country"
                autoComplete="off"
                value={customerData.country}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="float-left inline-block mb-2 text-text-color primary-text">Language *</label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: 'Enter Language',
              value: languageValue,
              onChange: onLanguageChange,
            className: 'block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color'
          }}
          theme={{
            container: 'relative', // Make sure the container is relatively positioned
            suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
            suggestion: 'p-2 cursor-pointer',
            suggestionHighlighted: 'bg-blue-500 text-black'
          }}
        />
      </div>
    </div>
    
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Currency</label>
              <input
                type="text"
                name="currency"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Currency"
                autoComplete="off"
                value={customerData.currency}
                onChange={handleChange}
                
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Shipping Address *</label>
              <textarea
                type="text"
                name="shippingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Shipping Address"
                autoComplete="off"
                value={customerData.shippingAddress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Billing Address *</label>
              <textarea
                type="text"
                name="billingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Billing Address"
                autoComplete="off"
                value={customerData.billingAddress}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Category *</label>
    <Select
     options={categoryOptions}
     value={selectedCategoryOption || null} // Make sure to pass the whole object or null
     onChange={(selectedOption) => {
       setCustomerData(prevState => ({
         ...prevState,
         category: selectedOption.value // Store the value (ID) directly in customerData
       }));
       setChangeCategories(true);
     }}
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
</div>
        </div>

        {/* Password Field */}
        {/* {isIndividual && (
          <div className="w-full p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Password *</label>
              <input
                type="password"
                name="password"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Password"
                autoComplete="off"
                value={customerData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        )} */}

        {/* Toggle Buttons */}
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input type="checkbox" value="" className="sr-only peer" name="storeUser"
                id="storeUser"
                checked={isStoreUser}
                onChange={() => handleToggle('storeUser')} />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ms-3 text-md font-medium text-text-color dark:text-text-color">
                Store User
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
            {" "} */}
            {/* col-sm-6 */}
            {/* <div className="mb-4">
            <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input type="checkbox" value="" className="sr-only peer" name="individual"
                id="individual"
                checked={customerData.individual}
                onChange={() => handleToggle('individual')} />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ms-3 text-md font-medium text-text-color dark:text-text-color">
                Individual
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div> */}
        {/* <div className="flex p-4"> */}
          {/* <button type="button" className={`mr-2 ${customerData.vendor ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('vendor')}>Vendor</button>
          <button type="button" className={`mr-2 ${customerData.storeUser ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('storeUser')}>Store User</button>
          <button type="button" className={`${isIndividual ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('individual')}>Individual</button> */}
        </div>

        {/* Identification Numbers */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Identification Numbers</label>
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addIdentificationNumber}>Add</button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
          {(identificationNumbers.length===0)&&<p className='text-text-color'>No Identification Number added</p>}
          {identificationNumbers?.map((identification, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`identificationType-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Type"
                value={identification.type}
                onChange={(e) => handleIdentificationChange(index, 'type', e.target.value)}
              />
              <input
                type="text"
                name={`identificationNumber-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="Number"
                value={identification.number}
                onChange={(e) => handleIdentificationChange(index, 'number', e.target.value)}
              />
              <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={() => removeIdentificationNumber(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Bank Details</label>
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addBankDetail}>Add</button>
        </div>
        <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {(bankDetails.length===0)&&<p className='text-text-color'>No Bank Details added</p>}
          {bankDetails?.map((bank, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`accountNumber-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
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
                name={`location-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="Location"
                value={bank.location}
                onChange={(e) => handleBankDetailChange(index, 'location', e.target.value)}
              />
              <input
                type="text"
                name={`IBAN-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="IBAN"
                value={bank.IBAN}
                onChange={(e) => handleBankDetailChange(index, 'IBAN', e.target.value)}
              />
              <input
                type="text"
                name={`swiftCode-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="Swift Code"
                value={bank.swiftCode}
                onChange={(e) => handleBankDetailChange(index, 'swiftCode', e.target.value)}
              />
              <input
                type="text"
                name={`IFSC-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                placeholder="IFSC"
                value={bank.IFSC}
                onChange={(e) => handleBankDetailChange(index, 'IFSC', e.target.value)}
              />
              <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={() => removeBankDetail(index)}>Remove</button>
            </div>
          ))}
         </div>
         </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">
            {isLoading || isSigningUp ? 'Saving...' : 'Save'}
          </button>
          {/* {isError && <p className="text-red-500 mt-2">Error occurred while saving the customer.</p>}
          {signupError && <p className="text-red-500 mt-2">Error occurred while signing up the individual customer.</p>} */}
        </div>
      </form>
    </div>
  );
}

export default VendorForm;
