import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { Table } from "flowbite-react";
import { varientDefault } from '../../constant';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import Modal from 'react-modal';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import B2 from 'backblaze-b2';
import BrandForm from './brandForm';
import PopUpModal from '../ui/modal/modal';
import SubBrandForm from './subBrandForm';

Modal.setAppElement('#root');

function VarientForm({ typeData, productId, variantId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [productData, setProductData] = useState(varientDefault);
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isRFQ, setRFQ] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subBrands, setSubBrands] = useState([]);
  const [modalType, setModalType] = useState('');
  const [newBrand, setNewBrand] = useState({ name: '', category: '', active: true });
  const [newSubBrand, setNewSubBrand] = useState({ subBrandName: '', brandId: '', active: true });

  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? '/product/update' : '/variant/add';
  const api_key = typeData === 'update' ? 'updateProduct' : 'addProduct';
  const { data: brandData, refetch: refetchBrand } = useGetData('brand', '/brands');
  const { data: subBrandData, refetch: refetchSubBrand } = useGetData('subBrand', '/subbrands');
  const { mutate: saveProduct, isLoading } = mutationHook(api_key, api_url);
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');

  useEffect(() => {
    refetchCategories();
    refetchBrand();
    refetchSubBrand();
  }, [refetchCategories, refetchBrand, refetchSubBrand]);

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }
    if (brandData) {
      setBrands(brandData.brands || []);
    }
    if (subBrandData) {
      setSubBrands(subBrandData.subBrands || []);
    }
  }, [categoryData, brandData, subBrandData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

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
    label: subBrand.name
  }));

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const openSubModal = () => {
    setSubModalOpen(true);
  };

  const closeSubModal = () => {
    setSubModalOpen(false);
  };

  const handleImagesChange = (acceptedFiles) => {
    setImages(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })));
  };

  const handleNotesChange = (index, field, value) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
  };

  const addNotes = () => {
    setNotes([...notes, { name: '', description: '' }]);
  };

  const removeNotes = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const handleToggle = (field) => {
    if (field === 'RFQ') {
      setRFQ(!isRFQ);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleImagesChange });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    //   const response = await axios.post('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', null, {
    //     auth: {
    //       username: 'c0645d92636f',
    //       password: '0055b8264f72e8cbc18f4d25b66b9475892416b1e0'
    //     }
    //   });

    //   const { authorizationToken, apiUrl, downloadUrl, allowed } = response.data;
    //   const bucketId = allowed.bucketId;

    //   const getUploadUrlResponse = await axios.post(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    //     bucketId
    //   }, {
    //     headers: {
    //       Authorization: authorizationToken
    //     }
    //   });

    //   const { uploadUrl, authorizationToken: uploadAuthToken } = getUploadUrlResponse.data;

    //   const uploadImage = async (file) => {
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     const response = await axios.post(uploadUrl, formData, {
    //       headers: {
    //         Authorization: uploadAuthToken,
    //         'X-Bz-File-Name': encodeURIComponent(file.name),
    //         'Content-Type': 'b2/x-auto',
    //         'X-Bz-Content-Sha1': 'do_not_verify'
    //       }
    //     });

    //     const uploadedUrl = `${downloadUrl}/file/trailBucket/${response.data.fileName}`;
    //     return uploadedUrl;
    //   };

    //   const uploadedImages = await Promise.all(images.map(uploadImage));

      const productDataWithImages = { ...productData, 
        // images: uploadedImages, 
        images: [
          {
             "url": "https://example.com/image1.jpg",
            "altText": "Image 1"
          }
        ], 
        notes, 
        RFQ:isRFQ,
        productId:productId };

      saveProduct(productDataWithImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  console.log(productId);
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Varient Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Varient Color *</label>
              <input
                type="text"
                name="color"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Color"
                autoComplete="off"
                value={productData.color}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-white">Size *</label>
        <input
                type="text"
                name="size"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Size"
                autoComplete="off"
                value={productData.size}
                onChange={handleChange}
              />
      </div>
    </div>
    
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">HSN *</label>
              <input
                type="text"
                name="HSN"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
              <label className="float-left inline-block mb-2 text-white">Model *</label>
              <input
                type="text"
                name="model"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Model"
                autoComplete="off"
                value={productData.model}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Product Code *</label>
              <input
                type="text"
                name="productCode"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Product Code"
                autoComplete="off"
                value={productData.productCode}
                onChange={handleChange}
                
              />
            </div>
          </div>
    
        </div>

        <label className="block w-full mb-2 text-white">Images</label>
        <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-black text-white border-2 border-nexa-gray rounded mb-4">
          <input {...getInputProps()} />
          <p>Drag & drop images here, or click to select files</p>
        </div>
        <div className="w-full p-4">
          
          {images.map((file, index) => (
            <div key={index} className="flex mb-2">
              <img src={file.preview} alt="Preview" className="w-20 h-20 mr-2" />
              <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={() => setImages(images.filter((_, i) => i !== index))}>Remove</button>
            </div>
          ))}
        </div>

        {/* Bank Details */}
        <div className="w-full p-4">
          <label className="block w-full mb-2 text-white">Notes</label>
          {notes.map((note, index) => (
            <div key={index} className="flex flex-wrap mb-4">
              <input
                type="text"
                placeholder="Note Name"
                value={note.name}
                onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              />
              <input
                type="text"
                placeholder="Note Description"
                value={note.description}
                onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                className="block w-1/4 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeNotes(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addNotes}>Add Notes</button>
        </div>

        {/* Toggle Buttons */}
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="RFQ"
                id="RFQ"
                checked={isRFQ}
                onChange={() => handleToggle('RFQ')} />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                RFQ
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>

          
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
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

export default VarientForm;
