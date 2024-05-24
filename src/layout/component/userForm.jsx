import React, { useState } from 'react';
import { employeeDefault } from '../../constant';
import { usePostData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';

function UserForm() {
  const [employeeData, setEmployeeData] = useState(employeeDefault);
  const { mutate: addEmployee, isPending: isAdding, error: addError } = usePostData("addEmployee", "/employee/add");
  const { mutate: signup, isPending: isSigningUp, error: signupError } = usePostData("signup", "/auth/signup");
  const [emergencyContacts, setEmergencyContacts] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

     // Check if all fields are filled
     const requiredFields = ['name', 'email', 'password', 'address', 'teamId', 'designation', 'superior', 'passport', 'dob', 'doj', 'phoneNumber', 'userRole'];
     const missingFields = requiredFields.filter(field => !employeeData[field]);
 
     if (missingFields.length > 0) {
       // Show notification for missing fields
       toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
       return;
     }
 

    const signupRequestBody = {
      email: employeeData.email,
      password: employeeData.password,
    };

    signup(signupRequestBody, {
      onSuccess: (signupResponse) => {
        const userId = signupResponse.uid; // Extract uid from the signup response

        const addEmployeeRequestBody = {
          name: employeeData.name,
          userId,
          teamId: employeeData.teamId,
          admin: employeeData.userRole === 'admin',
          superAdmin: employeeData.userRole === 'superAdmin',
          designation: employeeData.designation,
          superior: employeeData.superior,
          address: employeeData.address,
          passport: employeeData.passport,
          dateOfBirth: employeeData.dob,
          dateOfJoining: employeeData.doj,
          phoneNumber: employeeData.phoneNumber,
          activeUser: true,
          emergencyContact: emergencyContacts,
        };

        addEmployee(addEmployeeRequestBody, {
          onSuccess: () => {
            // Show success notification
            toast.success('Employee added successfully!');
            
            // Reset form fields after submission
            setEmployeeData(employeeDefault);
            setEmergencyContacts([]);
          },
          onError: (error) => {
            console.error("Error adding employee:", error);
          },
        });
      },
      onError: (error) => {
        console.error("Error signing up:", error);
      },
    });
  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Name *&nbsp;</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter User Name"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.name}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Email Address *&nbsp;</label>
              <input
                type="email"
                name="email"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Email Address"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.email}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Password *&nbsp;</label>
              <input
                type="password"
                name="password"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Password"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.password}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Address *&nbsp;</label>
              <textarea
                name="address"
                className="block w-full px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Address"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.address}
                onChange={handleChange}
              ></textarea>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Team ID *&nbsp;</label>
              <input
                type="text"
                name="teamId"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Team ID"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.teamId}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Designation *&nbsp;</label>
              <input
                type="text"
                name="designation"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Designation"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.designation}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Superior *&nbsp;</label>
              <input
                type="text"
                name="superior"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Superior Name"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.superior}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Passport *&nbsp;</label>
              <input
                type="text"
                name="passport"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Passport Number"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.passport}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Date Of Birth *&nbsp;</label>
              <input
                type="date"
                name="dob"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Date of Birth"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.dob}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Date Of Joining *&nbsp;</label>
              <input
                type="date"
                name="doj"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Date of Joining"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.doj}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;Phone Number *&nbsp;</label>
              <input
                type="text"
                name="phoneNumber"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Phone Number"
                autoComplete="off"
                style={{ textAlign: 'initial' }}
                value={employeeData.phoneNumber}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>
        
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">&nbsp;User Role *&nbsp;</label>
              <select
                name="userRole"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                value={employeeData.userRole}
                onChange={handleChange}
              >
                <option value="">Select User Role</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">Super Admin</option>
              </select>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="w-full p-4">
          <label className="block mb-2 text-white">&nbsp;Emergency Contact *&nbsp;</label>
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="mb-4 flex flex-wrap sm:flex-nowrap items-center">
              <input
                type="text"
                name="name"
                className="block w-full sm:w-1/3 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white mb-2 sm:mb-0"
                placeholder="Contact Name"
                value={contact.name}
                onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                name="phone"
                className="block w-full sm:w-1/3 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white mb-2 sm:mb-0 sm:ml-2"
                placeholder="Contact Phone"
                value={contact.phone}
                onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
              />
              <input
                type="text"
                name="relationship"
                className="block w-full sm:w-1/3 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white mb-2 sm:mb-0 sm:ml-2"
                placeholder="Relationship"
                value={contact.relationship}
                onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
              />
              <button
                type="button"
                className="bg-black hover:bg-black text-white px-2 py-1 rounded ml-2"
                onClick={() => deleteEmergencyContact(index)}
              >
                Delete
              </button>
            </div>
          ))}
          <button type="button" className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded" onClick={addEmergencyContact}>
            Add Emergency Contact
          </button>
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange hover:bg-green-400 text-white px-4 py-2 rounded">
            {isAdding ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </form>

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
}

export default UserForm;
