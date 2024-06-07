import React, { useState, useEffect } from "react";
import { useGetData, usePostData, usePutData } from "../../common/api";

function ContactForm({ typeData, customerId }) {
  const customerDefault = {
    name: '',
    email: '',
    primaryPhoneNumber: '',
    secondaryPhoneNumber: '',
    primaryPhoneWhatsApp: false,
    secondaryPhoneWhatsApp: false,
    address: '',
    country: '',
    state: '',
    customer: '',
    note: '',
    designation: '',
    decisionMaker: false
  };

  const [customerData, setCustomerData] = useState(customerDefault);

  const { data: customerDetail, isLoading: customerDetailLoading, refetch: refetchCustomerDetail } = useGetData("Customer", typeData === 'contacts' ? `/contact/${customerId}` : `/contact/customer/${customerId}`);
  const { mutate: addContact, isPending: isAddingContact, error: addContactError } = usePostData("addContact", `/contact/add/`);
  const { mutate: updateContact, isPending: isUpdatingContact, error: updateContactError } = usePutData("updateContact", `/contact/update/${customerId}`);

  useEffect(() => {
    if (typeData === 'update' && customerId) {
      refetchCustomerDetail();
    }
  }, [typeData, customerId, refetchCustomerDetail]);

  useEffect(() => {
    if (customerDetail) {
      setCustomerData({
        name: customerDetail.name,
        email: customerDetail.email,
        primaryPhoneNumber: customerDetail.primaryPhoneNumber,
        secondaryPhoneNumber: customerDetail.secondaryPhoneNumber,
        primaryPhoneWhatsApp: customerDetail.primaryPhoneWhatsApp,
        secondaryPhoneWhatsApp: customerDetail.secondaryPhoneWhatsApp,
        address: customerDetail.address,
        country: customerDetail.country,
        state: customerDetail.state,
        customer: customerDetail.customer,
        note: customerDetail.note,
        designation: customerDetail.designation,
        decisionMaker: customerDetail.decisionMaker
      });
    }
  }, [customerDetail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCustomerData(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...customerData,
      note: customerData.note.split(',').map(n => n.trim()),
      active: true
    };

    if (typeData === 'update' && customerId) {
      updateContact(payload);
    } else {
      addContact(payload);
    }

    setCustomerData(customerDefault);
  };

  if (customerDetailLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Contact Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your Customer Name"
                value={customerData.name}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
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
                value={customerData.email}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Address *</label>
              <textarea
                name="address"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Address ..."
                value={customerData.address}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              ></textarea>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Notes *</label>
              <textarea
                name="note"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Notes ..."
                value={customerData.note}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              ></textarea>
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
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your State"
                value={customerData.state}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Customer *</label>
              <select
                name="customer"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                value={customerData.customer}
                onChange={handleChange}
                style={{ textAlign: "initial" }}
              >
                <option value={"Amazon"}>Amazon</option>
                <option value={"Broadcast Media"}>Broadcast Media</option>
                <option value={"Healthcare"}>Healthcare</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Designation *</label>
              <input
                type="text"
                name="designation"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your Designation"
                value={customerData.designation}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Country *</label>
              <input
                type="text"
                name="country"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Country"
                value={customerData.country}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Primary Phone Number *</label>
              <input
                type="text"
                name="primaryPhoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Primary Phone Number"
                value={customerData.primaryPhoneNumber}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <label className="flex items-center text-sm text-white mt-2">
                <input
                  type="checkbox"
                  name="primaryPhoneWhatsApp"
                  checked={customerData.primaryPhoneWhatsApp}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Is WhatsApp
              </label>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Secondary Phone Number *</label>
              <input
                type="text"
                name="secondaryPhoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Secondary Phone Number"
                value={customerData.secondaryPhoneNumber}
                onChange={handleChange}
                autoComplete="off"
                style={{ textAlign: "initial" }}
              />
              <label className="flex items-center text-sm text-white mt-2">
                <input
                  type="checkbox"
                  name="secondaryPhoneWhatsApp"
                  checked={customerData.secondaryPhoneWhatsApp}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Is WhatsApp
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="flex items-center text-sm text-white mt-2">
                <input
                  type="checkbox"
                  name="decisionMaker"
                  checked={customerData.decisionMaker}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Is Decision Maker
              </label>
            </div>
          </div>
        </div>

        <div className="text-right px-4 py-2">
          <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded">
            {isAddingContact || isUpdatingContact ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {addContactError && <div className="text-red-500 text-center mt-2">{addContactError.message}</div>}
      {updateContactError && <div className="text-red-500 text-center mt-2">{updateContactError.message}</div>}
    </div>
  );
}

export default ContactForm;
