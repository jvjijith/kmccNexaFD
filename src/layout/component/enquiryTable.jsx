import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function EnquiryTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: enquiryData, isLoading, error, refetch } = useGetData(
    "EnquiryData",
    `/enquiry?page=${currentPage}&limit=${limit}`,
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

  const totalPages = enquiryData.pagination.totalPages;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-secondary-card text-text-color">
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Enquiry Number</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Customer Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Customer Email</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Customer Phone</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Enquiry Mode</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Created At</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {enquiryData.enquiries.map((enquiry) => (
            <Table.Row key={enquiry._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="whitespace-nowrap font-medium text-text-color">
                {enquiry.enquiryNumber}
              </Table.Cell>
              <Table.Cell className="text-text-color">{enquiry.customer.name}</Table.Cell>
              <Table.Cell className="text-text-color">{enquiry.customer.email}</Table.Cell>
              <Table.Cell className="text-text-color">{enquiry.customer.phone}</Table.Cell>
              <Table.Cell className="text-text-color">{enquiry.enquiryMode}</Table.Cell>
              <Table.Cell className="text-text-color">{new Date(enquiry.createdAt).toLocaleString()}</Table.Cell>
              <Table.Cell className="text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/enquiry/edit`, { state: { enquiry } })
                    }
                  >
                    Edit Enquiry
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

export default EnquiryTable;
