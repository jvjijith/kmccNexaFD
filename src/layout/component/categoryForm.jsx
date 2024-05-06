import React,{useState,useCallback} from "react";
import { AutoComplete } from "@react-md/autocomplete";
import { categoryDefault, industries } from "../../constant";
import { usePostData } from "../../common/api";

function CategoryForm() {

  const [categoryData,setCategoryData] = useState(categoryDefault);
  const {mutate:addCategory, isPending, error } =usePostData("addCategory", "/category/add");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prevState => ({
      ...prevState,
      [name]: value
    }));

  };


  const onAutoComplete = useCallback(({ dataIndex }) => {
    console.log(industries[dataIndex]);
    setCategoryData(prevState => ({
      ...prevState,
      ["categoryType"]: industries[dataIndex]
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addCategory(categoryData); // Call the addCategory mutation
    setCategoryData(categoryDefault);
  
  };

  return (
    <div>
  
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            {" "}
            {/* col-sm-12 */}
           
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
            {" "}
            {/* col-sm-12 */}
            <div className="mb-4">
              <label className="float-left block mb-2 text-white">
                &nbsp;Industry *&nbsp;
              </label>
              <AutoComplete
                id="search-industries"
                name="categoryType"
                placeholder="Enter a Industries..."
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
  <button type="submit" className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded">Add Category</button>
</div>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
