import React, { useState, useEffect } from "react";
import { subBrandDefault } from "../../constant";
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from "../../common/api";

function SubBrandForm({ id, closeModal }) {
  const [subBrandData, setSubBrandData] = useState(subBrandDefault);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);


  const { mutate: addSubBrand, isPending: isAdding, error: addError } = usePostData("addSubBrand", "/subbrands/add");
  const { data: categoryData, refetch: refetchCategories } = useGetData('categories', '/category');
  const { data: brandData, refetch: refetchBrand } = useGetData('brand', '/brands');

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories);
    }
    if (brandData) {
      setBrands(brandData.brands || []);
    }
    }, [categoryData, brandData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubBrandData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
   
    addSubBrand(
        { 
          subBrandName: subBrandData.subBrandName,
          brandId: subBrandData.brandId,
            active: subBrandData.active
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
    
    setSubBrandData(subBrandDefault); // Reset the form to default state
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;SubBrand Name *&nbsp;
              </label>
              <input
                type="text"
                name="subBrandName"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your SubBrand Name"
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
                &nbsp;Brand *&nbsp;
              </label>
              <Select
              options={brands.map(brand => ({ value: brand._id, label: brand.name }))}
              value={brands.find(option => option.value === subBrandData.brandId)}
              onChange={(selectedOption) => setSubBrandData(prevState => ({ ...prevState, brandId: selectedOption.value }))}
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
               Add SubBrand
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SubBrandForm;
