import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import CategoryForm from "./categoryForm";
import PopUpModal from "../ui/modal/modal";
import { useNavigate } from "react-router";
import SubCategoryForm from "./subCategoryForm";
import UserTeamPermissionsPage from "../../routes/userPermission";
import Pagination from "../ui/pagination/Pagination";

function CategoryTable({nav}) {
  
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useGetData(
    "categoryData", 
    `/category?page=${currentPage}&limit=${limit}`, 
    {}
  );

  // Simulate loading for 3 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch new data when currentPage changes
  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

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

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  const totalPages = Math.ceil((data?.pagination?.totalCount || 0) / limit);

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
          {data?.categories?.map((category) => (
            <Table.Row key={category._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {category.categoryName}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {category.categoryType}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => openModal(category)}
                  >
                    Edit Category
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/${nav}/category/subcategory`, { state: { category } })}
                  >
                    Show Sub-Category
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Category"}>
        <UserTeamPermissionsPage requiredModule={"categories"} permission={"update"} page={<CategoryForm id={selectedTeam?._id} name={selectedTeam?.categoryName} industry={selectedTeam?.categoryType} closeModal={closeModal} />} />
      </PopUpModal>

      <PopUpModal isOpen={isSubModalOpen} onClose={closeSubModal} title={"Add Sub Category"}>
        <UserTeamPermissionsPage requiredModule={"SubCategories"} permission={"create"} page={<SubCategoryForm  category={selectedTeam?._id} closeModal={closeSubModal} />} />
      </PopUpModal>

      <ToastContainer />
    </div>
  );
}

export default CategoryTable;