import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function ContainerTable() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: containerData, isLoading, error, refetch } = useGetData(
    "ContainerData",
    `/containers?page=${currentPage}&limit=${limit}`,
    {}
  );


  const navigate = useNavigate();

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

  const totalPages = Math.ceil(containerData.pagination.totalCount / limit);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Reference Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Description</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Layout Type</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Publish Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {containerData?.containers.map((container, index) => (
            <Table.Row key={index} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">{container.referenceName}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{container.description}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{container.layoutOptions?.layout || "N/A"}</Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${container.publish ? "text-green-500" : "text-red-500"}`}>
                {container.publish ? "Published" : "Draft"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => navigate(`/container/edit`, { state: { container } })}>Edit Container</Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-center mt-4">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"} text-btn-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContainerTable;
