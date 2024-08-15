import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import Modal from 'react-modal';
import PopUpModal from '../ui/modal/modal';
import BrandForm from './brandForm';
import SubBrandForm from './subBrandForm';

Modal.setAppElement('#root');

function PriceForm({ priceId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [priceData, setPriceData] = useState({
    productId: '',
    variantId: '',
    pricing: [{
      amount: '',
      currency: '',
      discount: ''
    }]
  });

  const mutationHook = priceId ? usePutData : usePostData;
  const api_url = priceId ? `/pricing/update/${priceId}` : '/pricing/add';
  const api_key = priceId ? 'updatePrice' : 'addPrice';
  const { data: variantData } = useGetData('variant', '/variant/');
  const { data: productData } = useGetData('product', '/product');
  const { mutate: saveProduct, isLoading } = mutationHook(api_key, api_url);
  const { data: pricesData, loading } = useGetData('price', `/pricing/${priceId}`);

  useEffect(() => {
    if (pricesData) {
      setPriceData({
        productId: pricesData.productId || '',
        variantId: pricesData.variantId || '',
        pricing: pricesData.pricing || [{ amount: '', currency: '', discount: '' }]
      });
    }
  }, [pricesData]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeSubModal = () => {
    setSubModalOpen(false);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const newPricing = [...priceData.pricing];
    newPricing[index][name] = value;
    setPriceData(prevState => ({ ...prevState, pricing: newPricing }));
  };

  const handleSelectChange = (selectedOption, name) => {
    setPriceData(prevState => ({ ...prevState, [name]: selectedOption.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      productId: priceData.productId,
      variantId: priceData.variantId,
      pricing: priceData.pricing.map(item => ({
        amount: parseFloat(item.amount),
        currency: item.currency,
        discount: parseFloat(item.discount) || 0,
        rules:[]
      }))
    };
    saveProduct(payload);
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  const productOptions = Array.isArray(productData?.products) 
    ? productData.products.map(product => ({ value: product._id, label: product.name }))
    : [];

  const variantOptions = Array.isArray(variantData?.variants) 
    ? variantData.variants.map(variant => ({ value: variant._id, label: variant.color }))
    : [];
  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Product *</label>
              <Select
                options={productOptions}
                value={productOptions.find(option => option.value === priceData.productId)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'productId')}
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
                    backgroundColor: state.isSelected ? '#007bff' : 'black',
                    color: state.isSelected ? 'black' : 'white',
                    cursor: 'pointer'
                  })
                }}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Variant </label>
              <Select
                options={variantOptions}
                value={variantOptions.find(option => option.value === priceData.variantId)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'variantId')}
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
                    backgroundColor: state.isSelected ? '#007bff' : 'black',
                    color: state.isSelected ? 'black' : 'white',
                    cursor: 'pointer'
                  })
                }}
              />
            </div>
          </div>
        </div>

        {priceData.pricing.map((price, index) => (
          <div key={index} className="flex flex-wrap">
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="block w-full mb-2 text-white">Amount *</label>
                <input
                  type="text"
                  name="amount"
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Enter Amount"
                  autoComplete="off"
                  value={price.amount}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="float-left inline-block mb-2 text-white">Currency *</label>
                <input
                  type="text"
                  name="currency"
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Enter Currency"
                  autoComplete="off"
                  value={price.currency}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="float-left inline-block mb-2 text-white">Discount</label>
                <input
                  type="text"
                  name="discount"
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Enter Discount"
                  autoComplete="off"
                  value={price.discount}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Add Brand"}>
        <BrandForm closeModal={closeModal} />
      </PopUpModal>
      <PopUpModal isOpen={isSubModalOpen} onClose={closeSubModal} title={"Add SubBrand"}>
        <SubBrandForm closeSubModal={closeSubModal} />
      </PopUpModal>
    </div>
  );
}

export default PriceForm;
