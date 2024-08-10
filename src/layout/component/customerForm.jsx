import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { customerDefault, stateCountryCurrencyMapping, languages } from '../../constant';
import Select from 'react-select';
import Autosuggest from 'react-autosuggest';
import LoadingScreen from '../ui/loading/loading';
import { useParams } from 'react-router';

const states = Object.keys(stateCountryCurrencyMapping);

function CustomerForm({ typeData, customerId }) {
  // const {id} = useParams();
  // const typeData =id?'update':'add';
  console.log('customerId', customerId);
  console.log('typeData', typeData);
  const [languageValue, setLanguageValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [customerData, setCustomerData] = useState(customerDefault);
  const [isIndividual, setIsIndividual] = useState(false);
  const [isStoreUser, setStoreUser] = useState(false);
  const [identificationNumbers, setIdentificationNumbers] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [stateValue, setStateValue] = useState('');

  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? '/customer/update' : '/customer/add';
  const api_key = typeData === 'update' ? 'updateCustomer' : 'addCustomer';
  const { mutate: saveCustomer, isLoading, isError } = mutationHook(api_key, api_url);
  const { data: customerDetail, isLoading: customerDetailLoading, refetch: refetchCustomerDetail } = useGetData("Customer", `/customer/customer/${customerId}`);
  const { data: categoryData, refetch: refetchCategories } = useGetData("categories", "/category");
  const { mutate: signup, isPending: isSigningUp, error: signupError } = usePostData("signup", "/auth/signup");


  useEffect(() => {
    refetchCategories();
    refetchCustomerDetail();
  }, [ refetchCategories, refetchCustomerDetail]);


  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }

    if (customerDetail) {
      setCustomerData(customerDetail);
      setIdentificationNumbers(customerDetail.identificationNumbers || [{ type: '', number: '' }]);
      setBankDetails(customerDetail.bankDetails || [{ accountNumber: '', bankName: '', location: '', IBAN: '', swiftCode: '', IFSC: '' }]);
      setIsIndividual(customerDetail.individual);
      setStoreUser(customerDetail.storeUser);
      setStateValue(customerDetail.state);
      const selectedLanguage = languages.find(lang => lang.code === customerDetail.language);
      setLanguageValue(selectedLanguage.name);
      // const value=categories.find(option => option._id === customerDetail.category);
      // setCategories(value.categoryName);
    }
   
  }, [categoryData,customerDetail]);

  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (value) => {
    const inputValue = value?.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : languages.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const onLanguageChange = (event, { newValue }) => {
    setLanguageValue(newValue);
    const selectedLanguage = languages.find(lang => lang.name === newValue);
    if (selectedLanguage) {
      setCustomerData(prevState => ({
        ...prevState,
        language: selectedLanguage.code
      }));
    }
  };


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

  const categoryOptions = categoryData?.categories?.map(category => ({
    value: category._id, 
    label: category.categoryName
    // value: employee.metadataId,
    // label: employee.name,
  }));
  

  const handleStateSuggestionsFetchRequested = ({ value }) => {
    setStateSuggestions(getStateSuggestion(value));
  };

  const handleStateSuggestionsClearRequested = () => {
    setStateSuggestions([]);
  };

  const getStateSuggestion = (value) => {
    const inputValue = value?.trim().toLowerCase();
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
    let customerUserId = null;
    if (isIndividual) {
      const signupRequestBody = {
        email: customerData.email,
        password: customerData.password,
      };
      signup(signupRequestBody, {
        onSuccess: (signupResponse) => {
          customerUserId = signupResponse.uid;

          const payload = {
            ...customerData,
            storeUser: isStoreUser,
            individual: isIndividual,
            active: true,
            customerUserId,
            identificationNumbers,
            bankDetails,
          };
          saveCustomer(payload);
          setCustomerData(customerDefault);
        },
        onError: (error) => {
          console.error("Error signing up:", error);
          toast.error('Error signing up.');
        },
      });
    } else {
      const payload = {
        ...customerData,
        storeUser: isStoreUser,
        individual: isIndividual,
        active: true,
        customerUserId,
        identificationNumbers,
        bankDetails,
      };
      saveCustomer(payload);
      setCustomerData(customerDefault);
    }
  };


  if (isLoading) {
    return <LoadingScreen />;
  }

  // const inputProps = {
  //   placeholder: 'Enter Language',
  //   value: languageValue,
  //   onChange: onLanguageChange,
  //   className: 'block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white',
  //   autoComplete: 'off'
  // };

  console.log('customerId', customerId);
  console.log('typeData', typeData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Customer Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Name"
                autoComplete="off"
                value={customerData?.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Email Address *</label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Email"
                autoComplete="off"
                value={customerData?.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Phone *</label>
              <input
                type="text"
                name="phone"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Phone Number"
                autoComplete="off"
                value={customerData?.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Website</label>
              <input
                type="text"
                name="website"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Website"
                autoComplete="off"
                value={customerData?.website}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4 relative">
    <div className="mb-4">
      <label className="float-left inline-block mb-2 text-white">State</label>
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
          className: 'block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white'
        }}
        theme={{
          container: 'relative', // Make sure the container is relatively positioned
          suggestionsContainer: 'absolute w-full bg-black rounded-md z-10',
          suggestion: 'p-2 cursor-pointer',
          suggestionHighlighted: 'bg-blue-500 text-black'
        }}
      />
    </div>
  </div>
          
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Location</label>
              <input
                type="text"
                name="location"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Location"
                autoComplete="off"
                value={customerData?.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Country</label>
              <input
                type="text"
                name="country"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Country"
                autoComplete="off"
                value={customerData?.country}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="float-left inline-block mb-2 text-white">Language *</label>
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
            className: 'block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white'
          }}
          theme={{
            container: 'relative', // Make sure the container is relatively positioned
            suggestionsContainer: 'absolute w-full bg-black rounded-md z-10',
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
              <label className="float-left inline-block mb-2 text-white">Currency</label>
              <input
                type="text"
                name="currency"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Currency"
                autoComplete="off"
                value={customerData?.currency}
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Shipping Address *</label>
              <textarea
                type="text"
                name="shippingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Shipping Address"
                autoComplete="off"
                value={customerData?.shippingAddress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Billing Address *</label>
              <textarea
                type="text"
                name="billingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Billing Address"
                autoComplete="off"
                value={customerData?.billingAddress}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-white">Category *</label>
    <Select
      options={categories?.map(category => ({ value: category._id, label: category.categoryName }))}
      value={categoryOptions?.find(option => option._id === customerData.category)}
      onChange={(selectedOption) => setCustomerData(prevState => ({ ...prevState, category: selectedOption.value }))}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: 'black',
          borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
          borderBottomWidth: '2px',
          borderRadius: '0px',
          height: '40px', // h-10: 2.5rem = 40px
          paddingLeft: '8px', // px-2: 0.5rem = 8px
          paddingRight: '8px', // px-2: 0.5rem = 8px
          color: 'white'
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
          backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
          color: state.isSelected ? 'black' : 'white',
          cursor: 'pointer'
        })
      }}
    />
  </div>
</div>

        </div>

        {/* Password Field */}
        {isIndividual && (
          <div className="w-full p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Password *</label>
              <input
                type="password"
                name="password"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Password"
                autoComplete="off"
                value={customerData?.password}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Toggle Buttons */}
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="storeUser"
                id="storeUser"
                checked={isStoreUser}
                onChange={() => handleToggle('storeUser')} />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                Store User
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="individual"
                id="individual"
                checked={isIndividual}
                onChange={() => handleToggle('individual')} />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                Individual
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>
        {/* <div className="flex p-4"> */}
          {/* <button type="button" className={`mr-2 ${customerData.vendor ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('vendor')}>Vendor</button>
          <button type="button" className={`mr-2 ${customerData.storeUser ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('storeUser')}>Store User</button>
          <button type="button" className={`${isIndividual ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('individual')}>Individual</button> */}
        </div>

        {/* Identification Numbers */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Identification Numbers</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addIdentificationNumber}>Add</button>
          </div>
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
          {(identificationNumbers.length===0)&&<p>No Identification Number added</p>}
          {identificationNumbers?.map((identification, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`identificationType-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Type"
                value={identification.type}
                onChange={(e) => handleIdentificationChange(index, 'type', e.target.value)}
              />
              <input
                type="text"
                name={`identificationNumber-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="Number"
                value={identification.number}
                onChange={(e) => handleIdentificationChange(index, 'number', e.target.value)}
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={() => removeIdentificationNumber(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Bank Details</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addBankDetail}>Add</button>
        </div>
        <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
        {(bankDetails.length===0)&&<p>No Bank Details added</p>}
          {bankDetails?.map((bank, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`accountNumber-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
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
                name={`location-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="Location"
                value={bank.location}
                onChange={(e) => handleBankDetailChange(index, 'location', e.target.value)}
              />
              <input
                type="text"
                name={`IBAN-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="IBAN"
                value={bank.IBAN}
                onChange={(e) => handleBankDetailChange(index, 'IBAN', e.target.value)}
              />
              <input
                type="text"
                name={`swiftCode-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="Swift Code"
                value={bank.swiftCode}
                onChange={(e) => handleBankDetailChange(index, 'swiftCode', e.target.value)}
              />
              <input
                type="text"
                name={`IFSC-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                placeholder="IFSC"
                value={bank.IFSC}
                onChange={(e) => handleBankDetailChange(index, 'IFSC', e.target.value)}
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={() => removeBankDetail(index)}>Remove</button>
            </div>
          ))}
         </div>
         </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            {isLoading || isSigningUp ? 'Saving...' : 'Save'}
          </button>
          {isError && <p className="text-red-500 mt-2">Error occurred while saving the customer.</p>}
          {signupError && <p className="text-red-500 mt-2">Error occurred while signing up the individual customer.</p>}
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;
