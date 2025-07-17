import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { subBrandDefault } from "../../constant";
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from "../../common/api";

// Validation function
const validateSubBrandData = (data) => {
  const errors = {};

  if (!data.subBrandName?.trim()) {
    errors.subBrandName = 'Sub-brand name is required';
  } else if (data.subBrandName.trim().length < 2) {
    errors.subBrandName = 'Sub-brand name must be at least 2 characters long';
  }

  if (!data.brandId) {
    errors.brandId = 'Parent brand is required';
  }

  return errors;
};

// Error display component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

// Form field wrapper component
const FormField = ({ label, required = false, error, children, className = "w-full mb-4" }) => (
  <div className={className}>
    <label className="block w-full mb-2 text-text-color primary-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    <ErrorMessage error={error} />
  </div>
);

// Custom Select styles
const customSelectStyles = {
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
};

function SubBrandForm({ id, closeModal }) {
  const [subBrandData, setSubBrandData] = useState(subBrandDefault);
  const [brands, setBrands] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: addSubBrand, isPending: isAdding, error: addError } = usePostData("addSubBrand", "/subbrands/add");
  const { data: brandData, refetch: refetchBrand } = useGetData('brand', '/brands');

  useEffect(() => {
    refetchBrand();
  }, [refetchBrand]);

  useEffect(() => {
    if (brandData) {
      setBrands(brandData.brands || []);
    }
  }, [brandData]);

  const brandOptions = brands.map(brand => ({
    value: brand._id,
    label: brand.name
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubBrandData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (selectedOption) => {
    setSubBrandData(prevState => ({ 
      ...prevState, 
      brandId: selectedOption?.value || '' 
    }));

    // Clear error when user makes selection
    if (errors.brandId) {
      setErrors(prev => ({
        ...prev,
        brandId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateSubBrandData(subBrandData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      await addSubBrand({
        subBrandName: subBrandData.subBrandName.trim(),
        brandId: subBrandData.brandId,
        active: subBrandData.active
      });

      toast.success('Sub-brand added successfully!');
      setSubBrandData(subBrandDefault);
      
      setTimeout(() => {
        closeModal();
      }, 1000);

    } catch (error) {
      console.error('Error adding sub-brand:', error);
      toast.error('Failed to add sub-brand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-color mb-2">Add New Sub-Brand</h2>
        <p className="text-sm text-gray-500">
          Create a new sub-brand under an existing brand.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-secondary-card rounded-lg p-4">
          <FormField label="Sub-Brand Name" required error={errors.subBrandName}>
            <input
              type="text"
              name="subBrandName"
              className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
              placeholder="Enter sub-brand name"
              autoComplete="off"
              value={subBrandData.subBrandName || ""}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Parent Brand" required error={errors.brandId}>
            <Select
              options={brandOptions}
              value={brandOptions.find(option => option.value === subBrandData.brandId)}
              onChange={handleSelectChange}
              classNames={customSelectStyles}
              placeholder="Select parent brand"
              isClearable
              isSearchable
              noOptionsMessage={() => "No brands available. Please add a brand first."}
            />
          </FormField>

          {brands.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    No brands available. You need to create a brand first before adding a sub-brand.
                  </p>
                </div>
              </div>
            </div>
          )}

          <FormField label="Status" className="w-full mb-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={subBrandData.active}
                onChange={(e) => setSubBrandData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-text-color">
                {subBrandData.active ? 'Active' : 'Inactive'}
              </span>
            </label>
          </FormField>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || isAdding || brands.length === 0}
            className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isAdding ? 'Adding...' : 'Add Sub-Brand'}
          </button>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default SubBrandForm;