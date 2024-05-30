import React, { useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import PopUpModal from "../ui/modal/modal";
import TeamForm from "./teamForm";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';

function TeamTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);

  const { data, isLoading, error, refetch } = useGetData("teamData", "/team", {});
  const { mutate: deactivateTeam } = usePutData("deactivateTeam", `/team/deactivate/${selectedTeam?.teamId}`);
  const { mutate: activateTeam } = usePutData("activateTeam", `/team/activate/${selectedTeam?.teamId}`);

  const navigate = useNavigate();

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setModalOpen(false);
  };

  const handleDeactivateTeam = (team) => {
    setSelectedTeam(team);
    setApiLoading(true);
    deactivateTeam(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Team ${team.name} deactivated successfully!`, { toastId: `deactivate-${team.teamId}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating team:", error);
          toast.error(`Error deactivating team ${team.name}`, { toastId: `deactivate-${team.teamId}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivateTeam = (team) => {
    setSelectedTeam(team);
    setApiLoading(true);
    activateTeam(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Team ${team.name} activated successfully!`, { toastId: `activate-${team.teamId}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating team:", error);
          toast.error(`Error activating team ${team.name}`, { toastId: `activate-${team.teamId}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
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
          <Table.HeadCell className="border-gray-700 bg-black text-white">Team Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.teams.map((team) => (
            <Table.Row key={team.teamId} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {team.name}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${team.active ? "text-green-500" : "text-red-500"}`}>
                {team.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => openModal(team)}
                  >
                    Edit Team
                  </Dropdown.Item>
                  {team.active ? (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleDeactivateTeam(team)}
                    >
                      Deactivate Team
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleActivateTeam(team)}
                    >
                      Activate Team
                    </Dropdown.Item>
                  )}
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

export default TeamTable;
