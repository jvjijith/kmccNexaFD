import React, { useState, useEffect } from "react";
import { useGetData, usePostData, usePutData } from "../../common/api";
import Select from 'react-select';
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import LoadingScreen from "../ui/loading/loading";

function ContactForm({ typeData, customerId }) {
  
  const navigate = useNavigate();

  console.log("customerId", customerId);
  console.log("typeData", typeData);
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
  const [contactId, setContactId] = useState(null);

  const { data: contactDetail, refetch: refetchContactDetail, load } = useGetData('contactDetail',
    typeData === "contacts" ? `contact/${customerId}` : `contact/customer/${customerId}`
  );
  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useGetData("VendorData", "/vendor", {});
const { data: customerData, isLoading: customerLoading, error: customerError } = useGetData("customerData", "/customer", {});
  const { mutate: addContact, isLoading, isError } = usePostData("addContact", "/contact/add");
  const { mutate: updateContact, loading, error } = usePutData("updateContact", `/contact/update/${contactId}`);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      refetchContactDetail();
    }
  }, [customerId, refetchContactDetail]);

  useEffect(() => {
    if (contactDetail) {
      let currentContact = Array.isArray(contactDetail.contacts) ? contactDetail.contacts[currentPage] : contactDetail;
      
      if (currentContact) {
        setContactData((prevState) => ({
          ...prevState,
          ...currentContact,
          note: currentContact.note || [],
        }));
        setContactId(currentContact._id);
      }
    }
  }, [contactDetail, currentPage]);

  const vendorsArray = Array.isArray(vendorData) ? vendorData : vendorData?.customers;
  const customersArray = Array.isArray(customerData) ? customerData : customerData?.customers;

  // Combine both vendors and customers into one array
const combinedArray = [...(vendorsArray || []), ...(customersArray || [])];

const options = combinedArray.map(item => ({
  value: item._id,
  label: item.name,
  type: item.vendor ? 'Vendor' : 'Customer', // Identify whether the option is a Vendor or Customer
}));

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

    const { _id, __v, ...cleanedData } = contactData;

    const payload = customerId ? { 
      ...cleanedData, 
      customer: customerId 
    } : { 
      ...cleanedData 
    };

    const mutate = contactId ? updateContact : addContact;
    mutate(payload, {
      onSuccess: () => {
        toast.success(`Contact ${contactId ? 'updated' : 'added'} successfully!`);
        if (typeData==="vendor") {
          navigate("/vendor/list");
        }
        if (typeData==="customer") {
          navigate("/customer");
        }
        
      },
      onError: (error) => {
        console.error(`Error ${contactId ? 'updating' : 'adding'} contact:`, error);
        toast.error(`Error ${contactId ? 'updating' : 'adding'} contact`);
        if (typeData==="vendor") {
          navigate("/vendor/list");
        }
        if (typeData==="customer") {
          navigate("/customer");
        }
        
      },
    });

    if (!contactId) {
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



    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    if (contactDetail && Array.isArray(contactDetail.contacts)) {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, contactDetail.contacts.length - 1));
    }
  };

  // Handle case when contactDetail or contacts array is not available or empty
  if (customerId && !typeData && (!contactDetail || !contactDetail.contacts || contactDetail.contacts.length < 1)) {
    return <div>No contacts available</div>;
  }

  if (vendorLoading || customerLoading || isLoading || loading || load) {
    return <LoadingScreen />;
  }

  console.log(contactDetail);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Contact Name *</label>
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Contact Name"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Email Address *</label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Email"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Address *</label>
              <textarea
                name="address"
                value={contactData.address}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Customer Address ..."
              ></textarea>
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Notes *</label>
              <textarea
                name="note"
                value={contactData.note.join(", ")}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Notes ..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">State *</label>
              <input
                type="text"
                name="state"
                value={contactData.state}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your State"
              />
            </div>
          </div>
          

        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Designation *</label>
              <input
                type="text"
                name="designation"
                value={contactData.designation}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Designation"
              />
            </div>
          </div>
          </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Country *</label>
              <input
                type="text"
                name="country"
                value={contactData.country}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Country"
              />
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Primary PhoneNumber *</label>
              <input
                type="text"
                name="primaryPhoneNumber"
                value={contactData.primaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Phone Number"
              />
            </div>
          </div>
          </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Secondary PhoneNumber *</label>
              <input
                type="text"
                name="secondaryPhoneNumber"
                value={contactData.secondaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Phone Number"
              />
            </div>
          </div>
        
          {!(customerId) && (
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-text-color">Customer/Vendor *</label>
        <Select
          options={options}
          value={options.find(option => option.value === contactData.customer) || null}
          onChange={(selectedOption) => setContactData(prevState => ({ ...prevState, customer: selectedOption.value }))}
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
              backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
              color: state.isSelected ? '#f8f9fa' : 'black',
              cursor: 'pointer'
            })
          }}
          isLoading={vendorLoading || customerLoading}
          isDisabled={vendorLoading || customerLoading || vendorError || customerError}
        />
      </div>
    </div>
  )}
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
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ml-3 text-sm font-medium text-text-color">Primary WhatsApp Number</span>
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
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ml-3 text-sm font-medium text-text-color">Secondary WhatsApp Number</span>
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
              <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
              <span className="ml-3 text-sm font-medium text-text-color">Decision Maker</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-text-color bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
          >
            Submit
          </button>
        </div>
      </form>

      {/* {contactDetail && contactDetail.contacts.length > 1 && ( */}
       {(contactDetail?.contacts?.length < 0) && <div className="flex justify-center items-center mt-4">
          <button
            onClick={handlePreviousPage}
            // disabled={currentPage === 0}
            className="text-text-color px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="mx-2 text-text-color">{currentPage + 1}</span>
          <button
            onClick={handleNextPage}
            // disabled={currentPage === contactDetail.contacts.length - 1}
            className="text-text-color px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {">"}
          </button>
        </div>}
      {/* )} */}
    </div>
  );
}

export default ContactForm;
