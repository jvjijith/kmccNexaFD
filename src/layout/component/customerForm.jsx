import React, { useState, useEffect } from 'react';
import CategoryForm from './categoryForm';
import PopUpModal from '../ui/modal/modal';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { customerDefault } from '../../constant';

function CustomerForm({ typeData, customerId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState(customerDefault);
  const [isIndividual, setIsIndividual] = useState(false);
  const [identificationNumbers, setIdentificationNumbers] = useState([{ type: '', number: '' }]);
  const [bankDetails, setBankDetails] = useState([{ accountNumber: '', bankName: '', location: '', IBAN: '', swiftCode: '', IFSC: '' }]);
  const [categories, setCategories] = useState([]);
  
  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? '/customer/update' : '/customer/add';
  const api_key = typeData === 'update' ? 'updateCustomer' : 'addCustomer';
  const { mutate: saveCustomer, isLoading, isError } = mutationHook(api_key, api_url);
  const { data: categoryData, refetch: refetchCategories } = useGetData("categories", "/category");
  const { mutate: signup, isPending: isSigningUp, error: signupError } = usePostData("signup", "/auth/signup");

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }
  }, [categoryData]);

  useEffect(() => {
    if (typeData === 'update' && customerId) {
      // Fetch customer data and populate form fields
      // Assuming the API to fetch customer data by ID is /customer/customer/{customerId}
      const fetchCustomerData = async () => {
        const response = await useGetData("customerData", `/customer/customer/${customerId}`);
        setCustomerData(response.data);
        setIdentificationNumbers(response.data.identificationNumbers || [{ type: '', number: '' }]);
        setBankDetails(response.data.bankDetails || [{ accountNumber: '', bankName: '', location: '', IBAN: '', swiftCode: '', IFSC: '' }]);
        setIsIndividual(response.data.individual);
      };
      fetchCustomerData();
    }
  }, [customerId, typeData]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
    setCustomerData(prevState => ({
      ...prevState,
      [field]: !prevState[field]
    }));
    if (field === 'individual') {
      setIsIndividual(!isIndividual);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let customerUserId = null;
    if (isIndividual) {
      const { email, password } = customerData;
      const signupResponse = await signup({ email, password });
      customerUserId = signupResponse.data.uid;
    }
    const payload = {
      ...customerData,
      active: true,
      customerUserId,
      identificationNumbers,
      bankDetails,
    };
    saveCustomer(payload);
    setCustomerData(customerDefault);
  };

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
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Customer Name"
                autoComplete="off"
                value={customerData.name}
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
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Customer Email"
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
              <label className="float-left inline-block mb-2 text-white">Phone *</label>
              <input
                type="text"
                name="phone"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Phone Number"
                autoComplete="off"
                value={customerData.phone}
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
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Customer Website"
                autoComplete="off"
                value={customerData.website}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">State *</label>
              <input
                type="text"
                name="state"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter State"
                autoComplete="off"
                value={customerData.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Location</label>
              <input
                type="text"
                name="location"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
              <label className="float-left inline-block mb-2 text-white">Country *</label>
              <input
                type="text"
                name="country"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Country"
                autoComplete="off"
                value={customerData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Language *</label>
              <input
                type="text"
                name="language"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Language"
                autoComplete="off"
                value={customerData.language}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Currency *</label>
              <input
                type="text"
                name="currency"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Currency"
                autoComplete="off"
                value={customerData.currency}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Shipping Address *</label>
              <input
                type="text"
                name="shippingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
              <label className="float-left inline-block mb-2 text-white">Billing Address *</label>
              <input
                type="text"
                name="billingAddress"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Billing Address"
                autoComplete="off"
                value={customerData.billingAddress}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Category *</label>
              <select
                name="category"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                value={customerData.category}
                onChange={handleChange}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
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
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Password"
                autoComplete="off"
                value={customerData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Identification Numbers */}
        <div className="w-full p-4">
          <label className="float-left inline-block mb-2 text-white">Identification Numbers</label>
          {identificationNumbers.map((identification, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`identificationType-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Type"
                value={identification.type}
                onChange={(e) => handleIdentificationChange(index, 'type', e.target.value)}
              />
              <input
                type="text"
                name={`identificationNumber-${index}`}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="Number"
                value={identification.number}
                onChange={(e) => handleIdentificationChange(index, 'number', e.target.value)}
              />
              <button type="button" className="ml-2" onClick={() => removeIdentificationNumber(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addIdentificationNumber}>Add Identification Number</button>
        </div>

        {/* Bank Details */}
        <div className="w-full p-4">
          <label className="float-left inline-block mb-2 text-white">Bank Details</label>
          {bankDetails.map((bank, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                name={`accountNumber-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Account Number"
                value={bank.accountNumber}
                onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
              />
              <input
                type="text"
                name={`bankName-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="Bank Name"
                value={bank.bankName}
                onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
              />
              <input
                type="text"
                name={`location-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="Location"
                value={bank.location}
                onChange={(e) => handleBankDetailChange(index, 'location', e.target.value)}
              />
              <input
                type="text"
                name={`IBAN-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="IBAN"
                value={bank.IBAN}
                onChange={(e) => handleBankDetailChange(index, 'IBAN', e.target.value)}
              />
              <input
                type="text"
                name={`swiftCode-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="Swift Code"
                value={bank.swiftCode}
                onChange={(e) => handleBankDetailChange(index, 'swiftCode', e.target.value)}
              />
              <input
                type="text"
                name={`IFSC-${index}`}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
                placeholder="IFSC"
                value={bank.IFSC}
                onChange={(e) => handleBankDetailChange(index, 'IFSC', e.target.value)}
              />
              <button type="button" className="ml-2" onClick={() => removeBankDetail(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addBankDetail}>Add Bank Detail</button>
        </div>

        {/* Toggle Buttons */}
        <div className="flex p-4">
          <button type="button" className={`mr-2 ${customerData.vendor ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('vendor')}>Vendor</button>
          <button type="button" className={`mr-2 ${customerData.storeUser ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('storeUser')}>Store User</button>
          <button type="button" className={`${isIndividual ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => handleToggle('individual')}>Individual</button>
        </div>

        <div className="flex justify-center p-4">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
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
