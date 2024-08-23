import React, { useState, useCallback, useEffect } from "react";
import { AutoComplete } from "@react-md/autocomplete";
import { subCategoryDefault, industries } from "../../constant";
import { useGetData, usePostData, usePutData } from "../../common/api";

function SubCategoryForm({ id, name, industry, closeModal, category }) {
  // Set initial state with props if editing, otherwise use the default
  const [categoryData, setCategoryData] = useState({
    subCategoryName: name || subCategoryDefault.subCategoryName,
    subCategoryType: industry || subCategoryDefault.subCategoryType,
    category: category
  });

  const { mutate: addSubCategory, isPending, error } = usePostData("addSubCategory", "/subcategories/add");
  const { mutate: editSubCategory, isPending: isEditing, error: editError } = usePutData("editSubCategory", `/subcategories/update/${id}`);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      // If editing, call the editSubCategory mutation
      editSubCategory(categoryData, {
        onSuccess: () => {
          closeModal();
        },
        onError: (error) => {
          closeModal();
        },
      });
    } else {
      // If adding, call the addSubCategory mutation
      addSubCategory(categoryData, {
        onSuccess: () => {
          closeModal();
        },
        onError: (error) => {
          closeModal();
        },
      });
    }
    setCategoryData(subCategoryDefault);
  };

  
  console.log(category);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Sub Category Name *&nbsp;
              </label>
              <input
                type="text"
                name="subCategoryName"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Sub Category Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
                value={categoryData.subCategoryName}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full">
            <div className="mb-4">
              <label className="float-left block mb-2 text-white">
                &nbsp;Sub Category Type *&nbsp;
              </label>
              <input
                type="text"
                name="subCategoryType"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Sub Category Type..."
                autoComplete="off"
                style={{ textAlign: "initial" }}
                value={categoryData.subCategoryType}
                onChange={handleChange}
              />
            </div>
          </div>


          <div className="flex flex-wrap justify-end p-4">
            <button type="submit" className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded">
              {id ? "Edit Category" : "Add Category"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SubCategoryForm;
