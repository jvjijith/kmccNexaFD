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
              <label className="float-left inline-block mb-2 text-text-color primary-text">
                &nbsp;Brand Name *&nbsp;
              </label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
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
              <label className="w-full float-left inline-block mb-2 text-text-color">
                &nbsp;Category *&nbsp;
              </label>
              <Select
      options={categories.map(category => ({ value: category._id, label: category.categoryName }))}
      value={categoryOptions.find(option => option._id === brandData.category)}
      onChange={(selectedOption) => setBrandData(prevState => ({ ...prevState, category: selectedOption.value }))}
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
              <div className="correct"></div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end p-4">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-text-color px-4 py-2 rounded">
               Add Brand
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BrandForm;
