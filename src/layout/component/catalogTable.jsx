import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import PopUpModal from "../ui/modal/modal";
import TeamForm from "./teamForm";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import Pagination from "../ui/pagination/Pagination";

function CatalogTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useGetData("teamData", `/catalogues?page=${currentPage}&limit=${limit}`, {});

    // Simulate loading for 10 seconds before showing content
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

  const navigate = useNavigate();

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setModalOpen(false);
  };

  const totalPages = Math.ceil((data?.pagination?.totalCount || 0) / limit);
  
  

  if (isLoading||loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  console.log(data);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Catalog Name</Table.HeadCell>
          {/* <Table.HeadCell className="border-border bg-table-heading text-text-color">Catalog Type</Table.HeadCell> */}
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {data?.catalogues?.map((team) => (
            <Table.Row key={team.teamId} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {team.name}
              </Table.Cell>
              {/* <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {team.catType}
              </Table.Cell> */}
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/catalog/edit`, { state: { catalog: team } })}
                  >
                    Edit Catalog
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

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Team"}>
        <TeamForm id={selectedTeam?.teamId} name={selectedTeam?.name} closeModal={closeModal} />
      </PopUpModal>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />
    </div>
  );
}

export default CatalogTable;
