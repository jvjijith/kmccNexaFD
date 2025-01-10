import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function ElementTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: elementData, isLoading, error, refetch } = useGetData(
    "ElementData",
    `/elements?page=${currentPage}&limit=${limit}`,
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

  const totalPages = Math.ceil(elementData.pagination.totalCount / limit);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-secondary-card text-text-color">
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Component Type</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Reference Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Web Items</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Android Items</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">iOS Items</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {elementData?.elements.map((element, index) => (
            <Table.Row key={index} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="whitespace-nowrap font-medium text-text-color">
                {element.componentType}
              </Table.Cell>
              <Table.Cell className="text-text-color">{element.referenceName}</Table.Cell>
              <Table.Cell className="text-text-color">{element.numberItems.web}</Table.Cell>
              <Table.Cell className="text-text-color">{element.numberItems.android}</Table.Cell>
              <Table.Cell className="text-text-color">{element.numberItems.iOS}</Table.Cell>
              <Table.Cell className="text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => navigate(`/element/edit`, { state: { element } })}>Edit Element</Dropdown.Item>
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
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"} text-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ElementTable;
