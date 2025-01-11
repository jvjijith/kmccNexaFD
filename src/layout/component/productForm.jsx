import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { Dropdown, Table } from "flowbite-react";
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

function ProductForm({ typeData, product }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubrand, setSubrand] = useState(false);
  const [isBrand, setbrand] = useState(false);
  const [isCategorie, setCategorie] = useState(false);
  const [isSubCategories, setSubCategorie] = useState(false);
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
  const [loading, setLoading] = useState(true); // Loading state

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

      // Simulate loading for 10 seconds before showing content
      useEffect(() => {
        const timer = setTimeout(() => {
          setLoading(false);
        }, 3000); // 10 seconds delay
    
        return () => clearTimeout(timer); // Cleanup timeout on unmount
      }, []);
  
  useEffect(() => {
    if (typeData === 'update' && product) {
      setProductData({
        ...productData,
        name: product.name || '',
        description: product.description || '',
        HSN: product.HSN || '',
        model: product.model || '',
        productCode: product.productCode || '',
        stock: product.stock || '',
        subCategory: product.subCategory || '',
        category: product.category?._id || '',
        brand: product.brand?._id || '',
        subBrand: product.subBrand?._id || '',
        // Populate other fields as necessary
      });
      setImages([]);
      setNotes(product.notes || []);
      setRFQ(product.RFQ || false);
      setUploadedImages(product.images || []);
    }
  }, [typeData, product]);

  useEffect(() => {
    refetchCategories();
    refetchSubCategories();
    refetchBrand();
    refetchSubBrand();
  }, [refetchCategories, refetchBrand, refetchSubBrand, refetchSubCategories]);

  useEffect(() => {
    if (categoryData) setCategories(categoryData.categories);
    if (subCategoryData) setSubCategories(subCategoryData.subCategories);
    if (brandData) setBrands(brandData.brands || []);
    if (subBrandData) setSubBrands(subBrandData.subBrands || []);
  }, [categoryData, brandData, subBrandData]);

  const subCategoryOptions = subCategoryData?.subCategories?.map(subcategory => ({
    value: subcategory._id, 
    label: subcategory.subCategoryName
  }));

  const categoryOptions = categoryData?.categories?.map(category => ({
    value: category._id, 
    label: category.categoryName
  }));

  const brandOptions = brandData?.brands?.map(brand => ({
    value: brand._id, 
    label: brand.name
  }));

  const subBrandOptions = subBrandData?.subBrands?.map(subBrand => ({
    value: subBrand._id, 
    label: subBrand.subBrandName,
    brandId: subBrand.brandId._id
  }));

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openSubModal = () => setSubModalOpen(true);
  const closeSubModal = () => setSubModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNotesChange = (index, field, value) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
  };

  const addNotes = () => setNotes([...notes, { name: '', description: '' }]);

  const removeNotes = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const handleToggle = (field) => {
    if (field === 'RFQ') setRFQ(!isRFQ);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    }
  });

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUploadImages = async (index) => {
    try {
        const image = images[index];
        console.log(`Generating signed URL for ${image.name}`);

        // Generate a signed URL 
        const signedUrlResponse = await generateSignedUrl({
            title: image.name,
            mediaType: "image",
            ext: image.name.split('.').pop() || "",
            active: true,
            uploadStatus: "progressing",
            uploadProgress: 0,
        });

        console.log('Signed URL Response:', signedUrlResponse);

        if (!signedUrlResponse) {
            thrownewError('Signed URL data is undefined');
        }

        const signedUrlData = signedUrlResponse;
        const signedUrl = signedUrlData.signedUrl;
        const mediaId = signedUrlData.media._id;

        console.log("API Data:", signedUrlData);
        console.log("Signed URL generated:", signedUrl);
        console.log("Media ID generated:", mediaId);

        setMediaId(mediaId);

        // Proceed with uploading the image to the signed URL
        await axios.put(signedUrl, image, {
            headers: {
                'Content-Type': image.type
            },
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(prev => ({ ...prev, [image.name]: progress }));

                // Update media status
                if(progress === 100  )
                updateMediaStatus({
                    // media: {
                        // _id: mediaId,
                        mediaType: "image",
                        title: image.name,
                        ext: image.name.split('.').pop() || "",
                        active: true,
                        uploadStatus: "completed",
                        uploadProgress: 100,
                    // }
                });
            }
        });

        // Add the uploaded image's URL to the list 
        setUploadedImages(prev => [
            ...prev,
            {
                url: signedUrl.split("?")[0], // Extract the base URL for the imagealtText: image.name
            }
        ]);

    } catch (error) {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image. Please try again.');
    }
};

  
  
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission

    const cleanedUploadedImages = product?.images.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });

    const cleanedNotes = product?.notes.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });

    const { _id, __v, updated_at, created_at, ...cleanedData } = productData;

    const payload = product ? {
      ...cleanedData,
      // category: isCategorie ? productData.category : productData.category._id,
      // subBrand: isSubrand ? productData.subBrand : productData.subBrand._id,
      // brand: isBrand ? productData.brand : productData.brand._id,
      // subCategory: isSubCategories ? productData.subCategory : productData.subCategory._id,
      images: cleanedUploadedImages,
      RFQ: isRFQ,
      notes: cleanedNotes,
      // identificationNumbers: cleanedIdentificationNumbers,
      // bankDetails: cleanedBankDetails,
    } : {
      ...productData,
      images: uploadedImages,
      RFQ: isRFQ,
      notes,
    };

    saveProduct(
      payload
    );
    navigate('/product/list');
  };

  if (isLoading||loading) return <LoadingScreen />;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Product Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Product Name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Product Description *</label>
              <textarea
                type="text"
                name="description"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Product Description"
                autoComplete="off"
                value={productData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-text-color primary-text">Brand *</label>
        <div className="flex items-center" style={{ width: '100%' }}>
          <div style={{ width: '90%' }}>
            <Select
              options={brands?.map(brand => ({ value: brand._id, label: brand.name }))}
              value={brandOptions?.find(option => option._id === (product?isBrand?productData.brand:productData.brand._id:productData.brand))}
              onChange={(selectedOption) => {setProductData(prevState => ({ ...prevState, brand: selectedOption.value }));setbrand(true);}}
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
          <button
            type="button"
            className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
            onClick={() => openModal()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-text-color primary-text">Sub Brand</label>
        <div className="flex items-center" style={{ width: '100%' }}>
          <div style={{ width: '90%' }}>
            <Select
              options={subBrands
                ?.filter(subBrand => subBrand.brandId._id === productData.brand)
                .map(subBrand => ({
                  value: subBrand._id,
                  label: subBrand.subBrandName
                }))
              }
              value={subBrandOptions?.find(option => option._id === (product? isSubrand? productData.subBrand : productData.subBrand._id : productData.subBrand) )}
              onChange={(selectedOption) => {setProductData(prevState => ({ ...prevState, subBrand: selectedOption.value }));setSubrand(true);}}
              isDisabled={!isBrand}
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
          <button
            type="button"
            className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
            onClick={() => openSubModal()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
  
  
 
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Stock *</label>
              <input
                type="number"
                name="stock"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter stock"
                autoComplete="off"
                value={productData.stock}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">HSN *</label>
              <input
                type="text"
                name="HSN"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter HSN"
                autoComplete="off"
                value={productData.HSN}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Model *</label>
              <input
                type="text"
                name="model"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Model"
                autoComplete="off"
                value={productData.model}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Product Code *</label>
              <input
                type="text"
                name="productCode"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Product Code"
                autoComplete="off"
                value={productData.productCode}
                onChange={handleChange}
                
              />
            </div>
          </div>
    
        </div>


        <div className="flex flex-wrap">
         
          <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Category *</label>
    <Select
      options={categories?.map(category => ({ value: category._id, label: category.categoryName }))}
      value={categoryOptions?.find(option => option._id === (product?isCategorie?productData.category:productData.category._id:productData.category))}
      onChange={(selectedOption) => {setProductData(prevState => ({ ...prevState, category: selectedOption.value }));setCategorie(true);}}
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

<div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Sub Category </label>
    <Select
      options={subCategoryOptions}
      value={subCategoryOptions?.find(option => option.value === (product?isCategorie?productData.subCategory:productData.subCategory:productData.subCategory))}
      onChange={(selectedOption) => {setProductData(prevState => ({ ...prevState, subCategory: selectedOption.value }));setSubCategorie(true);}}
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

{/* Toggle Buttons */}
<div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input type="checkbox" value="" className="sr-only peer" name="RFQ"
                id="RFQ"
                checked={isRFQ}
                onChange={() => handleToggle('RFQ')} />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ms-3 text-md font-medium text-text-color dark:text-text-color">
                RFQ
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

          
        </div>

        <div className="w-full p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Images</label><div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-secondary-card text-text-color border-2 border-border rounded mb-4">
    <input {...getInputProps()} />
    <p className='text-text-color'>Drag & drop images here, or click to select files</p>
    <div className="w-full p-4">
      {images.map((file, index) => (
        <div key={index} className="flex items-center justify-between mb-2">
          {/* Image preview */}
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-16 h-16 object-cover mr-4"
          />
          <span>{file.name}</span>
          <progress value={uploadProgress[file.name] || 0} max="100" className="flex-1 mx-2">
            {uploadProgress[file.name] || 0}%
          </progress>
          <button
            className="ml-2 text-blue-500"
            onClick={(e) => {
              e.stopPropagation();  // Prevent the event from bubbling up
              e.preventDefault(); 
              handleUploadImages(index);  // Upload only this image
            }}
          >
            Upload
          </button>
          <button
            className="ml-2 text-red-500"
            onClick={(e) => {
              e.stopPropagation();  // Prevent the event from bubbling up
              handleRemoveImage(index);
            }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  </div>
</div>



        {/* Bank Details */}
        <div className="w-full p-4">
       
        <div className="flex items-center justify-between mb-4">
          <label className="block  text-text-color mt-4">Notes</label>
          
          <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded mt-4" onClick={addNotes}>Add Notes</button>
          </div>
          
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {(notes.length===0)&&<p className='text-text-color'>No notes added</p>}
          {notes.map((note, index) => (
            <div key={index} className="flex flex-wrap items-center mb-4 p-2  rounded-lg">
              <input
                type="text"
                placeholder="Note Name"
                value={note.name}
                onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                className="block w-2/5 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              />
              <textarea
                type="text"
                placeholder="Note Description"
                value={note.description}
                onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ml-2"
              />
              <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeNotes(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">
            {isLoading  ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Add Brand"}>
        <BrandForm closeModal={closeModal} />
      </PopUpModal>
      <PopUpModal isOpen={isSubModalOpen} onClose={closeSubModal} title={"Add SubBrand"}>
        <SubBrandForm closeModal={closeSubModal} />
      </PopUpModal>

    </div>
  );
}

export default ProductForm;
