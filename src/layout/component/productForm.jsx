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

function ProductForm({ typeData, productId }) {
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
  const navigate = useNavigate();

  const mutationHook = typeData === 'update' ? usePutData : usePostData;
  const api_url = typeData === 'update' ? '/product/update' : '/product/add';
  const api_key = typeData === 'update' ? 'updateProduct' : 'addProduct';
  const { data: brandData, refetch: refetchBrand } = useGetData('brand', '/brands');
  const { data: subBrandData, refetch: refetchSubBrand } = useGetData('subBrand', '/subbrands');
  const { mutate: saveProduct, isLoading } = mutationHook(api_key, api_url);
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');
  const { data: subCategoryData, refetch: refetchSubCategories } = useGetData('subCategories', '/subcategories');
  const { mutate: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutate: updateMediaStatus } = usePutData('signedUrl', '/media/update');

  useEffect(() => {
    refetchCategories();
    refetchSubCategories();
    refetchBrand();
    refetchSubBrand();
  }, [refetchCategories, refetchBrand, refetchSubBrand, refetchSubCategories]);

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }
    if (subCategoryData) {
      setSubCategories(subCategoryData.subCategories);
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

  const subCategoryOptions = subCategoryData?.subCategories?.map(subcategory => ({
    value: subcategory._id, 
    label: subcategory.subCategoryName
  }));

  const brandOptions = brandData?.brands?.map(brand => ({
    value: brand._id, 
    label: brand.name
  }));

  const subBrandOptions = subBrandData?.subBrands?.map(subBrand => ({
    value: subBrand._id, 
    label: subBrand.name
  }));

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openSubModal = () => setSubModalOpen(true);
  const closeSubModal = () => setSubModalOpen(false);

  const handleImagesChange = (acceptedFiles) => {
    setImages(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })));
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
    if (field === 'RFQ') {
      setRFQ(!isRFQ);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleImagesChange });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        if (!image.url) {
          // Upload new images
          const signedUrlResponse = await generateSignedUrl({
            title: image.name,
            mediaType: 'image',
            active: true,
            uploadStatus: 'progressing',
            uploadProgress: 0,
          }, {
            headers: {
              'Content-Type': image.type,
              'Content-Length': image.size,
            },
          });
  
          const { signedUrl, media } = signedUrlResponse.data;
  
          await axios.put(signedUrl, image, {
            headers: {
              'Content-Type': image.type,
              'Content-Length': image.size,
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [image.name]: progress }));
            },
          });
  
          await updateMedia({
            _id: media._id,
            mediaType: media.mediaType,
            title: media.title,
            active: media.active,
            uploadStatus: 'completed',
            uploadProgress: 100,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          return { ...media, preview: URL.createObjectURL(image) };
        } else {
          // Use existing images
          return image;
        }
      })
    );
  
    const productDataWithImages = { ...productData, images: uploadedImages, notes, RFQ: isRFQ };
  
    saveProduct(productDataWithImages, {
      onSuccess: (data) => {
        console.log(data);
        setProdId(data);
      },
      onError: (error) => {
        console.error('Error saving product:', error);
      },
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Product Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Product Name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Product Description *</label>
              <input
                type="text"
                name="description"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
        <label className="block w-full mb-2 text-white">Brand *</label>
        <div className="flex items-center" style={{ width: '100%' }}>
          <div style={{ width: '90%' }}>
            <Select
              options={brands?.map(brand => ({ value: brand._id, label: brand.name }))}
              value={brandOptions?.find(option => option._id === productData.brand)}
              onChange={(selectedOption) => setProductData(prevState => ({ ...prevState, brand: selectedOption.value }))}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  width:'100%', // h-10: 2.5rem = 40px
                  paddingLeft: '8px', // px-2: 0.5rem = 8px
                  paddingRight: '8px', // px-2: 0.5rem = 8px
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
                  backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer'
                })
              }}
            />
          </div>
          <button
            type="button"
            className="bg-black text-white px-4 py-2 rounded ml-2"
            onClick={() => openModal()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-white">Sub Brand</label>
        <div className="flex items-center" style={{ width: '100%' }}>
          <div style={{ width: '90%' }}>
            <Select
              options={subBrands?.map(subBrand => ({ value: subBrand._id, label: subBrand.subBrandName }))}
              value={subBrandOptions?.find(option => option._id === productData.subBrand)}
              onChange={(selectedOption) => setProductData(prevState => ({ ...prevState, subBrand: selectedOption.value }))}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  width:'100%', // h-10: 2.5rem = 40px
                  paddingLeft: '8px', // px-2: 0.5rem = 8px
                  paddingRight: '8px', // px-2: 0.5rem = 8px
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
                  backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer'
                })
              }}
            />
          </div>
          <button
            type="button"
            className="bg-black text-white px-4 py-2 rounded ml-2"
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
              <label className="float-left inline-block mb-2 text-white">Stock *</label>
              <input
                type="number"
                name="stock"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter stock"
                autoComplete="off"
                value={productData.stock}
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


        <div className="flex flex-wrap">
         
          <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-white">Category *</label>
    <Select
      options={categories?.map(category => ({ value: category._id, label: category.categoryName }))}
      value={categoryOptions?.find(option => option._id === productData.category)}
      onChange={(selectedOption) => setProductData(prevState => ({ ...prevState, category: selectedOption.value }))}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: 'black',
          borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
          borderBottomWidth: '2px',
          borderRadius: '0px',
          height: '40px', // h-10: 2.5rem = 40px
          paddingLeft: '8px', // px-2: 0.5rem = 8px
          paddingRight: '8px', // px-2: 0.5rem = 8px
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
          backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
          color: state.isSelected ? 'black' : 'white',
          cursor: 'pointer'
        })
      }}
    />
  </div> 
