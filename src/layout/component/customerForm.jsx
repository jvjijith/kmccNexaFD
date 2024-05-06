import React,{useState} from 'react';
import CategoryForm from './categoryForm';
import PopUpModal from '../ui/modal/modal';
import { usePostData,usePutData } from '../../common/api';
import { customerDefault } from '../../constant';


function CustomerForm({typeData}) {


  const [isModalOpen, setModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState(customerDefault);
  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData==='update' ? '/customer/update': '/customer/add';
  const api_key =  typeData==='update' ? 'updateCustomer': 'addCustomer';
  const { mutate: saveCustomer, isLoading, isError } = mutationHook(api_key, api_url);


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

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCustomer(customerData); // Call the addCustomer mutation
    // Reset form fields after submission if needed
    setCustomerData(customerDefault);
  };


    return (
      <div>
       <form>
         <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Customer Name *&nbsp;</label>
            <input
              type="text"
              name="name"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Your Customer Name"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.name} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Email Address *&nbsp;</label>
            <input
              type="email"
              name="email"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Customer Email"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.email} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Address *&nbsp;</label>
            <textarea
              
              name="address"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Customer Address ..."
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.address} onChange={handleChange}
            ></textarea>
            <div className="correct"></div>
          </div>
        </div>
      
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Website *&nbsp;</label>
            <input
              type="text"
              name="website"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Customer Website"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.website} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;State *&nbsp;</label>
            <input
              type="text"
              name="state"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Your State"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.state} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Category *&nbsp;</label>
            <select
              name="category"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              style={{ textAlign: 'initial' }}
              value={customerData.category} onChange={handleChange}
            >
                <option value={"Live Streaming"}>Live Streaming</option>
                <option value={"Broadcast Media"}>Broadcast Media</option>
                <option value={"Healthcare"}>Healthcare</option>
            </select>

            <div className="float-right"><a href="#" onClick={openModal}>Add New Category</a></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;City *&nbsp;</label>
            <input
              type="text"
              name="location"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Your Location"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.location} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;Country *&nbsp;</label>
            <input
              type="text"
              name="country"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Country"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.country} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;PAN Number *&nbsp;</label>
            <input
              type="text"
              name="pan"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter Your PAN Number"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.pan} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      
        <div className="w-full sm:w-1/2 p-4"> {/* col-sm-6 */}
          <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">&nbsp;GST Number *&nbsp;</label>
            <input
              type="text"
              name="gst"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder="Enter GST Number"
              autoComplete="off"
              style={{ textAlign: 'initial' }}
              value={customerData.gst} onChange={handleChange}
            />
            <div className="correct"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end p-4">
  <button className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded">Add Customer</button>
</div>
       </form>

       <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Add Category"}>
        {/* Modal Content */}

        <CategoryForm></CategoryForm>
      </PopUpModal>
       </div>
    );
}

export default CustomerForm;