import React, { useState, useEffect } from "react";
import { useGetData, usePostData, usePutData } from "../../common/api";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import LoadingScreen from "../ui/loading/loading";

function ContactForm({ contact ,custId, nav }) {
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    primaryPhoneNumber: "",
    secondaryPhoneNumber: "",
    primaryPhoneWhatsApp: false,
    secondaryPhoneWhatsApp: false,
    address: "",
    country: "",
    state: "",
    customer: custId ? custId : "",
    note: [],
    designation: "",
    decisionMaker: false,
  });
  const [loading, setLoading] = useState(true);

  const mutationHook = contact ? usePutData : usePostData;
  const api_url = contact ? `/contact/update/${contact?._id}` : "/contact/add";
  const api_key = contact ? "updateContact" : "addContact";
  const { mutate: saveContact, isLoading, isError } = mutationHook(api_key, api_url);

  const { data: vendorData, isLoading: vendorLoading, vendorError } = useGetData("VendorData", "/vendor", {});
  const { data: customerData, isLoading: customerLoading, customerError } = useGetData("CustomerData", "/customer", {});

  const vendorsArray = Array.isArray(vendorData) ? vendorData : vendorData?.customers;
  const customersArray = Array.isArray(customerData) ? customerData : customerData?.customers;

  // Combine both vendors and customers into one array
const combinedArray = [...(vendorsArray || []), ...(customersArray || [])];

const options = combinedArray.map(item => ({
  value: item._id,
  label: item.name,
  type: item.vendor ? 'Vendor' : 'Customer', // Identify whether the option is a Vendor or Customer
}));

  useEffect(() => {
    if (contact) {
      setContactData({
        name: contact?.name,
        email: contact?.email,
        primaryPhoneNumber: contact?.primaryPhoneNumber,
        secondaryPhoneNumber: contact?.secondaryPhoneNumber,
        primaryPhoneWhatsApp: contact?.primaryPhoneWhatsApp,
        secondaryPhoneWhatsApp: contact?.secondaryPhoneWhatsApp,
        address: contact?.address,
        country: contact?.country,
        state: contact?.state,
        designation: contact?.designation,
        decisionMaker: contact?.decisionMaker,
        customer: contact?.customer?._id,
        note: contact.note || [],
      });
    }
    setLoading(false);
  }, [contact]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'note') {
      setContactData((prevState) => ({
        ...prevState,
        note: value?.split(",").map(note => note.trim()),
      }));}
    else{
    setContactData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveContact(contactData, {
      onSuccess: () => {
        toast.success(`Contact ${contact ? "updated" : "added"} successfully!`);
        navigate(nav?`/${nav}/contact`:`/contact`, { state: { custId } });
      },
      onError: (error) => {
        console.error(error);
        toast.error(`Failed to ${contact ? "update" : "add"} contact.`);
      },
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  console.log("custId",custId);
  console.log("contactData",contactData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Contact Name *</label>
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Contact Name"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Email Address *</label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Email"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Address *</label>
              <textarea
                name="address"
                value={contactData.address}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Customer Address ..."
              ></textarea>
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Notes *</label>
              <textarea
                name="note"
                value={contactData.note.join(", ")}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Notes ..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">State *</label>
              <input
                type="text"
                name="state"
                value={contactData.state}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your State"
              />
            </div>
          </div>
          

        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Designation *</label>
              <input
                type="text"
                name="designation"
                value={contactData.designation}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Designation"
              />
            </div>
          </div>
          </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Country *</label>
              <input
                type="text"
                name="country"
                value={contactData.country}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Country"
              />
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Primary PhoneNumber *</label>
              <input
                type="text"
                name="primaryPhoneNumber"
                value={contactData.primaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Your Phone Number"
              />
            </div>
          </div>
          </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Secondary PhoneNumber *</label>
              <input
                type="text"
                name="secondaryPhoneNumber"
                value={contactData.secondaryPhoneNumber}
                onChange={handleChange}
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Phone Number"
              />
            </div>
          </div>
        
          {!(contact) || !(custId) && (
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-text-color primary-text">Customer/Vendor *</label>
        <Select
          options={options}
          value={options.find(option => option.value === contactData.customer) || null}
          onChange={(selectedOption) => setContactData(prevState => ({ ...prevState, customer: selectedOption.value }))}
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
              <label className="relative inline-flex items-center cursor-pointer primary-text">
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
              <label className="relative inline-flex items-center cursor-pointer primary-text">
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
            <label className="relative inline-flex items-center cursor-pointer primary-text">
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
    </div>
  );
}

export default ContactForm;
