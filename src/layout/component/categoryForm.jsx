import React, { useState, useCallback, useEffect } from "react";
import { AutoComplete } from "@react-md/autocomplete";
import { categoryDefault, industries } from "../../constant";
import { usePostData, usePutData } from "../../common/api";

function CategoryForm({ id, name, industry, closeModal }) {
  // Set initial state with props if editing, otherwise use the default
  const [categoryData, setCategoryData] = useState({
    categoryName: name || categoryDefault.categoryName,
    categoryType: industry || categoryDefault.categoryType,
  });

  const { mutate: addCategory, isPending, error } = usePostData("addCategory", "/category/add");
  const { mutate: editCategory, isPending: isEditing, error: editError } = usePutData("editCategory", `/category/update/${id}`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onAutoComplete = useCallback(({ dataIndex }) => {
    setCategoryData((prevState) => ({
      ...prevState,
      categoryType: industries[dataIndex],
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      // If editing, call the editCategory mutation
      editCategory(categoryData, {
        onSuccess: () => {
          closeModal();
        },
        onError: (error) => {
          closeModal();
        },
      });
    } else {
      // If adding, call the addCategory mutation
      addCategory(categoryData, {
        onSuccess: () => {
          closeModal();
        },
        onError: (error) => {
          closeModal();
        },
      });
    }
    setCategoryData(categoryDefault);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">
                &nbsp;Category Name *&nbsp;
              </label>
              <input
                type="text"
                name="categoryName"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Your Category Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
                value={categoryData.categoryName}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full">
            <div className="mb-4">
              <label className="float-left block mb-2 text-white">
                &nbsp;Industry *&nbsp;
              </label>
              <AutoComplete
                id="search-industries"
                name="categoryType"
                placeholder="Enter an Industry..."
                data={industries}
                highlight
                theme="none"
                defaultValue={categoryData.categoryType}
                onAutoComplete={onAutoComplete}
              />
              <div className="correct"></div>
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

export default CategoryForm;
