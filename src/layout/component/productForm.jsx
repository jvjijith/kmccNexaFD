import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import { productDefault } from '../../constant';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import Modal from 'react-modal';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import BrandForm from './brandForm';
import PopUpModal from '../ui/modal/modal';
import SubBrandForm from './subBrandForm';
import { useNavigate } from 'react-router';

Modal.setAppElement('#root');

// Enhanced validation function
const validateProductData = (data, notes = []) => {
  const errors = {};

  // Required field validations
  if (!data.name?.trim()) {
    errors.name = 'Product name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters long';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Product name must be less than 100 characters';
  }

  if (!data.description?.trim()) {
    errors.description = 'Product description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Product description must be at least 10 characters long';
  } else if (data.description.trim().length > 1000) {
    errors.description = 'Product description must be less than 1000 characters';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.brand) {
    errors.brand = 'Brand is required';
  }

  if (!data.stock && data.stock !== 0) {
    errors.stock = 'Stock is required';
  } else if (data.stock < 0) {
    errors.stock = 'Stock cannot be negative';
  } else if (!Number.isInteger(Number(data.stock))) {
    errors.stock = 'Stock must be a whole number';
  } else if (data.stock > 999999) {
    errors.stock = 'Stock cannot exceed 999,999';
  }

  if (!data.HSN?.trim()) {
    errors.HSN = 'HSN code is required';
  } else if (data.HSN.trim().length < 4) {
    errors.HSN = 'HSN code must be at least 4 characters long';
  } else if (data.HSN.trim().length > 10) {
    errors.HSN = 'HSN code must be less than 10 characters';
  } else if (!/^[0-9]+$/.test(data.HSN.trim())) {
    errors.HSN = 'HSN code must contain only numbers';
  }

  if (!data.model?.trim()) {
    errors.model = 'Model is required';
  } else if (data.model.trim().length < 1) {
    errors.model = 'Model cannot be empty';
  } else if (data.model.trim().length > 50) {
    errors.model = 'Model must be less than 50 characters';
  }

  if (!data.productCode?.trim()) {
    errors.productCode = 'Product code is required';
  } else if (data.productCode.trim().length < 2) {
    errors.productCode = 'Product code must be at least 2 characters long';
  } else if (data.productCode.trim().length > 20) {
    errors.productCode = 'Product code must be less than 20 characters';
  } else if (!/^[A-Za-z0-9-_]+$/.test(data.productCode.trim())) {
    errors.productCode = 'Product code can only contain letters, numbers, hyphens, and underscores';
  }

  // Validate notes
  if (notes && notes.length > 0) {
    notes.forEach((note, index) => {
      if (note.name && !note.name.trim()) {
        errors[`notes_${index}_name`] = 'Note name cannot be empty';
      } else if (note.name && note.name.trim().length > 100) {
        errors[`notes_${index}_name`] = 'Note name must be less than 100 characters';
      }
      
      if (note.description && !note.description.trim()) {
        errors[`notes_${index}_description`] = 'Note description cannot be empty';
      } else if (note.description && note.description.trim().length > 500) {
        errors[`notes_${index}_description`] = 'Note description must be less than 500 characters';
      }

      // If note has name but no description, or vice versa
      if ((note.name?.trim() && !note.description?.trim()) || (!note.name?.trim() && note.description?.trim())) {
        if (!note.name?.trim()) {
          errors[`notes_${index}_name`] = 'Note name is required when description is provided';
        }
        if (!note.description?.trim()) {
          errors[`notes_${index}_description`] = 'Note description is required when name is provided';
        }
      }
    });
  }

  return errors;
};

// Error display component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

