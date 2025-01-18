import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function OrganizationTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: organizationData, isLoading, error, refetch } = useGetData(
    "OrganizationData",
    `/organizations?page=${currentPage}&limit=${limit}`,
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

  const totalPages = organizationData.pagination.totalPages;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Organization Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Currency</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Address</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Identification</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {organizationData.organizations.map((organization) => (
            <Table.Row key={organization._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {organization.name}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {organization.currency.code} ({organization.currency.symbol})
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {organization.addresses
                  .map((address) => `${address.street}, ${address.city}, ${address.country}`)
                  .join(" | ")}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {organization.identificationDetails
                  .map((id) => `${id.type}: ${id.number}`)
                  .join(" | ")}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/organization/edit`, { state: { organization } })
                    }
                  >
                    Edit Organization
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
            } text-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OrganizationTable;
