import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import CategoryForm from "./categoryForm";
import PopUpModal from "../ui/modal/modal";
import SubCategoryForm from "./subCategoryForm";
import UserTeamPermissionsPage from "../../routes/userPermission";

function SubCategoryTable({categoryId}) {

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state


  const { data, isLoading, error, refetch } = useGetData("subcategoryData", `/subcategories/bycategory/${categoryId}`, {});

  useEffect(() => {
        const timer = setTimeout(() => {
          setLoading(false);
        }, 3000); // 10 seconds delay
    
        return () => clearTimeout(timer); // Cleanup timeout on unmount
      }, []);

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setModalOpen(false);
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }
  
  if (data.length<1) {
    return <div className="text-text-color">No Sub-Category</div>;
  }

  console.log('subCategory',data);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Category Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Category Type</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {data?.map((category) => (
            <Table.Row key={category._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {category.subCategoryName}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {category.subCategoryType}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => openModal(category)}
                  >
                    Edit Sub-Category
                  </Dropdown.Item>
                  {/* <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete Category
                  </Dropdown.Item> */}
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Sub Category"}>
        <UserTeamPermissionsPage requiredModule={"SubCategories"} permission={"update"} page={<SubCategoryForm id={selectedTeam?._id} name={selectedTeam?.subCategoryName} industry={selectedTeam?.subCategoryType} category={selectedTeam?.category?._id} closeModal={closeModal} />} />
      </PopUpModal>

      <ToastContainer />
    </div>
  );
}

export default SubCategoryTable;