// Form field wrapper component
const FormField = ({ label, required = false, error, children, className = "w-full sm:w-1/2 p-4" }) => (
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
  control: ({ isFocused, isDisabled }) =>
    `bg-primary border ${
      isFocused ? 'border-secondary' : 'border-focus-color'
    } border-b-2 rounded-none h-10 px-2 text-text-color ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
    }`,
  singleValue: () => `text-focus-color`,
  placeholder: () => `text-focus-color`,
  menu: () => `bg-primary text-focus-color`,
  option: ({ isSelected }) =>
    `cursor-pointer ${
      isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
    }`,
};

function ProductForm({ typeData, product }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [productData, setProductData] = useState(productDefault);
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isRFQ, setRFQ] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subBrands, setSubBrands] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mediaId, setMediaId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? `/product/update/${product?._id}` : '/product/add';
  const api_key = typeData === 'update' ? 'updateProduct' : 'addProduct';
  
  const { data: brandData, refetch: refetchBrand } = useGetData('brand', '/brands');
  const { data: subBrandData, refetch: refetchSubBrand } = useGetData('subBrand', '/subbrands');
  const { mutate: saveProduct, isLoading } = mutationHook(api_key, api_url);
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');
  const { data: subCategoryData, refetch: refetchSubCategories } = useGetData('subCategories', '/subcategories');
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (typeData === 'update' && product) {
      const cleanedUploadedImages = product?.images?.map((item) => {
        const { _id, ...rest } = item;
        return rest;
      }) || [];
      
      setProductData({
        ...productData,
        name: product.name || '',
        description: product.description || '',
        HSN: product.HSN || '',
        model: product.model || '',
        productCode: product.productCode || '',
        stock: product.stock || 0,
        subCategory: product.subCategory || '',
        category: product.category?._id || '',
        brand: product.brand?._id || '',
        subBrand: product.subBrand?._id || '',
        images: product.images || []
      });
      setImages([]);
      setNotes(product.notes || []);
      setRFQ(product.RFQ || false);
      setUploadedImages(cleanedUploadedImages);
    }
  }, [typeData, product]);

  useEffect(() => {
    refetchCategories();
    refetchSubCategories();
    refetchBrand();
    refetchSubBrand();
  }, [refetchCategories, refetchBrand, refetchSubBrand, refetchSubCategories]);

  useEffect(() => {
    if (categoryData) setCategories(categoryData.categories || []);
    if (subCategoryData) setSubCategories(subCategoryData.subCategories || []);
    if (brandData) setBrands(brandData.brands || []);
    if (subBrandData) setSubBrands(subBrandData.subBrands || []);
  }, [categoryData, brandData, subBrandData, subCategoryData]);

  // Options for selects
  const categoryOptions = categories.map(category => ({
    value: category._id, 
    label: category.categoryName
  }));

  const subCategoryOptions = subCategories.map(subcategory => ({
    value: subcategory._id, 
    label: subcategory.subCategoryName
  }));

  const brandOptions = brands.map(brand => ({
    value: brand._id, 
    label: brand.name
  }));

  const subBrandOptions = subBrands
    .filter(subBrand => subBrand.brandId?._id === productData.brand)
    .map(subBrand => ({
      value: subBrand._id,
      label: subBrand.subBrandName
    }));

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    refetchBrand();
  };
  
  const openSubModal = () => setSubModalOpen(true);
  const closeSubModal = () => {
    setSubModalOpen(false);
    refetchSubBrand();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    setProductData(prevState => ({
      ...prevState,
      [field]: selectedOption?.value || ''
    }));
    
    // Clear related fields when brand changes
    if (field === 'brand') {
      setProductData(prevState => ({
        ...prevState,
        brand: selectedOption?.value || '',
        subBrand: '' // Clear sub-brand when brand changes
      }));
    }
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNotesChange = (index, field, value) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
    
    // Clear note-specific errors
    const errorKey = `notes_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const addNotes = () => setNotes([...notes, { name: '', description: '' }]);

  const removeNotes = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`notes_${index}_name`];
    delete newErrors[`notes_${index}_description`];
    setErrors(newErrors);
  };

  const handleToggle = (field) => {
    if (field === 'RFQ') setRFQ(!isRFQ);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(file => {
          file.errors.forEach(error => {
            if (error.code === 'file-too-large') {
              toast.error(`File ${file.file.name} is too large. Maximum size is 5MB.`);
            } else if (error.code === 'file-invalid-type') {
              toast.error(`File ${file.file.name} is not a valid image type.`);
            }
          });
        });
      }
      
      if (acceptedFiles.length > 0) {
        setImages([...images, ...acceptedFiles]);
        toast.success(`${acceptedFiles.length} image(s) added successfully!`);
      }
    }
  });

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    toast.success('Image removed successfully!');
  };

  const handleUploadImages = async (index) => {
    try {
      const image = images[index];
      
      const signedUrlResponse = await generateSignedUrl({
        title: image.name,
        mediaType: "image",
        ext: image.name.split('.').pop() || "",
        active: true,
        uploadStatus: "progressing",
        uploadProgress: 0,
      });

      if (!signedUrlResponse) {
        throw new Error('Failed to generate signed URL');
      }

      const signedUrlData = signedUrlResponse;
      const signedUrl = signedUrlData.signedUrl;
      const mediaId = signedUrlData.media._id;

      setMediaId(mediaId);

      await axios.put(signedUrl, image, {
        headers: {
          'Content-Type': image.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [image.name]: progress }));

          if (progress === 100) {
            updateMediaStatus({
              mediaType: "image",
              title: image.name,
              ext: image.name.split('.').pop() || "",
              active: true,
              uploadStatus: "completed",
              uploadProgress: 100,
            });
          }
        }
      });

      setUploadedImages(prev => [
        ...prev,
        {
          url: signedUrl.split("?")[0],
          altText: image.name
        }
      ]);

      // Remove uploaded image from pending images
      setImages(prev => prev.filter((_, i) => i !== index));
      
      toast.success('Image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form data
    const validationErrors = validateProductData(productData, notes);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      
      // Scroll to first error
      const firstErrorElement = document.querySelector('.text-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    // Check if there are pending image uploads
    if (images.length > 0) {
      toast.warning('Please upload or remove all pending images before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedUploadedImages = product?.images?.map((item) => {
        const { _id, ...rest } = item;
        return rest;
      }) || [];

      const cleanedNotes = product?.notes?.map((item) => {
        const { _id, ...rest } = item;
        return rest;
      }) || [];

      const { _id, __v, updated_at, created_at, ...cleanedData } = productData;

      // Filter out empty notes
      const validNotes = notes.filter(note => 
        note.name?.trim() && note.description?.trim()
      );

      const payload = product ? {
        ...cleanedData,
        images: uploadedImages.length > 0 ? uploadedImages : cleanedUploadedImages,
        RFQ: isRFQ,
        notes: validNotes.length > 0 ? validNotes : cleanedNotes,
      } : {
        ...productData,
        images: uploadedImages,
        RFQ: isRFQ,
        notes: validNotes,
      };

      await saveProduct(payload);
      
      toast.success(typeData === 'update' ? 'Product updated successfully!' : 'Product created successfully!');
      
      setTimeout(() => {
        navigate('/product/list');
      }, 1500);

    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) return <LoadingScreen />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-primary rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-color">
          {typeData === 'update' ? 'Update Product' : 'Create New Product'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the product details below. Fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-secondary-card rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-color mb-4">Basic Information</h2>
          <div className="flex flex-wrap -mx-4">
            <FormField label="Product Name" required error={errors.name}>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                placeholder="Enter product name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {productData.name?.length || 0}/100 characters
              </div>
            </FormField>

            <FormField label="Product Description" required error={errors.description}>
              <textarea
                name="description"
                rows="3"
                className="block w-full px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color resize-none"
                placeholder="Enter product description"
                value={productData.description}
                onChange={handleChange}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {productData.description?.length || 0}/1000 characters
              </div>
            </FormField>
          </div>
        </div>

        {/* Category and Brand */}
        <div className="bg-secondary-card rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-color mb-4">Category & Brand</h2>
          <div className="flex flex-wrap -mx-4">
            <FormField label="Category" required error={errors.category}>
              <Select
                options={categoryOptions}
                value={categoryOptions.find(option => option.value === productData.category)}
                onChange={(selectedOption) => handleSelectChange('category', selectedOption)}
                classNames={customSelectStyles}
                placeholder="Select category"
                isClearable
                isSearchable
                noOptionsMessage={() => "No categories available"}
              />
            </FormField>

            <FormField label="Sub Category" error={errors.subCategory}>
              <Select
                options={subCategoryOptions}
                value={subCategoryOptions.find(option => option.value === productData.subCategory)}
                onChange={(selectedOption) => handleSelectChange('subCategory', selectedOption)}
                classNames={customSelectStyles}
                placeholder="Select sub category"
                isClearable
                isSearchable
                noOptionsMessage={() => "No sub-categories available"}
              />
            </FormField>

            <FormField label="Brand" required error={errors.brand}>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Select
                    options={brandOptions}
                    value={brandOptions.find(option => option.value === productData.brand)}
                    onChange={(selectedOption) => handleSelectChange('brand', selectedOption)}
                    classNames={customSelectStyles}
                    placeholder="Select brand"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No brands available"}
                  />
                </div>
                <button
                  type="button"
                  className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                  onClick={openModal}
                >
                  Add Brand
                </button>
              </div>
            </FormField>

            <FormField label="Sub Brand" error={errors.subBrand}>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Select
                    options={subBrandOptions}
                    value={subBrandOptions.find(option => option.value === productData.subBrand)}
                    onChange={(selectedOption) => handleSelectChange('subBrand', selectedOption)}
                    classNames={customSelectStyles}
                    placeholder="Select sub brand"
                    isDisabled={!productData.brand}
                    isClearable
                    isSearchable
                    noOptionsMessage={() => productData.brand ? "No sub-brands available for this brand" : "Please select a brand first"}
                  />
                </div>
                <button
                  type="button"
                  className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  onClick={openSubModal}
                  disabled={!productData.brand}
                >
                  Add Sub Brand
                </button>
              </div>
            </FormField>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-secondary-card rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-color mb-4">Product Details</h2>
          <div className="flex flex-wrap -mx-4">
            <FormField label="Stock" required error={errors.stock}>
              <input
                type="number"
                name="stock"
                min="0"
                max="999999"
                className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                placeholder="Enter stock quantity"
                value={productData.stock}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="HSN Code" required error={errors.HSN}>
              <input
                type="text"
                name="HSN"
                className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                placeholder="Enter HSN code (numbers only)"
                value={productData.HSN}
                onChange={handleChange}
                maxLength={10}
                pattern="[0-9]*"
              />
              <div className="text-xs text-gray-500 mt-1">
                HSN code should contain only numbers (4-10 digits)
              </div>
            </FormField>

            <FormField label="Model" required error={errors.model}>
              <input
                type="text"
                name="model"
                className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                placeholder="Enter model"
                value={productData.model}
                onChange={handleChange}
                maxLength={50}
              />
            </FormField>

            <FormField label="Product Code" required error={errors.productCode}>
              <input
                type="text"
                name="productCode"
                className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                placeholder="Enter product code (letters, numbers, -, _)"
                value={productData.productCode}
                onChange={handleChange}
                maxLength={20}
                pattern="[A-Za-z0-9-_]*"
              />
              <div className="text-xs text-gray-500 mt-1">
                Only letters, numbers, hyphens, and underscores allowed
              </div>
            </FormField>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-secondary-card rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-color mb-4">Settings</h2>
          <div className="flex flex-wrap -mx-4">
            <FormField label="Request for Quote (RFQ)" className="w-full p-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isRFQ}
                  onChange={() => handleToggle('RFQ')} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-text-color">
                  Enable RFQ for this product
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                When enabled, customers can request quotes instead of direct purchase
              </p>
            </FormField>
          </div>
        </div>

        {/* Images */}
        <div className="bg-secondary-card rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-color mb-4">Product Images</h2>
          
          {/* Image Upload Area */}
          <div {...getRootProps({ className: 'dropzone' })} className="w-full p-8 bg-primary border-2 border-dashed border-border rounded-lg mb-4 text-center cursor-pointer hover:border-secondary transition-colors">
            <input {...getInputProps()} />
            <div className="text-text-color">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-lg">Drag & drop images here, or click to select files</p>
              <p className="text-sm text-gray-500 mt-1">Supports: JPEG, PNG, GIF, WebP (Max 5MB each)</p>
            </div>
          </div>

          {/* Pending Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-text-color mb-3">Pending Upload ({images.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((file, index) => (
                  <div key={index} className="bg-primary rounded-lg p-4 border border-border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                    <p className="text-sm text-text-color truncate mb-2" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadProgress[file.name] && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-text-color mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[file.name]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress[file.name] || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={() => handleUploadImages(index)}
                        disabled={uploadProgress[file.name] === 100}
                      >
                        {uploadProgress[file.name] === 100 ? 'Uploaded' : 'Upload'}
                      </button>
                      <button
                        type="button"
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-text-color mb-3">Uploaded Images ({uploadedImages.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="bg-primary rounded-lg p-4 border border-border">
                    <img
                      src={image.url}
                      alt={image.altText || 'Product image'}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                    <p className="text-sm text-text-color truncate mb-3" title={image.altText}>
                      {image.altText || 'Product image'}
                    </p>
                    <button
                      type="button"
                      className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                      onClick={() => handleRemoveUploadedImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedImages.length === 0 && images.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No images added yet. Add some images to showcase your product.</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-secondary-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-color">Notes</h2>
            <button 
              type="button" 
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
              onClick={addNotes}
            >
              Add Note
            </button>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notes added yet. Click "Add Note" to add additional information about this product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="bg-primary rounded-lg p-4 border border-border">
                  <div className="flex flex-wrap -mx-2 mb-3">
                    <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
                      <label className="block text-sm font-medium text-text-color mb-1">
                        Note Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter note name"
                        value={note.name}
                        onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                        className="block w-full h-10 px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color"
                        maxLength={100}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {note.name?.length || 0}/100 characters
                      </div>
                      <ErrorMessage error={errors[`notes_${index}_name`]} />
                    </div>
                    <div className="w-full md:w-1/2 px-2">
                      <label className="block text-sm font-medium text-text-color mb-1">
                        Note Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Enter note description"
                        value={note.description}
                        onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                        rows="2"
                        className="block w-full px-3 py-2 border-b border-border bg-primary rounded-none focus:outline-none focus:border-secondary transition text-text-color resize-none"
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {note.description?.length || 0}/500 characters
                      </div>
                      <ErrorMessage error={errors[`notes_${index}_description`]} />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    onClick={() => removeNotes(index)}
                  >
                    Remove Note
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/product/list')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || isLoading || images.length > 0}
            className="bg-primary-button-color text-btn-text-color px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (typeData === 'update' ? 'Update Product' : 'Create Product')}
          </button>
        </div>

        {images.length > 0 && (
          <div className="text-center text-yellow-600 text-sm">
            <p>⚠️ Please upload or remove all pending images before submitting the form</p>
          </div>
        )}
      </form>

      {/* Modals */}
      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title="Add Brand">
        <BrandForm closeModal={closeModal} />
      </PopUpModal>
      
      <PopUpModal isOpen={isSubModalOpen} onClose={closeSubModal} title="Add Sub Brand">
        <SubBrandForm closeModal={closeSubModal} />
      </PopUpModal>

      {/* Toast Container */}
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

export default ProductForm;