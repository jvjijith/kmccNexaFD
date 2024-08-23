import React, { useState, useEffect } from "react";
import { brandDefault } from "../../constant";
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from "../../common/api";

function BrandForm({ id, closeModal }) {
  const [brandData, setBrandData] = useState(brandDefault);
  const [categories, setCategories] = useState([]);


  const { mutate: addBrand, isPending: isAdding, error: addError } = usePostData("addBrand", "/brands/add");
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }
    }, [categoryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrandData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const categoryOptions = categoryData?.categories?.map(category => ({
    value: category._id, 
    label: category.categoryName
    // value: employee.metadataId,
    // label: employee.name,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
   
    addBrand(
        { 
            name: brandData.name,
            category: brandData.category,
            active: brandData.active
         },
        {
          onSuccess: () => {
            
            closeModal();
          },
          onError: (error) => {
            
            closeModal();
          },
        }
      );
    
    setBrandData(brandDefault); // Reset the form to default state
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Brand Name *&nbsp;
              </label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Brand Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
                // value={teamData.teamName || ""}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-4">
              <label className="w-full float-left inline-block mb-2 text-white">
                &nbsp;Category *&nbsp;
              </label>
              <Select
      options={categories.map(category => ({ value: category._id, label: category.categoryName }))}
      value={categoryOptions.find(option => option._id === brandData.category)}
      onChange={(selectedOption) => setBrandData(prevState => ({ ...prevState, category: selectedOption.value }))}
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
              <div className="correct"></div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end p-4">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
               Add Brand
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BrandForm;
