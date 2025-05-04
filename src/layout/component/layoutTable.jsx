import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function LayoutTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: layoutData, isLoading, error, refetch } = useGetData(
    "LayoutData",
    `/layout?page=${currentPage}&limit=${limit}`,
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

  const totalPages = Math.ceil(layoutData.pagination.totalCount / limit);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">App ID</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Font Family</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Font Type</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Font Size (Base)</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Logo (Dark)</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {layoutData?.layoutSettings.map((setting) => (
            <Table.Row key={setting._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {setting.appId.title}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {setting.font[0]?.fontFamily || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {setting.font[0]?.type || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {setting.fontSize?.base || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {setting.logos.length > 0 ? (
                  <img
                    src={setting.logos[0]?.imageUrl}
                    alt="Logo"
                    className="h-10"
                  />
                ) : (
                  "No Logo"
                )}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown
                  label="Actions"
                  inline
                  className="bg-secondary-card text-text-color border-black"
                >
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/layout/edit`, { state: {  setting } })
                    }
                  >
                    Edit Layout
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

export default LayoutTable;
