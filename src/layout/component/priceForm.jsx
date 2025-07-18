import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import Modal from 'react-modal';
import PopUpModal from '../ui/modal/modal';
import BrandForm from './brandForm';
import SubBrandForm from './subBrandForm';

Modal.setAppElement('#root');

function PriceForm({ priceId, productId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [variant, setVariant] = useState(false);
  const [product, setProduct] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [priceData, setPriceData] = useState({
    productId: productId ? productId : '',
    variantId: '',
    pricing: [{
      amount: '',
      currency: '',
      discount: '',
      rules: []
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

  // Validation rules
  const validateField = (name, value, pricingIndex = null) => {
    const newErrors = { ...errors };
    
    if (pricingIndex !== null) {
      if (!newErrors.pricing) newErrors.pricing = {};
      if (!newErrors.pricing[pricingIndex]) newErrors.pricing[pricingIndex] = {};
    }

    switch (name) {
      case 'productId':
        if (!value || value === '') {
          newErrors.productId = 'Product is required';
        } else {
          delete newErrors.productId;
        }
        break;
      
      case 'amount':
        if (!value || value === '') {
          newErrors.pricing[pricingIndex].amount = 'Amount is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.pricing[pricingIndex].amount = 'Amount must be a positive number';
        } else {
          delete newErrors.pricing[pricingIndex].amount;
        }
        break;
      
      case 'currency':
        if (!value || value === '') {
          newErrors.pricing[pricingIndex].currency = 'Currency is required';
        } else if (value.length !== 3) {
          newErrors.pricing[pricingIndex].currency = 'Currency must be 3 characters (e.g., USD, EUR)';
        } else {
          delete newErrors.pricing[pricingIndex].currency;
        }
        break;
      
      case 'discount':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          newErrors.pricing[pricingIndex].discount = 'Discount must be between 0 and 100';
        } else {
          if (newErrors.pricing[pricingIndex]) {
            delete newErrors.pricing[pricingIndex].discount;
          }
        }
        break;
    }

    // Clean up empty objects
    if (pricingIndex !== null && newErrors.pricing && newErrors.pricing[pricingIndex] && Object.keys(newErrors.pricing[pricingIndex]).length === 0) {
      delete newErrors.pricing[pricingIndex];
    }
    if (newErrors.pricing && Object.keys(newErrors.pricing).length === 0) {
      delete newErrors.pricing;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate entire form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate product selection (only if not passed as prop)
    if (!productId && (!priceData.productId || priceData.productId === '')) {
      newErrors.productId = 'Product is required';
      isValid = false;
    }

    // Validate pricing data
    newErrors.pricing = {};
    priceData.pricing.forEach((price, index) => {
      newErrors.pricing[index] = {};

      // Amount validation
      if (!price.amount || price.amount === '') {
        newErrors.pricing[index].amount = 'Amount is required';
        isValid = false;
      } else if (isNaN(price.amount) || parseFloat(price.amount) <= 0) {
        newErrors.pricing[index].amount = 'Amount must be a positive number';
        isValid = false;
      }

      // Currency validation
      if (!price.currency || price.currency === '') {
        newErrors.pricing[index].currency = 'Currency is required';
        isValid = false;
      } else if (price.currency.length !== 3) {
        newErrors.pricing[index].currency = 'Currency must be 3 characters (e.g., USD, EUR)';
        isValid = false;
      }

      // Discount validation (optional but if provided must be valid)
      if (price.discount && (isNaN(price.discount) || parseFloat(price.discount) < 0 || parseFloat(price.discount) > 100)) {
        newErrors.pricing[index].discount = 'Discount must be between 0 and 100';
        isValid = false;
      }

      // Clean up empty error objects
      if (Object.keys(newErrors.pricing[index]).length === 0) {
        delete newErrors.pricing[index];
      }
    });

    // Clean up empty pricing errors
    if (Object.keys(newErrors.pricing).length === 0) {
      delete newErrors.pricing;
    }

    setErrors(newErrors);
    return isValid;
  };

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
        productId: productId,
        variantId: '',
        pricing: [{
          amount: '',
          currency: '',
          discount: '',
          rules: []
        }]
      });
    }
  }, [pricesData, productId]);

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
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [`pricing.${index}.${name}`]: true
    }));

    // Validate field on change
    validateField(name, value, index);
  };

  const handleSelectChange = (selectedOption, name) => {
    const value = selectedOption ? selectedOption.value : '';
    setPriceData(prevState => ({ ...prevState, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on change
    if (name === 'productId') {
      validateField(name, value);
      setProduct(true);
    } else if (name === 'variantId') {
      setVariant(true);
    }
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
    setIsSubmitting(true);

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      // Show error message
      const errorMessage = document.getElementById('form-error-message');
      if (errorMessage) {
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const payload = {
        productId: productId ? productId : product ? priceData.productId : priceData.productId._id,
        variantId: variant ? priceData.variantId : priceData.variantId._id,
        pricing: priceData.pricing.map(item => ({
          amount: parseFloat(item.amount),
          currency: item.currency.toUpperCase(),
          discount: parseFloat(item.discount) || 0,
          rules: item.rules
        }))
      };
      
      await saveProduct(payload);
    } catch (error) {
      console.error('Error saving price:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (fieldName, pricingIndex = null) => {
    setTouched(prev => ({
      ...prev,
      [pricingIndex !== null ? `pricing.${pricingIndex}.${fieldName}` : fieldName]: true
    }));
  };

  const getFieldError = (fieldName, pricingIndex = null) => {
    if (pricingIndex !== null) {
      return errors.pricing && errors.pricing[pricingIndex] && errors.pricing[pricingIndex][fieldName];
    }
    return errors[fieldName];
  };

  const isFieldTouched = (fieldName, pricingIndex = null) => {
    if (pricingIndex !== null) {
      return touched[`pricing.${pricingIndex}.${fieldName}`];
    }
    return touched[fieldName];
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  const productOptions = Array.isArray(productData?.products)
    ? productData.products.map(product => ({ value: product._id, label: product.name }))
    : [];

  const variantOptions = Array.isArray(variantData?.variants)
    ? variantData.variants.map(variant => ({ value: variant._id, label: variant.name })) 
    : Array.isArray(variantData) 
    ? variantData.map(variant => ({ value: variant._id, label: variant.name }))
    : [];

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        {/* Error Summary */}
        {hasErrors && (
          <div id="form-error-message" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.productId && <li>• {errors.productId}</li>}
              {errors.pricing && Object.entries(errors.pricing).map(([index, priceErrors]) => (
                Object.entries(priceErrors).map(([field, error]) => (
                  <li key={`${index}-${field}`}>• Pricing {parseInt(index) + 1}: {error}</li>
                ))
              ))}
            </ul>
          </div>
        )}

        {/* Product Selection (only show if productId is not provided) */}
        {!productId && (
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="block w-full mb-2 text-text-color primary-text">
                  Product <span className="text-red-500">*</span>
                </label>
                <Select
                  options={productOptions}
                  value={productOptions.find(option => option.value === (priceId ? product ? priceData.productId : priceData.productId._id : priceData.productId))}
                  onChange={(selectedOption) => handleSelectChange(selectedOption, 'productId')}
                  onBlur={() => handleBlur('productId')}
                  placeholder="Select a product..."
                  isClearable
                  classNames={{
                    control: ({ isFocused }) =>
                      `bg-primary border ${
                        getFieldError('productId') && isFieldTouched('productId') 
                          ? 'border-red-500' 
                          : isFocused 
                          ? 'border-secondary' 
                          : 'border-focus-color'
                      } border-b-2 rounded-none h-10 px-2 text-text-color`,
                    singleValue: () => `text-focus-color`,
                    placeholder: () => `text-focus-color`,
                    menu: () => `bg-primary text-focus-color`,
                    option: ({ isSelected }) =>
                      `cursor-pointer ${
                        isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                      }`,
                  }}
                />
                {getFieldError('productId') && isFieldTouched('productId') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('productId')}</p>
                )}
              </div>
            </div>
            <div className="w-full sm:w-1/2 p-4">
              <div className="mb-4">
                <label className="block w-full mb-2 text-text-color primary-text">Variant</label>
                <Select
                  options={variantOptions}
                  value={variantOptions.find(option => option.value === (priceId ? variant ? priceData.variantId : priceData.variantId._id : priceData.variantId))}
                  onChange={(selectedOption) => handleSelectChange(selectedOption, 'variantId')}
                  placeholder="Select a variant (optional)..."
                  isClearable
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Pricing Information */}
        {priceData.pricing.map((price, pricingIndex) => (
          <div key={pricingIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-text-color mb-4">
              Pricing Information {priceData.pricing.length > 1 ? `#${pricingIndex + 1}` : ''}
            </h3>
            
            <div className="flex flex-wrap">
              {/* Amount Field */}
              <div className="w-full sm:w-1/2 p-4">
                <div className="mb-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    className={`block w-full h-10 px-2 py-1 border-b ${
                      getFieldError('amount', pricingIndex) && isFieldTouched('amount', pricingIndex)
                        ? 'border-red-500'
                        : 'border-border'
                    } secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color`}
                    placeholder="Enter amount (e.g., 99.99)"
                    autoComplete="off"
                    value={price.amount}
                    onChange={(e) => handleChange(e, pricingIndex)}
                    onBlur={() => handleBlur('amount', pricingIndex)}
                  />
                  {getFieldError('amount', pricingIndex) && isFieldTouched('amount', pricingIndex) && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('amount', pricingIndex)}</p>
                  )}
                </div>
              </div>

              {/* Currency Field */}
              <div className="w-full sm:w-1/2 p-4">
                <div className="mb-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="currency"
                    maxLength="3"
                    className={`block w-full h-10 px-2 py-1 border-b ${
                      getFieldError('currency', pricingIndex) && isFieldTouched('currency', pricingIndex)
                        ? 'border-red-500'
                        : 'border-border'
                    } secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color uppercase`}
                    placeholder="Enter currency (e.g., USD, EUR)"
                    autoComplete="off"
                    value={price.currency}
                    onChange={(e) => handleChange(e, pricingIndex)}
                    onBlur={() => handleBlur('currency', pricingIndex)}
                  />
                  {getFieldError('currency', pricingIndex) && isFieldTouched('currency', pricingIndex) && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('currency', pricingIndex)}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">3-letter currency code (USD, EUR, GBP, etc.)</p>
                </div>
              </div>

              {/* Discount Field */}
              <div className="w-full sm:w-1/2 p-4">
                <div className="mb-4">
                  <label className="block w-full mb-2 text-text-color primary-text">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    step="0.01"
                    min="0"
                    max="100"
                    className={`block w-full h-10 px-2 py-1 border-b ${
                      getFieldError('discount', pricingIndex) && isFieldTouched('discount', pricingIndex)
                        ? 'border-red-500'
                        : 'border-border'
                    } secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color`}
                    placeholder="Enter discount percentage (optional)"
                    autoComplete="off"
                    value={price.discount}
                    onChange={(e) => handleChange(e, pricingIndex)}
                    onBlur={() => handleBlur('discount', pricingIndex)}
                  />
                  {getFieldError('discount', pricingIndex) && isFieldTouched('discount', pricingIndex) && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('discount', pricingIndex)}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Optional: Enter percentage between 0-100</p>
                </div>
              </div>

              {/* Variant Selection (only show if productId is provided) */}
              {productId && (
                <div className="w-full sm:w-1/2 p-4">
                  <div className="mb-4">
                    <label className="block w-full mb-2 text-text-color primary-text">Variant</label>
                    <Select
                      options={variantOptions}
                      value={variantOptions.find(option => option.value === (priceId ? variant ? priceData.variantId : priceData.variantId._id : priceData.variantId))}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'variantId')}
                      placeholder="Select a variant (optional)..."
                      isClearable
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
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rules Section */}
            <div className="w-full p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block w-full mb-2 text-text-color primary-text">Rules (Optional)</label>
                <button
                  type="button"
                  className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded ml-2 hover:opacity-80 transition-opacity"
                  onClick={() => addRule(pricingIndex)}
                >
                  Add Rule
                </button>
              </div>
              <div className={`${price.rules.length > 5 ? 'max-h-48 overflow-y-scroll' : ''}`}>
                {price.rules.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No rules added yet. Click "Add Rule" to create pricing rules.</p>
                )}
                {price.rules.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="flex mb-4 items-center">
                    <input
                      type="text"
                      name="ruleType"
                      className="block w-3/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                      placeholder="Enter rule type (e.g., bulk, seasonal)"
                      value={rule.ruleType}
                      onChange={(e) => handleRuleChange(pricingIndex, ruleIndex, 'ruleType', e.target.value)}
                    />
                    <input
                      type="text"
                      name="ruleCountry"
                      className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                      placeholder="Enter country code (e.g., US, UK)"
                      value={rule.ruleCountry}
                      onChange={(e) => handleRuleChange(pricingIndex, ruleIndex, 'ruleCountry', e.target.value)}
                    />
                    <button
                      type="button"
                      className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600 transition-colors"
                      onClick={() => removeRule(pricingIndex, ruleIndex)}
                      title="Remove this rule"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex flex-wrap justify-end p-4">
          <button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className={`px-6 py-2 rounded transition-all ${
              isSubmitting || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-button-color hover:opacity-80'
            } text-btn-text-color`}
          >
            {isSubmitting || isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Price'
            )}
          </button>
        </div>
      </form>

      {/* Modals */}
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