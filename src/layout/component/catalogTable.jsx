import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import PopUpModal from "../ui/modal/modal";
import TeamForm from "./teamForm";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';

function CatalogTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const { data, isLoading, error, refetch } = useGetData("teamData", "/catalogues", {});

    // Simulate loading for 10 seconds before showing content
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

  const navigate = useNavigate();

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setModalOpen(false);
  };

  
  

  if (isLoading||loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  console.log(data);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Catalog Name</Table.HeadCell>
          {/* <Table.HeadCell className="border-gray-700 bg-black text-white">Catalog Type</Table.HeadCell> */}
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data?.catalogues?.map((team) => (
            <Table.Row key={team.teamId} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {team.name}
              </Table.Cell>
              {/* <Table.Cell className="whitespace-nowrap font-medium text-white">
                {team.catType}
              </Table.Cell> */}
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => navigate(`/catalog`, { state: { catalog: team } })}
                  >
                    Edit Catalog
                  </Dropdown.Item>
                 
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Team"}>
        <TeamForm id={selectedTeam?.teamId} name={selectedTeam?.name} closeModal={closeModal} />
      </PopUpModal>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />
    </div>
  );
}

export default CatalogTable;
