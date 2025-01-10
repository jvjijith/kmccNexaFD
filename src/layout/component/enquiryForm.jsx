import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

function EnquiryForm({ quotes }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const mutationHook = quotes ? usePutData : usePostData;
  const api_url = quotes ? `/enquiry/${quotes._id}` : '/enquiry';
  const api_key = quotes ? 'updateEnquiry' : 'addEnquiry';
  const { mutate: saveEnquiry, isLoading } = mutationHook(api_key, api_url);
  const { data: employeeData, isLoading: isEmployeeLoading } = useGetData('employee', '/employee', {});
  const { data: customerData, isLoading: isCustomerLoading } = useGetData('customer', '/customer', {});
  const { data: vendorData, isLoading: isVendorLoading } = useGetData('vendor', '/vendor', {});
  const { data: productData, isLoading: isProductLoading } = useGetData('product', '/product', {});
  const { data: variantData, isLoading: isVariantLoading } = useGetData('Variant', '/Variant', {});


  const [formData, setFormData] = useState({
    enquiryMode: '',
    enquiryModeDetails: '',
    enquiryNotes: '',
    products: [
      { productId: '', VariantId: '', quantity: 1 },
    ],
    customerNotes: '',
    customer: ''
  });

  const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v' ]) => {
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

  const enquiryModeOptions = [
    { value: 'Website', label: 'Website' },
    // { value: 'Store', label: 'Store' },
    { value: 'Salesman', label: 'Salesman' },
    { value: 'Existing Customer', label: 'Existing Customer' },
  ];

  const enquiryModeDetailsOptions = [
    { value: 'text', label: 'Text' },
    { value: 'productList', label: 'Product List' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { 
    if (quotes) {
    // Remove unwanted fields
    const cleanedContainer = removeUnwantedFields(quotes);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    // Transform items to only include itemType and itemId
    const transformedProducts = quotes.products?.map(item => ({
      productId: item.productId?._id,
      VariantId: item.VariantId?._id,
      quantity: item.quantity,
    }));

    // Transform availability to only include appId as a string
    // const transformedAppId = elementsDatas.availability?.map(avail => ({
    //     appId: avail.appId?._id,
    // }));

    // const appId = layoutDatas?.appId?._id;

    // Set the transformed data
    
    setFormData({
      enquiryMode: quotes?.enquiryMode,
      enquiryModeDetails: quotes?.enquiryModeDetails,
      enquiryNotes: quotes?.enquiryNotes,
      products: transformedProducts,
      customerNotes: quotes?.customerNotes ,
      customer: quotes?.customer?._id
    });
}
  }, [quotes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    console.log(selectedOption);
    setFormData((prevData) => ({
      ...prevData,
      [field]: selectedOption.value,
    }));
  };

  const storeOrderOptions =
    vendorData?.customers
      ?.filter((customer) => customer.storeUser)
      .map((customer) => ({
        value: customer._id,
        label: `${customer.name} (${customer.email})`,
      })) || [];

      // Generate product options
  const productOptions = productData?.products?.map((product) => ({
    value: product._id,
    label: product.name || product._id,
  }));

  // Generate filtered variant options
  const getVariantOptions = (productId) =>
    variantData?.variants?.filter((variant) => variant?.productId === productId)
      .map((variant) => ({
        value: variant._id,
        label: variant.name || variant._id,
      })) || [];

      const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index][field] = value;
    
        // Reset VariantId if productId changes
        if (field === 'productId') {
          updatedProducts[index]['VariantId'] = '';
        }
    
        setFormData((prevData) => ({
          ...prevData,
          products: updatedProducts,
        }));
      };
    
      const addProduct = () => {
        setFormData((prevData) => ({
          ...prevData,
          products: [...prevData.products, { productId: '', VariantId: '', quantity: 1 }],
        }));
      };
    
      const removeProduct = (index) => {
        const updatedProducts = formData.products.filter((_, i) => i !== index);
        setFormData((prevData) => ({
          ...prevData,
          products: updatedProducts,
        }));
      };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEnquiry(formData, {
      onSuccess: (response) => {
        toast.success('Enquiry saved successfully!');
        navigate(`/enquiry`);
      },
      onError: (error) => {
        toast.error('Failed to save Enquiry.');
        console.error(error);
        navigate(`/enquiry`);
      },
    });
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }
console.log(formData);
  return (
    <div>
      <form onSubmit={handleSubmit}>

      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
      {/* Enquiry Mode as a Dropdown */}
      <div className="mb-4">
          <label  className="block mb-2 text-text-color">Enquiry Mode</label>
          <Select
            options={enquiryModeOptions}
            value={{
              value: formData.enquiryMode,
              label: formData.enquiryMode,
            }}
            onChange={handleSelectChange('enquiryMode')}
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
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              }),
            }}
          />
        </div>
        </div>
       

        {formData.enquiryMode === 'Salesman' && (
          <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
          <label className="block mb-2 text-text-color">Select Salesman</label>
          <Select
            options={
              employeeData?.employees?.map((employee) => ({
                value: employee._id,
                label: employee.name,
              })) || []
            }
            value={
              formData.salesman
                ? {
                    value: formData.salesman,
                    label:
                      employeeData?.employees?.find((e) => e._id === formData.salesman)?.name || 'Select Salesman',
                  }
                : null
            }
            onChange={(selectedOption) =>
              setFormData((prevData) => ({
                ...prevData,
                salesman: selectedOption.value,
              }))
            }
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : 'black', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
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
                backgroundColor: state.isSelected ? 'black' : '#f8f9fa', // bg-blue-500: #007bff
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              }),
            }}
            placeholder="Select Salesman"
            isLoading={isEmployeeLoading}
            isClearable
          />
        </div>
        </div>
        
        )}

        {formData.enquiryMode === 'Existing Customer' && (
          <div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color">Select Existing Customer</label>
          <Select
            options={customerData?.customers.map((customer) => ({
              value: customer._id,
              label: customer.name,
            }))}
            value={
              formData.existingCustomerId
                ? customerData?.customers
                    .map((customer) => ({
                      value: customer._id,
                      label: customer.name,
                    }))
                    .find((customer) => customer.value === formData.existingCustomerId)
                : null
            }
            onChange={(selectedOption) =>
              setFormData((prevData) => ({
                ...prevData,
                existingCustomerId: selectedOption?.value || "",
              }))
            }
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: "black",
                borderColor: state.isFocused ? "white" : "#D3D3D3",
                borderBottomWidth: "2px",
                borderRadius: "0px",
                height: "40px",
                paddingLeft: "8px",
                paddingRight: "8px",
                color: "white",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "white",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "white",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "black",
                color: "white",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? "#007bff" : "black",
                color: state.isSelected ? "black" : "white",
                cursor: "pointer",
              }),
            }}
          />
        </div>
        
        )}

        {formData.enquiryMode === 'Store' && (
          <div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color">Select Store Order</label>
          <Select
            options={storeOrderOptions}
            value={
              storeOrderOptions.find((option) => option.value === formData.storeOrderId) || null
            }
            onChange={handleSelectChange('storeOrderId')}
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
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              }),
            }}
            placeholder="Select a store order"
          />
        </div>
        )}

        <div>
        </div>
        <div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color">Enquiry Mode Details</label>
          <Select
            options={enquiryModeDetailsOptions}
            value={enquiryModeDetailsOptions.find(
              (option) => option.value === formData.enquiryModeDetails
            )}
            onChange={handleSelectChange('enquiryModeDetails')}
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
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              }),
            }}
          />
        </div>

        <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="float-left inline-block mb-2 text-text-color">Enquiry Notes </label>
    <textarea
      name="enquiryNotes"
      className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
      placeholder="Enter additional notes about the enquiry"
      autoComplete="off"
      value={formData.enquiryNotes}
      onChange={handleChange}
    />
  </div>
