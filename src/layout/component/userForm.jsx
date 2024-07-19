import React, { useState, useEffect } from 'react';
import { employeeDefault } from '../../constant';
import { useGetData, usePostData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";

function UserForm() {
  const [employeeData, setEmployeeData] = useState(employeeDefault);
  const { data: teamData, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useGetData("teamData", "/team/active", {});
  const { data: employeeDatas, isLoading: employeeLoading, error: employeeError, refetch: refetchEmployee } = useGetData("employeeData", "/employee/active", {});
  const { mutate: signup, isPending: isSigningUp, error: signupError } = usePostData("signup", "/auth/signup");
  const { mutate: addEmployee, isPending: isAdding, error: addError } = usePostData("addEmployee", "/employee/add");
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  useEffect(() => {
    refetchTeam();
    refetchEmployee();
  }, [refetchTeam, refetchEmployee]);

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
      'name', 'email', 'password', 'address', 'designation', 'superior',
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

    if (employeeData.password.length < 6) {
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

    const signupRequestBody = {
      email: employeeData.email,
      password: employeeData.password,
    };

    signup(signupRequestBody, {
      onSuccess: (signupResponse) => {
        const userId = signupResponse.uid;

        const addEmployeeRequestBody = {
          name: employeeData.name,
          email: employeeData.email,
          userId,
          teamId: employeeData.teamId,
          admin: employeeData.userRole === 'admin',
          superAdmin: employeeData.userRole === 'superAdmin',
          designation: employeeData.designation,
          superior: employeeData.superior,
          address: employeeData.address,
          passport: employeeData.passport,
          dateOfBirth: employeeData.dateOfBirth,
          dateOfJoining: employeeData.dateOfJoining,
          phoneNumber: employeeData.phoneNumber,
          activeUser: true,
          emergencyContact: emergencyContacts,
        };

        addEmployee(addEmployeeRequestBody, {
          onSuccess: () => {
            toast.success('Employee added successfully!');
            setEmployeeData(employeeDefault);
            setEmergencyContacts([]);
          },
          onError: (error) => {
            console.error("Error adding employee:", error);
            toast.error('Error adding employee.');
          },
        });
      },
      onError: (error) => {
        console.error("Error signing up:", error);
        toast.error('Error signing up.');
      },
    });
  };

  const teamOptions = [
    { value: null, label: "None" },
    ...(teamData?.teams?.map(team => ({
      value: team._id,
      label: team.name,
    })) || [])
  ];

  const employeeOptions = employeeDatas?.employees?.map(employee => ({
    value: employee.userId,
    label: employee.name,
  }));

 
  if (employeeLoading || teamLoading) {
    return <LoadingScreen />;
  }

  // if (teamError || employeeError || addError || signupError) {
  //   return <div>Error loading data</div>;
  // }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter User Name"
                autoComplete="off"
                value={employeeData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Email Address *</label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
              <label className="float-left inline-block mb-2 text-white">Password *</label>
              <input
                type="password"
                name="password"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Password"
                autoComplete="off"
                value={employeeData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Address *</label>
              <textarea
                name="address"
                className="block w-full px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Address"
                autoComplete="off"
                value={employeeData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Team *</label>
              <Select
                options={teamOptions}
                value={teamOptions?.find(option => option.value === employeeData.teamId)}
                onChange={(selectedOption) => setEmployeeData(prevState => ({ ...prevState, teamId: selectedOption.value }))}
                isLoading={teamLoading}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'black',
                    borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                    borderBottomWidth: '2px',
                    borderRadius: '0px',
                    height: '40px', // h-10: 2.5rem = 40px
                    paddingLeft: '8px', // px-2: 0.5rem = 8px
                    paddingRight: '8px', // px-2: 0.5rem = 8px
                    color: 'white'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'black',
                    color: 'white',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                    color: state.isSelected ? 'black' : 'white',
                    cursor: 'pointer'
                  })
                }}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Designation *</label>
              <input
                type="text"
                name="designation"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Designation"
                autoComplete="off"
                value={employeeData.designation}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Superior *</label>
              <Select
                options={employeeOptions}
                value={employeeOptions?.find(option => option.value === employeeData.superior)}
                onChange={(selectedOption) => setEmployeeData(prevState => ({ ...prevState, superior: selectedOption.value }))}
                isLoading={employeeLoading}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'black',
                    borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                    borderBottomWidth: '2px',
                    borderRadius: '0px',
                    height: '40px', // h-10: 2.5rem = 40px
                    paddingLeft: '8px', // px-2: 0.5rem = 8px
                    paddingRight: '8px', // px-2: 0.5rem = 8px
                    color: 'white'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'black',
                    color: 'white',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                    color: state.isSelected ? 'black' : 'white',
                    cursor: 'pointer'
                  })
                }}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Passport </label>
              <input
                type="text"
                name="passport"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Passport"
                autoComplete="off"
                value={employeeData.passport}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                autoComplete="off"
                value={employeeData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
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
              <label className="float-left inline-block mb-2 text-white">Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Phone Number"
                autoComplete="off"
                value={employeeData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">User Role *</label>
              <select
                name="userRole"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                value={employeeData.userRole}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">Super Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block w-full mb-2 text-white">Emergency Contacts</label>
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex flex-wrap p-4 mb-4 bg-nexa-gray">
              <div className="w-full sm:w-1/3 p-4">
                <input
                  type="text"
                  name={`emergencyContactName${index}`}
                  className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Contact Name"
                  value={contact.name}
                  onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3 p-4">
                <input
                  type="text"
                  name={`emergencyContactPhone${index}`}
                  className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Contact Phone"
                  value={contact.phone}
                  onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3 p-4">
                <input
                  type="text"
                  name={`emergencyContactRelationship${index}`}
                  className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                  placeholder="Contact Relationship"
                  value={contact.relationship}
                  onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3 p-4">
                <button type="button" onClick={() => deleteEmergencyContact(index)} className="bg-black text-white px-4 py-2 rounded">Delete</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEmergencyContact} className="bg-black text-white px-4 py-2 rounded">Add Emergency Contact</button>
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">Add Employee</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default UserForm;
