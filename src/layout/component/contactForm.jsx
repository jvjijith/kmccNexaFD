import React, { useState, useEffect } from "react";
import { useGetData, usePostData, usePutData } from "../../common/api";

function ContactForm({ typeData, customerId }) {
  const [contactData, setContactData] = useState({
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
    note: [],
    designation: '',
    decisionMaker: false,
  });

  const [currentPage, setCurrentPage] = useState(0);

  const { data: contactDetail, refetch: refetchContactDetail } = useGetData('contactDetail',
    typeData === "contacts" ? `contact/${customerId}` : `contact/customer/${customerId}`
  );
  const { mutate: addContact } = usePostData("addContact", "/contact/add");
  const { mutate: updateContact } = usePutData("updateContact", `/contact/update/${customerId}`);

  useEffect(() => {
    if (customerId) {
      refetchContactDetail();
    }
  }, [customerId, refetchContactDetail]);

  useEffect(() => {
    if (contactDetail) {
      if (Array.isArray(contactDetail.contacts)) {
        if (contactDetail.contacts[currentPage]) {
          setContactData((prevState) => ({
            ...prevState,
            ...contactDetail.contacts[currentPage],
            note: contactDetail.contacts[currentPage].note || [],
          }));
        }
      } else {
        setContactData((prevState) => ({
          ...prevState,
          ...contactDetail,
          note: contactDetail.note || [],
        }));
      }
    }
  }, [contactDetail, currentPage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'note') {
      setContactData((prevState) => ({
        ...prevState,
        note: value?.split(",").map(note => note.trim()),
      }));
    } else {
      setContactData((prevState) => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...contactData };
    if (customerId) {
      updateContact(payload);
    } else {
      addContact(payload);
    }
    setContactData({
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
      note: [],
      designation: '',
      decisionMaker: false,
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    if (contactDetail && Array.isArray(contactDetail.contacts)) {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, contactDetail.contacts.length - 1));
    }
  };
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
                value={contactData.name}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your Customer Name"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Email Address *</label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Email"
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
                value={contactData.address}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer Address ..."
              ></textarea>
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Notes *</label>
              <textarea
                name="note"
                value={contactData.note.join(", ")}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Notes ..."
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
                value={contactData.state}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your State"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Customer *</label>
              <input
                type="text"
                name="customer"
                value={contactData.customer}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Customer ID"
              />
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
                value={contactData.designation}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your Designation"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Country *</label>
              <input
                type="text"
                name="country"
                value={contactData.country}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Country"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Primary PhoneNumber *</label>
              <input
                type="text"
                name="primaryPhoneNumber"
                value={contactData.primaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Your Phone Number"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Secondary PhoneNumber *</label>
              <input
                type="text"
                name="secondaryPhoneNumber"
                value={contactData.secondaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Phone Number"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="primaryPhoneWhatsApp"
                  checked={contactData.primaryPhoneWhatsApp}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ml-3 text-sm font-medium text-white">Primary WhatsApp Number</span>
              </label>
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="secondaryPhoneWhatsApp"
                  checked={contactData.secondaryPhoneWhatsApp}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ml-3 text-sm font-medium text-white">Secondary WhatsApp Number</span>
              </label>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 p-4">
          <div className="mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="decisionMaker"
                checked={contactData.decisionMaker}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
              <span className="ml-3 text-sm font-medium text-white">Decision Maker</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
          >
            Submit
          </button>
        </div>
      </form>

      {/* {contactDetail && contactDetail.contacts.length > 1 && ( */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={handlePreviousPage}
            // disabled={currentPage === 0}
            className="text-white px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="mx-2 text-white">{currentPage + 1}</span>
          <button
            onClick={handleNextPage}
            // disabled={currentPage === contactDetail.contacts.length - 1}
            className="text-white px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      {/* )} */}
    </div>
  );
}

export default ContactForm;
