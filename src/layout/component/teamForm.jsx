import React, { useState, useEffect } from "react";
import { teamDefault } from "../../constant";
import { usePostData, usePutData } from "../../common/api";

function TeamForm({ id, name, closeModal }) {
  const [teamData, setTeamData] = useState(teamDefault);

  useEffect(() => {
    if (name) {
      setTeamData((prevState) => ({
        ...prevState,
        teamName: name,
      }));
    }
  }, [name]);

  const { mutate: addTeam, isPending: isAdding, error: addError } = usePostData("addTeam", "/team/add");
  const { mutate: editTeam, isPending: isEditing, error: editError } = usePutData("editTeam", `/team/update/${id}`);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      editTeam(
        { name: teamData.teamName },
        {
          onSuccess: () => {
            
            closeModal();
          },
          onError: (error) => {
            
            closeModal();
          },
        }
      );
    } else {
      addTeam(
        { name: teamData.teamName },
        {
          onSuccess: () => {
            
            closeModal();
          },
          onError: (error) => {
            
            closeModal();
          },
        }
      );
    }
    setTeamData(teamDefault); // Reset the form to default state
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">
                &nbsp;Team Name *&nbsp;
              </label>
              <input
                type="text"
                name="teamName"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Your Team Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
                value={teamData.teamName || ""}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end p-4">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-text-color px-4 py-2 rounded">
              {id ? "Update Team" : "Add Team"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeamForm;
