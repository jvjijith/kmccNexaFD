import { useEffect, useState } from "react";
import { Dropdown, Table, Modal, Button } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

// Event Registrations Table Component
function EventRegistrationsTable({ eventId, eventName, isOpen, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: registrationData, isLoading, error, refetch } = useGetData(
    "EventRegistrations",
    `/event-registrations/event/${eventId}?page=${currentPage}&limit=${limit}`,
    { enabled: isOpen && !!eventId }
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (isOpen && eventId) {
      refetch();
    }
  }, [currentPage, isOpen, eventId, refetch]);

  if (!isOpen) return null;

  const totalPages = registrationData?.pagination?.totalPages || 0;

  return (
    <Modal show={isOpen} onClose={onClose} size="7xl">
      <Modal.Header>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          Registrations for: {eventName}
        </h3>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">Error loading registrations</div>
        ) : !registrationData?.registrations?.length ? (
          <div className="text-gray-500 text-center py-8">No registrations found for this event</div>
        ) : (
          <div className="overflow-x-auto">
            <Table theme={{ dark: true }} className="border border-border rounded-lg">
              <Table.Head className="bg-secondary-card text-text-color">
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Email</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Price</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Currency</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Payment Status</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Registration Date</Table.HeadCell>
                <Table.HeadCell className="border-border bg-table-heading text-text-color">Event Data</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border">
                {registrationData.registrations.map((registration) => (
                  <Table.Row key={registration._id} className="border-gray-700 bg-secondary-card">
                    <Table.Cell className="border-border whitespace-nowrap font-medium text-text-color">
                      {registration.email}
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      ${registration.price}
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      {registration.currency}
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      <span className={`px-2 py-1 rounded text-xs ${
                        registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {registration.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      <span className={`px-2 py-1 rounded text-xs ${
                        registration.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        registration.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {registration.paymentStatus}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      {new Date(registration.registrationDate).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="border-border text-text-color">
                      {registration.eventData && registration.eventData.length > 0 ? (
                        <div className="space-y-1">
                          {registration.eventData.slice(0, 2).map((field, index) => (
                            <div key={index} className="text-xs">
                              <strong>{field.fieldName}:</strong> {
                                typeof field.fieldValue === 'object' 
                                  ? JSON.stringify(field.fieldValue) 
                                  : field.fieldValue
                              }
                            </div>
                          ))}
                          {registration.eventData.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{registration.eventData.length - 2} more fields
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No data</span>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function EventTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
  };

  const handleCloseRegistrations = () => {
    setShowRegistrations(false);
    setSelectedEvent(null);
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
                  <Dropdown.Item onClick={() => handleViewRegistrations(event)}>
                    View Registrations
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

      {/* Event Registrations Modal */}
      <EventRegistrationsTable
        eventId={selectedEvent?._id}
        eventName={selectedEvent?.name}
        isOpen={showRegistrations}
        onClose={handleCloseRegistrations}
      />
    </div>
  );
}

export default EventTable;