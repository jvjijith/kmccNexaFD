import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";
import Pagination from "../ui/pagination/Pagination";

function AppTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
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
    setCurrentPage(page);
  };

  // Fetch new data when currentPage changes
  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  const totalPages = Math.ceil((AppData?.pagination?.totalCount || 0) / limit);

  console.log(AppData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">App Title</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">App Type</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Geo Location</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Domain</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Language</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {AppData?.apps?.map((app) => (
            <Table.Row key={app._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">{app.title}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{app.appType}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{app.settings?.geo?.map(geo => geo.location).join(', ') || "N/A"}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{app.settings?.domain?.map(domain => domain.domain).join(', ') || "N/A"}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{app.settings?.language?.map(language => language.langName).join(', ') || "N/A"}</Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${app.active ? "text-green-500" : "text-red-500"}`}>
                {app.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AppTable;