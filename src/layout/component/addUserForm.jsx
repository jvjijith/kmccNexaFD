import React, { useState, useEffect } from 'react';
import { employeeDefault } from '../../constant';
import { useGetData, usePutData } from '../../common/api';
import { toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";

function UserForm({ userId }) {
  const [employeeData, setEmployeeData] = useState(employeeDefault);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useGetData("teamData", "/team/active", {});
  const { data: employeeDatas, isLoading: employeeLoading, refetch: refetchEmployee } = useGetData("employeeData", "/employee/active", {});
  const { data: employeeDetail, isLoading: employeeDetailLoading, refetch: refetchEmployeeDetail } = useGetData("Employee", `/employee/user/${userId}`);
  const { mutate: editEmployee, isPending: isAdding, error: addError } = usePutData("editEmployee", `/employee/update/user/${userId}`);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    refetchTeam();
    refetchEmployee();
    refetchEmployeeDetail();
  }, [refetchTeam, refetchEmployee, refetchEmployeeDetail]);

  useEffect(() => {
    if (employeeDetail) {
      setEmployeeData(employeeDetail);
      setEmergencyContacts(employeeDetail.emergencyContact || []);
    }
  }, [employeeDetail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = emergencyContacts.map((contact, i) => {
      if (i === index) {
        return { ...contact, [field]: value };
      }
      return contact;
    });
    setEmergencyContacts(updatedContacts);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relationship: '' }]);
  };

  const deleteEmergencyContact = (index) => {
    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updatedContacts);
  };

  const validateFields = () => {
    const requiredFields = [
      'name', 'email', 'address', 'designation', 'superior',
      'dateOfBirth', 'dateOfJoining', 'phoneNumber', 'userRole'
    ];

    for (const field of requiredFields) {
      if (!employeeData[field]) {
        toast.error(`Please fill in all required fields: ${field}`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(employeeData.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (employeeData.password && employeeData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }

    if (!/^\d{10}$/.test(employeeData.phoneNumber)) {
      toast.error('Phone number must be 10 digits.');
      return false;
    }

    for (const contact of emergencyContacts) {
      if (!contact.name || !contact.phone || !contact.relationship) {
        toast.error('Please fill in all emergency contact fields.');
        return false;
      }

      if (!/^\d{10}$/.test(contact.phone)) {
        toast.error('Emergency contact phone number must be 10 digits.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    const updateEmployeeRequestBody = {
      name: employeeData.name,
      email: employeeData.email,
      userId: employeeData.userId,
      teamId: employeeData.teamId,
      admin: employeeData.admin,
      superAdmin: employeeData.superAdmin,
      designation: employeeData.designation,
      superior: employeeData.superior,
      address: employeeData.address,
      passport: employeeData.passport,
      dateOfBirth: employeeData.dateOfBirth,
      dateOfJoining: employeeData.dateOfJoining,
      phoneNumber: employeeData.phoneNumber,
      activeUser: employeeData.activeUser,
      emergencyContact: emergencyContacts,
    };

    editEmployee(updateEmployeeRequestBody, {
      onSuccess: () => {
        toast.success('Employee updated successfully!');
        setEmployeeData(employeeDefault);
        setEmergencyContacts([]);
      },
      onError: (error) => {
        console.error("Error updating employee:", error);
        toast.error('Error updating employee.');
      },
    });
  };

  const teamOptions = [
    { value: null, label: "None" },
    ...(teamData?.teams?.map(team => ({
      value: team.teamId,
      label: team.name,
    })) || [])
  ];

  const employeeOptions = employeeDatas?.employees?.map(employee => ({
    value: employee.metadataId,
    label: employee.name,
  }));

  const userRoleOptions = [
    { value: 'superAdmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ];

  const handleUserRoleChange = (selectedOption) => {
    const { value } = selectedOption;
    setEmployeeData(prevState => ({
      ...prevState,
      userRole: value,
      superAdmin: value === 'superAdmin',
      admin: value === 'admin',
    }));
  };

  useEffect(() => {
    if (employeeDetail) {
      const role = employeeDetail.superAdmin ? 'superAdmin' : (employeeDetail.admin ? 'admin' : 'user');
      setEmployeeData(prevState => ({
        ...prevState,
        userRole: role
      }));
    }
  }, [employeeDetail]);

  if (employeeLoading || teamLoading || employeeDetailLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter User Name"
                autoComplete="off"
                value={employeeData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Email Address *</label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Email Address"
                autoComplete="off"
                value={employeeData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Address *</label>
              <textarea
                name="address"
                className="block w-full px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Address"
                autoComplete="off"
                value={employeeData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">Team *</label>
              <Select
                options={teamOptions}
                value={teamOptions?.find(option => option.value === employeeData.teamId)}
                onChange={(selectedOption) => setEmployeeData(prevState => ({ ...prevState, teamId: selectedOption.value }))}
                isLoading={teamLoading}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'black',
                    borderColor: state.isFocused ? 'white' : 'black', // border-border: #D3D3D3
                    borderBottomWidth: '2px',
                    borderRadius: '0',
                    minHeight: '40px',
                    color: 'white'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'black',
                    color: 'white'
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white'
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Designation *</label>
              <input
                type="text"
                name="designation"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Designation"
                autoComplete="off"
                value={employeeData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">Superior *</label>
              <Select
                options={employeeOptions}
                value={employeeOptions?.find(option => option.value === employeeData.superior)}
                onChange={(selectedOption) => setEmployeeData(prevState => ({ ...prevState, superior: selectedOption.value }))}
                isLoading={employeeLoading}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'black',
                    borderColor: state.isFocused ? 'white' : 'black', // border-border: #D3D3D3
                    borderBottomWidth: '2px',
                    borderRadius: '0',
                    minHeight: '40px',
                    color: 'white'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'black',
                    color: 'white'
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white'
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                autoComplete="off"
                value={employeeData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                autoComplete="off"
                value={employeeData.dateOfJoining}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Phone Number"
                autoComplete="off"
                value={employeeData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">User Role *</label>
              <Select
                options={userRoleOptions}
                value={userRoleOptions.find(option => option.value === employeeData.userRole)}
                onChange={handleUserRoleChange}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'black',
                    borderColor: state.isFocused ? 'white' : 'black',
                    borderBottomWidth: '2px',
                    borderRadius: '0',
                    minHeight: '40px',
                    color: 'white'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'black',
                    color: 'white'
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white'
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Passport</label>
              <input
                type="text"
                name="passport"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Passport"
                autoComplete="off"
                value={employeeData.passport}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Active User</label>
              <input
                type="checkbox"
                name="activeUser"
                className="float-left h-5 w-5 text-blue-600"
                checked={employeeData.activeUser}
                onChange={(e) => setEmployeeData(prevState => ({ ...prevState, activeUser: e.target.checked }))}
              />
            </div>
          </div> */}
        </div>

        <div className="flex flex-wrap">
          <div className="w-full p-4">
            <h3 className="text-text-color mb-2">Emergency Contacts</h3>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex flex-wrap mb-4">
                <div className="w-full sm:w-1/3 p-2">
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <input
                    type="tel"
                    className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                    placeholder="Relationship"
                    value={contact.relationship}
                    onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-auto p-2">
                  <button
                    type="button"
                    className="h-10 px-4 text-text-color border border-white rounded focus:outline-none hover:secondary-card hover:text-text-color transition"
                    onClick={() => deleteEmergencyContact(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="h-10 px-4 mb-4 text-text-color border border-white rounded focus:outline-none hover:bg-white hover:text-text-color transition"
              onClick={addEmergencyContact}
            >
              Add Emergency Contact
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 px-4 text-text-color bg-primary-button-color rounded hover:bg-primary-button-color transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserForm;