</div>

<div className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color">Customer *</label>
          <Select
            options={customerData?.customers.map((customer) => ({
              value: customer._id,
              label: customer.name,
            }))}
            value={
              formData.customer
                ? customerData?.customers
                    .map((customer) => ({
                      value: customer._id,
                      label: customer.name,
                    }))
                    .find((customer) => customer.value === formData.customer)
                : null
            }
            onChange={(selectedOption) =>
              setFormData((prevData) => ({
                ...prevData,
                customer: selectedOption?.value || "",
              }))
            }
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: "black",
                borderColor: state.isFocused ? "white" : "#D3D3D3",
                borderBottomWidth: "2px",
                borderRadius: "0px",
                height: "40px",
                paddingLeft: "8px",
                paddingRight: "8px",
                color: "white",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "white",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "white",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "black",
                color: "white",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? "#007bff" : "black",
                color: state.isSelected ? "black" : "white",
                cursor: "pointer",
              }),
            }}
          />
        </div>

        <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="float-left inline-block mb-2 text-text-color">Customer Notes</label>
    <textarea
      name="customerNotes"
      className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
      placeholder="Enter additional notes about the enquiry"
      autoComplete="off"
      value={formData.customerNotes}
      onChange={handleChange}
    />
  </div>
</div>

 {/* Products */}
       {formData.enquiryModeDetails === 'productList' && <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color">Products</label>
            <button
              type="button"
              className="bg-secondary-card text-text-color px-4 py-2 rounded"
              onClick={addProduct}
            >
              Add
            </button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {formData.products.length === 0 && <p className='text-text-color'>No Products Added</p>}
            {formData?.products?.map((product, index) => (
              <div key={index} className="flex mb-2 items-center">
                {/* Product Dropdown */}
                <Select
                  options={productOptions}
                  placeholder="Select Product"
                  value={productOptions.find((opt) => opt.value === product.productId)}
                  onChange={(selected) =>
                    handleProductChange(index, 'productId', selected.value)
                  }
                  className="w-1/4"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: "black",
                      borderColor: state.isFocused ? "white" : "#D3D3D3",
                      borderBottomWidth: "2px",
                      borderRadius: "0px",
                      height: "40px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      color: "white",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "black",
                      color: "white",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? "#007bff" : "black",
                      color: state.isSelected ? "black" : "white",
                      cursor: "pointer",
                    }),
                  }}
                />

                {/* Variant Dropdown */}
                <Select
                  options={getVariantOptions(product.productId)}
                  placeholder="Select Variant"
                  value={getVariantOptions(product.productId).find(
                    (opt) => opt.value === product.VariantId
                  )}
                  onChange={(selected) =>
                    handleProductChange(index, 'VariantId', selected.value)
                  }
                  className="w-1/4 ml-2"
                  isDisabled={!product.productId}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: "black",
                      borderColor: state.isFocused ? "white" : "#D3D3D3",
                      borderBottomWidth: "2px",
                      borderRadius: "0px",
                      height: "40px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      color: "white",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "black",
                      color: "white",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? "#007bff" : "black",
                      color: state.isSelected ? "black" : "white",
                      cursor: "pointer",
                    }),
                  }}
                />

                {/* Quantity Input */}
                <input
                  type="number"
                  name={`quantity-${index}`}
                  className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                  placeholder="Quantity"
                  min="1"
                  value={product.quantity}
                  onChange={(e) =>
                    handleProductChange(index, 'quantity', parseInt(e.target.value))
                  }
                />

                {/* Remove Button */}
                <button
                  type="button"
                  className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
                  onClick={() => removeProduct(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
}

        </div>


        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-text-color px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          {/* {isError && <p className="text-red-500 mt-2">Error occurred while saving the customer.</p>}
          {signupError && <p className="text-red-500 mt-2">Error occurred while signing up the individual customer.</p>} */}
        </div>
      </form>
    </div>
  );
}

export default EnquiryForm;
