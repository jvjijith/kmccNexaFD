import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { brandDefault } from "../../constant";
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from "../../common/api";

// Validation function
const validateBrandData = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Brand name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Brand name must be at least 2 characters long';
  }

  if (!data.category) {
    errors.category = 'Category is required';
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

function BrandForm({ id, closeModal }) {
  const [brandData, setBrandData] = useState(brandDefault);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: addBrand, isPending: isAdding, error: addError } = usePostData("addBrand", "/brands/add");
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');

  useEffect(() => {
    refetchCategories();
  }, [refetchCategories]);

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories || []);
    }
  }, [categoryData]);

  const categoryOptions = categories.map(category => ({
    value: category._id, 
    label: category.categoryName
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrandData((prevState) => ({
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
    setBrandData(prevState => ({ 
      ...prevState, 
      category: selectedOption?.value || '' 
    }));

    // Clear error when user makes selection
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateBrandData(brandData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      await addBrand({
        name: brandData.name.trim(),
        category: brandData.category,
        active: brandData.active
      });

      toast.success('Brand added successfully!');
      setBrandData(brandDefault);
      
      setTimeout(() => {
        closeModal();
      }, 1000);

    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Failed to add brand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-color mb-2">Add New Brand</h2>
        <p className="text-sm text-gray-500">
          Create a new brand by filling in the details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-secondary-card rounded-lg p-4">
          <FormField label="Brand Name" required error={errors.name}>
            <input
              type="text"
              name="name"
              className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
              placeholder="Enter brand name"
              autoComplete="off"
              value={brandData.name || ""}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(option => option.value === brandData.category)}
              onChange={handleSelectChange}
              classNames={customSelectStyles}
              placeholder="Select category"
              isClearable
              isSearchable
            />
          </FormField>

          <FormField label="Status" className="w-full mb-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={brandData.active}
                onChange={(e) => setBrandData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-text-color">
                {brandData.active ? 'Active' : 'Inactive'}
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
            disabled={isSubmitting || isAdding}
            className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isAdding ? 'Adding...' : 'Add Brand'}
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

export default BrandForm;