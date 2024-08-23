import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import Modal from 'react-modal';
import PopUpModal from '../ui/modal/modal';
import BrandForm from './brandForm';
import SubBrandForm from './subBrandForm';

Modal.setAppElement('#root');

function PriceForm({ priceId , productId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [variant, setVariant] = useState(false);
  const [product, setProduct] = useState(false);
  const [priceData, setPriceData] = useState({
    productId: productId?productId:'',
    variantId: '',
    pricing: [{
      amount: '',
      currency: '',
      discount: '',
      rules: [] // Default rule object
    }]
  });

  const mutationHook = priceId ? usePutData : usePostData;
  const api_url = priceId ? `/pricing/update/${priceId}` : '/pricing/add';
  
  const api_url2 = productId ? `/variant/product/${productId}` : '/variant/';
  const api_key = priceId ? 'updatePrice' : 'addPrice';
  const { data: variantData } = useGetData('variant', api_url2);
  const { data: productData } = useGetData('product', '/product');
  const { mutate: saveProduct, isLoading } = mutationHook(api_key, api_url);
  const { data: pricesData, loading } = useGetData('price', `/pricing/${priceId}`);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (pricesData) {
      setPriceData({
        productId: pricesData.productId || '',
        variantId: pricesData.variantId || '',
        pricing: pricesData.pricing || [{
          amount: '',
          currency: '',
          discount: '',
          rules: []
        }]
      });
    }
    if (productId) {
      setPriceData({
        productId: productId ,
        variantId: '',
        pricing: [{
          amount: '',
          currency: '',
          discount: '',
          rules: []
        }]
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

  const handleRuleChange = (pricingIndex, ruleIndex, name, value) => {
    const newPricing = [...priceData.pricing];
    newPricing[pricingIndex].rules[ruleIndex][name] = value;
    setPriceData(prevState => ({ ...prevState, pricing: newPricing }));
  };

  const addRule = (pricingIndex) => {
    const newPricing = [...priceData.pricing];
    newPricing[pricingIndex].rules.push({ ruleType: '', ruleCountry: '' });
    setPriceData(prevState => ({ ...prevState, pricing: newPricing }));
  };

  const removeRule = (pricingIndex, ruleIndex) => {
    const newPricing = [...priceData.pricing];
    newPricing[pricingIndex].rules.splice(ruleIndex, 1);
    setPriceData(prevState => ({ ...prevState, pricing: newPricing }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      productId: productId ? productId : product ? priceData.productId : priceData.productId._id,
      variantId: variant ? priceData.variantId : priceData.variantId._id,
      pricing: priceData.pricing.map(item => ({
        amount: parseFloat(item.amount),
        currency: item.currency,
        discount: parseFloat(item.discount) || 0,
        rules: item.rules
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
    ? variantData.variants.map(variant => ({ value: variant._id, label: variant.name })) : Array.isArray(variantData) ? variantData.map(variant => ({ value: variant._id, label: variant.name }))
    : [];

    console.log(productId);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {!(productId)&&
          <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Product *</label>
              <Select
                options={productOptions}
                value={productOptions.find(option => option.value === (priceId ? product ? priceData.productId : priceData.productId._id : priceData.productId))}
                onChange={(selectedOption) => { handleSelectChange(selectedOption, 'productId'); setProduct(true); }}
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
              <label className="block w-full mb-2 text-white">Variant</label>
              <Select
                options={variantOptions}
                value={variantOptions.find(option => option.value === (priceId ? variant ? priceData.variantId : priceData.variantId._id : priceData.variantId))}
                onChange={(selectedOption) => { handleSelectChange(selectedOption, 'variantId'); setVariant(true); }}
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
        </div>}

        {priceData.pricing.map((price, pricingIndex) => (
          <div key={pricingIndex} className="flex flex-wrap">
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
                  onChange={(e) => handleChange(e, pricingIndex)}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="block w-full mb-2 text-white">Currency *</label>
                <input
                  type="text"
                  name="currency"
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Enter Currency"
                  autoComplete="off"
                  value={price.currency}
                  onChange={(e) => handleChange(e, pricingIndex)}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="block w-full mb-2 text-white">Discount *</label>
                <input
                  type="text"
                  name="discount"
                  className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Enter Discount"
                  autoComplete="off"
                  value={price.discount}
                  onChange={(e) => handleChange(e, pricingIndex)}
                />
              </div>
            </div>

            {productId&&
              <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Variant</label>
              <Select
                options={variantOptions}
                value={variantOptions.find(option => option.value === (priceId ? variant ? priceData.variantId : priceData.variantId._id : priceData.variantId))}
                onChange={(selectedOption) => { handleSelectChange(selectedOption, 'variantId'); setVariant(true); }}
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
          </div>}

            <div className="w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block w-full mb-2 text-white">Rules</label>
              <button
                type="button"
                className="text-white"
                onClick={() => addRule(pricingIndex)}
              >
                Add
              </button>
              </div>
              <div
                  className={`${
                    price.rules.length > 5 ? 'max-h-48 overflow-y-scroll' : ''
                  }`}
                >
              {price.rules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="flex mb-4">
                  {/* <label className="block w-full mb-2 text-white">Rule Type</label> */}
                  <input
                    type="text"
                    name="ruleType"
                    className="block w-3/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                    placeholder="Enter Rule Type"
                    value={rule.ruleType}
                    onChange={(e) => handleRuleChange(pricingIndex, ruleIndex, 'ruleType', e.target.value)}
                  />
                  {/* <label className="block w-full mb-2 text-white">Rule Country</label> */}
                  <input
                    type="text"
                    name="ruleCountry"
                    className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                    placeholder="Enter Rule Country"
                    value={rule.ruleCountry}
                    onChange={(e) => handleRuleChange(pricingIndex, ruleIndex, 'ruleCountry', e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-red-500 ml-2"
                    onClick={() => removeRule(pricingIndex, ruleIndex)}
                  >
                    Remove
                  </button>
                </div>
              ))}
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Brand Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
        <PopUpModal handleCloseModal={closeModal}>
          <BrandForm closeModal={closeModal} />
        </PopUpModal>
      </Modal>

      <Modal
        isOpen={isSubModalOpen}
        onRequestClose={closeSubModal}
        contentLabel="Sub-Brand Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
        <PopUpModal handleCloseModal={closeSubModal}>
          <SubBrandForm closeModal={closeSubModal} />
        </PopUpModal>
      </Modal>
    </div>
  );
}

export default PriceForm;
