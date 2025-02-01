import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function ColorTable() {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1); 
  const limit = 10; 

  const { data: colorData, isLoading, error, refetch } = useGetData(
    "ColorData",
    `/colors?page=${currentPage}&limit=${limit}`,
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

  const totalPages = Math.ceil(colorData.pagination.totalCount / limit); 

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">App Title</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Mode</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Primary Color</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Secondary Color</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {colorData?.colorSchemes.map((scheme, index) => (
            <Table.Row key={index} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {scheme.appId.title}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{scheme.mode}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {scheme.theme.palette.primary.main}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {scheme.theme.palette.secondary.main}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item onClick={() => navigate(`/store/color/edit`, { state: { scheme, colorData } })}>Edit Scheme</Dropdown.Item>
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

export default ColorTable;
