import React, { useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import CategoryForm from "./categoryForm";
import PopUpModal from "../ui/modal/modal";
import { useNavigate } from "react-router";
import SubCategoryForm from "./subCategoryForm";

function CategoryTable() {
  
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);


  const { data, isLoading, error, refetch } = useGetData("categoryData", "/category", {});

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setModalOpen(false);
  };

  const openSubModal = (team) => {
    setSelectedTeam(team);
    setSubModalOpen(true);
  };

  const closeSubModal = () => {
    setSelectedTeam(null);
    setSubModalOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category Type</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data?.categories?.map((category) => (
            <Table.Row key={category._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {category.categoryName}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {category.categoryType}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => openModal(category)}
                  >
                    Edit Category
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => navigate(`/category/subcategory`, { state: { category } })}
                  >
                    Show Sub-Category
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => openSubModal(category)}
                  >
                    Add Sub-Category
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Team"}>
        <CategoryForm id={selectedTeam?._id} name={selectedTeam?.categoryName} industry={selectedTeam?.categoryType} closeModal={closeModal} />
      </PopUpModal>

      <PopUpModal isOpen={isSubModalOpen} onClose={closeSubModal} title={"Edit Sub Category"}>
        <SubCategoryForm  category={selectedTeam?._id} closeModal={closeSubModal} />
      </PopUpModal>

      <ToastContainer />
    </div>
  );
}

export default CategoryTable;