</div>

<div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="block w-full mb-2 text-white">Sub Category </label>
    <Select
      options={subCategories?.map(subCategory => ({ value: subCategory._id, label: subCategory.subCategoryName }))}
      value={subCategoryOptions?.find(option => option._id === productData.subCategory)}
      onChange={(selectedOption) => setProductData(prevState => ({ ...prevState, category: selectedOption.value }))}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: 'black',
          borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
          borderBottomWidth: '2px',
          borderRadius: '0px',
          height: '40px', // h-10: 2.5rem = 40px
          paddingLeft: '8px', // px-2: 0.5rem = 8px
          paddingRight: '8px', // px-2: 0.5rem = 8px
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
          backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
          color: state.isSelected ? 'black' : 'white',
          cursor: 'pointer'
        })
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

        <div className="w-full p-4">
        <label className="block w-full mb-2 text-white">Images</label>
        <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-sidebar-card-top text-white border-2 border-nexa-gray rounded mb-4">
          <input {...getInputProps()} />
          <p>Drag & drop images here, or click to select files</p>
          <div className="w-full p-4">
          {images.map((file, index) => (
            <div key={index} className="relative inline-block mr-4 mb-4">
              <img src={file.preview} alt="Preview" className="w-20 h-20 object-cover border-2 border-gray-600 rounded" />
              <button type="button" className="absolute top-0 right-0 p-1 bg-gray-800 text-white text-xs rounded-full" onClick={() => setImages(images.filter((_, i) => i !== index))}>x</button>
              <div className="absolute bottom-0 left-0 bg-gray-800 text-white text-xs p-1 rounded">{uploadProgress[file.name] || 0}%</div>
            </div>
          ))}
        </div>
        </div>
        
        </div>

        {/* Bank Details */}
        <div className="w-full p-4">
       
        <div className="flex items-center justify-between mb-4">
          <label className="block  text-white mt-4">Notes</label>
          
          <button type="button" className="bg-black text-white px-4 py-2 rounded mt-4" onClick={addNotes}>Add Notes</button>
          </div>
          
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
            {(notes.length===0)&&<p>No notes added</p>}
          {notes.map((note, index) => (
            <div key={index} className="flex flex-wrap items-center mb-4 p-2  rounded-lg">
              <input
                type="text"
                placeholder="Note Name"
                value={note.name}
                onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                className="block w-2/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              />
              <textarea
                type="text"
                placeholder="Note Description"
                value={note.description}
                onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeNotes(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            {isLoading  ? 'Saving...' : 'Save'}
          </button>
        {/* </div>
        <div className="flex flex-wrap justify-end p-4"> */}
          {/* <button type="button" onClick={() => handleAddVariant()} className="bg-nexa-orange text-white px-6 py-2 rounded ml-2">
            {isLoading  ? 'Adding...' : 'Add Variants'}
          </button> */}


          {/* <div className="w-full p-4 mt-7">
          <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="variants">
        {(provided) => (
          <Table theme={{ dark: true }} ref={provided.innerRef} {...provided.droppableProps}>
            <Table.Head className="border-gray-700 bg-black text-white">
              <Table.HeadCell className="border-gray-700 bg-black text-white">Team Name</Table.HeadCell>
              <Table.HeadCell className="border-gray-700 bg-black text-white">Status</Table.HeadCell>
              <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {variants.map((variant, index) => (
                <Draggable key={variant._id} draggableId={variant._id} index={index}>
                  {(provided) => (
                    <Table.Row
                      className="border-gray-700 bg-zinc-950"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-white">
                        {variant.name}
                      </Table.Cell>
                      <Table.Cell className={`whitespace-nowrap ${variant.active ? "text-green-500" : "text-red-500"}`}>
                        {variant.active ? "Active" : "Inactive"}
                      </Table.Cell>
                      <Table.Cell className="text-gray-300">
                        <Dropdown label="Actions" inline className="bg-black text-white border-black">
                          <Dropdown.Item
                            className="text-gray-300 hover:!bg-orange-600"
                            onClick={() => handleEditVariant(variant)}
                          >
                            Edit Variant
                          </Dropdown.Item>
                          {variant.active ? (
                            <Dropdown.Item
                              className="text-gray-300 hover:!bg-orange-600"
                              onClick={() => handleDeactivateTeam(variant)}
                            >
                              Deactivate Team
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item
                              className="text-gray-300 hover:!bg-orange-600"
                              onClick={() => handleActivateTeam(variant)}
                            >
                              Activate Team
                            </Dropdown.Item>
                          )}
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Table.Body>
          </Table>
        )}
      </Droppable>
    </DragDropContext>
  
      </div>
           */}
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
