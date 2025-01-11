import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function CustomerTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination: current page
  const limit = 10; // Limit: items per page
  
  // Fetch customer data with pagination
  const { data: customerData, isLoading, error, refetch } = useGetData(
    "CustomerData", 
    `/customer?page=${currentPage}&limit=${limit}`, 
    {}
  );

  const { mutate: deactivateCustomer } = usePutData(
    "deactivateCustomer", 
    `/customer/deactivate/${selectedCustomer?._id}`
  );
  
  const { mutate: activateCustomer } = usePutData(
    "activateCustomer", 
    `/customer/activate/${selectedCustomer?._id}`
  );

  const navigate = useNavigate();

  // Simulate loading for 3 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalOpen(false);
  };

  const handleViewDetails = (customer) => {
    navigate(`/profile/${customer._id}/customerdetails`, { state: { customer } });
  };

  const handleDeactivateCustomer = (customer) => {
    setSelectedCustomer(customer);
    setApiLoading(true);
    deactivateCustomer(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Customer ${customer.name} deactivated successfully!`);
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating customer:", error);
          toast.error(`Error deactivating customer ${customer.name}`);
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivateCustomer = (customer) => {
    setSelectedCustomer(customer);
    setApiLoading(true);
    activateCustomer(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Customer ${customer.name} activated successfully!`);
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating customer:", error);
          toast.error(`Error activating customer ${customer.name}`);
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);  // Update the current page state
  };

  // Fetch new data when currentPage changes
  useEffect(() => {
    refetch();  // Refetch data after currentPage is updated
  }, [currentPage, refetch]);  // Refetch when currentPage changes

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const totalPages = Math.ceil(customerData.pagination.totalCount / limit); // Calculate total pages

  console.log(customerData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Customer name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Country</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Category</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">State</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Location</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {customerData?.customers.map((customer, index) => (
            <Table.Row key={index} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">{customer.name}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{customer.country}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{customer.category?.categoryName || "N/A"}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{customer.state}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{customer.location}</Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${customer.active ? "text-green-500" : "text-red-500"}`}>
                {customer.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => handleViewDetails(customer)}>Details</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/customer/edit`, { state: { customer } })}>Edit Customer</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/customer/editContact`, { state: { customer } })}>Edit Contacts</Dropdown.Item>
                  {customer.active ? (
                    <Dropdown.Item onClick={() => handleDeactivateCustomer(customer)}>Deactivate Customer</Dropdown.Item>
                  ) : (
                    <Dropdown.Item onClick={() => handleActivateCustomer(customer)}>Activate Customer</Dropdown.Item>
                  )}
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
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"} text-btn-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CustomerTable;
