import React, { useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import PopUpModal from "../ui/modal/modal";
import TeamForm from "./teamForm"; 

function TeamTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const { data, isLoading, error } = useGetData("teamData", "/team", {});
  const navigate = useNavigate();

  const openModal = (teamId) => {
    setSelectedTeamId(teamId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeamId(null);
    setModalOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Team Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.teams.map((team) => (
            <Table.Row key={team.teamId} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {team.name}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => openModal(team.teamId)}
                  >
                    Edit Team
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => navigate(`/deactivateTeam/${team.teamId}`)}
                  >
                    Deactivate Team
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Team"}>
        {/* Modal Content */}
        <TeamForm id={selectedTeamId} />
      </PopUpModal>
    </div>
  );
}

export default TeamTable;
