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
    return <div>Error loading data</div>;
  }

  const totalPages = organizationData.pagination.totalPages;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Organization Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Currency</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Address</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Identification</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {organizationData.organizations.map((organization) => (
            <Table.Row key={organization._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {organization.name}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {organization.currency.code} ({organization.currency.symbol})
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {organization.addresses
                  .map((address) => `${address.street}, ${address.city}, ${address.country}`)
                  .join(" | ")}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {organization.identificationDetails
                  .map((id) => `${id.type}: ${id.number}`)
                  .join(" | ")}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
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
              currentPage === index + 1 ? "bg-nexa-orange" : "bg-gray-700"
            } text-white`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OrganizationTable;
