import React, { useState, useEffect } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import UserForm from "./addUserForm";
import PopUpModal from "../ui/modal/modal";

function UserTable() {
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [superiors, setSuperiors] = useState({});
  const [loading, setLoading] = useState(true); // Loading state

  const { data: employeeData, isLoading, error, refetch } = useGetData("EmployeeData", "/employee", {});
  const { mutate: deactivateEmployee } = usePutData("deactivateEmployee", `/employee/deactivate/${selectedEmployee?.userId}`);
  const { mutate: activateEmployee } = usePutData("activateEmployee", `/employee/activate/${selectedEmployee?.userId}`);

  const navigate = useNavigate();

  useEffect(() => {
    if (employeeData?.employees && Array.isArray(employeeData.employees)) {
      const superiorNames = {};
      employeeData.employees.forEach((employee) => {
        const superior = employeeData.employees.find(e => e.metadataId === employee.superior);
        if (superior) {
          superiorNames[employee.metadataId] = superior.name;
        } else {
          superiorNames[employee.metadataId] = "Unknown";
        }
      });
      setSuperiors(superiorNames);
    }
  }, [employeeData]);

    // Simulate loading for 10 seconds before showing content
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };


  const handleEditUser = (employee) => {
    navigate("/admin/edituser", { state: { userId: employee.userId } });
  };

  const handleViewDetails = (employee) => {
    navigate(`/profile/${employee.userId}/details`);
  };

  const handleDeactivateEmployee = (employee) => {
    setSelectedEmployee(employee);
    setApiLoading(true);
    deactivateEmployee(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Employee ${employee.name} deactivated successfully!`, { toastId: `deactivate-${employee.userId}` });
          setApiLoading(false);
          setSelectedEmployee(null);
        },
        onError: (error) => {
          console.error("Error deactivating employee:", error);
          toast.error(`Error deactivating employee ${employee.name}`, { toastId: `deactivate-${employee.userId}` });
          setApiLoading(false);
          setSelectedEmployee(null);
        },
      }
    );
  };

  const handleActivateEmployee = (employee) => {
    setSelectedEmployee(employee);
    setApiLoading(true);
    activateEmployee(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Employee ${employee.name} activated successfully!`, { toastId: `activate-${employee.userId}` });
          setApiLoading(false);
          setSelectedEmployee(null);
        },
        onError: (error) => {
          console.error("Error activating employee:", error);
          toast.error(`Error activating employee ${employee.name}`, { toastId: `activate-${employee.userId}` });
          setApiLoading(false);
          setSelectedEmployee(null);
        },
      }
    );
  };

  if ( isLoading || loading ) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!Array.isArray(employeeData?.employees)) {
    return <div>Unexpected data format</div>;
  }

  const getUserRole = (admin, superAdmin) => {
    if (superAdmin) return "Super Admin";
    if (admin) return "Admin";
    return "User";
  };

  const getUserRoleColor = (role) => {
    switch (role) {
      case "Super Admin":
        return "text-red-500";
      case "Admin":
        return "text-green-500";
      case "User":
      default:
        return "text-text-color";
    }
  };

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">User Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Email</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">User Role</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Designation</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Superior</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Date of Joining</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {employeeData.employees.map((employee) => {
            const role = getUserRole(employee.admin, employee.superAdmin);
            return (
              <Table.Row key={employee.userId} className="border-gray-700 bg-secondary-card">
                <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                  {employee.name}
                </Table.Cell>
                <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                  {employee.email}
                </Table.Cell>
                <Table.Cell className={`whitespace-nowrap ${getUserRoleColor(role)}`}>
                  {role}
                </Table.Cell>
                <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                  {employee.designation}
                </Table.Cell>
                <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                  {superiors[employee.metadataId] || "Unknown"}
                </Table.Cell>
                <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                  {employee.dateOfJoining}
                </Table.Cell>
                <Table.Cell className={`whitespace-nowrap ${employee.activeUser ? "text-green-500" : "text-red-500"}`}>
                  {employee.activeUser ? "Active" : "Inactive"}
                </Table.Cell>
                <Table.Cell className="border-bordertext-text-color">
                  <Dropdown label="Actions" inline className="bg-secondary-ca
                  order-black">
                  {employee.superAdmin !== true && (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => openModal(employee)}
                    >
                      Edit User
                    </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleViewDetails(employee)}
                    >
                      Details
                    </Dropdown.Item>
                    {employee.activeUser ? (
                      <Dropdown.Item
                        className="text-text-color hover:!bg-orange-600"
                        onClick={() => handleDeactivateEmployee(employee)}
                      >
                        Deactivate User
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        className="text-text-color hover:!bg-orange-600"
                        onClick={() => handleActivateEmployee(employee)}
                      >
                        Activate User
                      </Dropdown.Item>
                    )}
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit User"}>
        <UserForm userId={selectedUser?.userId} name={selectedUser?.name} closeModal={closeModal}/>
      </PopUpModal>
    </div>
  );
}

export default UserTable;
