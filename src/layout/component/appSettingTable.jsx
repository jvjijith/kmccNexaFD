import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function AppTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination: current page
  const limit = 10; // Limit: items per page
  
  // Fetch app data with pagination
  const { data: AppData, isLoading, error, refetch } = useGetData(
    "AppData", 
    `/app?page=${currentPage}&limit=${limit}`, 
    {}
  );

  const { mutate: deactivateApp } = usePutData(
    "deactivateApp", 
    `/app/deactivate/${selectedApp?._id}`
  );
  
  const { mutate: activateApp } = usePutData(
    "activateApp", 
    `/app/activate/${selectedApp?._id}`
  );

  const navigate = useNavigate();

  // Simulate loading for 3 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const openModal = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedApp(null);
    setModalOpen(false);
  };

  const handleDeactivateApp = (app) => {
    setSelectedApp(app);
    setApiLoading(true);
    deactivateApp(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`App ${app.title} deactivated successfully!`);
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating app:", error);
          toast.error(`Error deactivating app ${app.title}`);
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivateApp = (app) => {
    setSelectedApp(app);
    setApiLoading(true);
    activateApp(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`App ${app.title} activated successfully!`);
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating app:", error);
          toast.error(`Error activating app ${app.title}`);
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

  const totalPages = Math.ceil(AppData.pagination.totalCount / limit); // Calculate total pages

  console.log(AppData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-secondary-card text-text-color">
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">App Title</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">App Type</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Geo Location</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Domain</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Language</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {AppData?.apps.map((app, index) => (
            <Table.Row key={index} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="whitespace-nowrap font-medium text-text-color">{app.title}</Table.Cell>
              <Table.Cell className="text-text-color">{app.appType}</Table.Cell>
              <Table.Cell className="text-text-color">{app.settings.geo?.map(geo => geo.location).join(', ')}</Table.Cell>
              <Table.Cell className="text-text-color">{app.settings.domain?.map(domain => domain.domain).join(', ')}</Table.Cell>
              <Table.Cell className="text-text-color">{app.settings.language?.map(language => language.langName).join(', ')}</Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${app.active ? "text-green-500" : "text-red-500"}`}>
                {app.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => navigate(`/store/appmanagement/appsetting/edit`, { state: { app } })}>Edit App</Dropdown.Item>
                  {app.active ? (
                    <Dropdown.Item onClick={() => handleDeactivateApp(app)}>Deactivate App</Dropdown.Item>
                  ) : (
                    <Dropdown.Item onClick={() => handleActivateApp(app)}>Activate App</Dropdown.Item>
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
            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"} text-text-color`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AppTable;
