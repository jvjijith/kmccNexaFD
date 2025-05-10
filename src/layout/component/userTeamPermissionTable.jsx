import { useEffect, useState } from "react";
import { Button, Dropdown, Modal, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function UserTeamPermissionTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: userTeamPermissionsData, isLoading, error, refetch } = useGetData(
    "userteampermissions",
    `/user-team-permissions?page=${currentPage}&limit=${limit}`,
    {}
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  const { userTeamPermissions, pagination } = userTeamPermissionsData;
  const totalPages = Math.ceil(pagination.totalCount / limit);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Reference Name</Table.HeadCell>
          {/* <Table.HeadCell className="border-border bg-table-heading text-text-color">Allowed Modules</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Allowed Employees</Table.HeadCell> */}
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {userTeamPermissions.map((permission) => (
            <Table.Row key={permission._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {permission.referenceName}
              </Table.Cell>
              {/* <Table.Cell className="border-bordertext-text-color">
                <ul>
                  {permission.allowedModules.map((module) => (
                    <li key={module._id}>
                      <strong>{module.moduleId.moduleName}:</strong> {module.allowedOperations.join(", ")}
                    </li>
                  ))}
                </ul>
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <ul>
                  {permission.empAllowed.map((employee) => (
                    <li key={employee._id}>{employee.email}</li>
                  ))}
                </ul>
              </Table.Cell> */}
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/permission/edit`, { state: { permission } })
                    }
                  >
                    Edit Permission
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"
            } text-btn-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default UserTeamPermissionTable;
