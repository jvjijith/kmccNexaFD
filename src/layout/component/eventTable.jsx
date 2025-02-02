import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function EventTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: eventData, isLoading, error, refetch } = useGetData(
    "EventData",
    `/events?page=${currentPage}&limit=${limit}`,
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

  const totalPages = eventData.pagination.totalPages;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }} className="border border-border rounded-lg">
        <Table.Head className="bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Event Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Description</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Location</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Start Date</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">End Date</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Seats Available</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Price</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {eventData.events.map((event) => (
            <Table.Row key={event._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-border whitespace-nowrap font-medium text-text-color">
                {event.name}
              </Table.Cell>
              <Table.Cell className="border-border text-text-color">{event.description}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{event.location}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{new Date(event.startingDate).toLocaleString()}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{new Date(event.endingDate).toLocaleString()}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{event.seatsAvailable}</Table.Cell>
              <Table.Cell className="border-border text-text-color">${event.priceConfig.amount}</Table.Cell>
              <Table.Cell className="border-border text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => navigate(`/event/edit`, { state: { event } })}>
                    Edit Event
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

export default EventTable;
