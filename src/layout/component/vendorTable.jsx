import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function VendorTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination: current page
  const [limit] = useState(10); // Pagination: items per page

  const { data: vendorData, isLoading, error, refetch } = useGetData(
    "VendorData",
    `/vendor?page=${currentPage}&limit=${limit}`,
    {}
  );

  const { mutate: deactivateVendor } = usePutData(
    "deactivateVendor", 
    `/vendor/deactivate/${selectedVendor?._id}`
  );
  
  const { mutate: activateVendor } = usePutData(
    "activateVendor", 
    `/vendor/activate/${selectedVendor?._id}`
  );


  const navigate = useNavigate();

  // Simulate loading for 10 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, []);

  const openModal = (vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setModalOpen(false);
  };

  const handleDeactivateVendor = (vendor) => {
    setSelectedVendor(vendor);
    setApiLoading(true);
    deactivateVendor(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Vendor ${vendor.name} deactivated successfully!`, { toastId: `deactivate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating vendor:", error);
          toast.error(`Error deactivating vendor ${vendor.name}`, { toastId: `deactivate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleViewDetails = (vendor) => {
    navigate(`/profile/${vendor._id}/customerdetails`, { state: { vendor } });
    console.log(vendor._id);
  };

  const handleActivateVendor = (vendor) => {
    setSelectedVendor(vendor);
    setApiLoading(true);
    activateVendor(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Vendor ${vendor.name} activated successfully!`, { toastId: `activate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating vendor:", error);
          toast.error(`Error activating vendor ${vendor.name}`, { toastId: `activate-${vendor._id}` });
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

  // Check if vendorData exists and is an array
  const vendorsArray = Array.isArray(vendorData?.customers) ? vendorData.customers : [];

  if (!vendorsArray.length) {
    return <div>No vendors available</div>;
  }

  const totalPages = Math.ceil(vendorData.pagination.totalCount / limit); // Calculate total pages

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className="bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Vendor name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Country</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Category</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">State</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Location</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {vendorsArray.map((vendor, index) => (
            <Table.Row key={index} className="bg-secondary-card">
              <Table.Cell className="border-border whitespace-nowrap font-medium text-text-color">{vendor.name}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{vendor.country}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{vendor.category.categoryName}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{vendor.state}</Table.Cell>
              <Table.Cell className="border-border text-text-color">{vendor.location}</Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${vendor.active ? "text-green-500" : "text-red-500"}`}>
                {vendor.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="border-border text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleViewDetails(vendor)}
                  >
                    Details
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/vendor/edit`, { state: { vendor } })}
                  >
                    Edit vendor
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/vendor/editContact`, { state: { vendor } })}
                  >
                    Edit Contacts
                  </Dropdown.Item>
                  {vendor.active ? (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleDeactivateVendor(vendor)}
                    >
                      Deactivate Vendor
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleActivateVendor(vendor)}
                    >
                      Activate Vendor
                    </Dropdown.Item>
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

export default VendorTable;
