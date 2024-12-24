import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function MenuTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: menuData, isLoading, error, refetch } = useGetData(
    "MenuData",
    `/menu?page=${currentPage}&limit=${limit}`,
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

  const totalPages = menuData.pagination.totalPages;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Menu Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">App Title</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Menu Type</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Layout Type</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Active</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {menuData.menus.map((menu) => (
            <Table.Row key={menu._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {menu.menuName}
              </Table.Cell>
              <Table.Cell className="text-gray-300">{menu.appId.title}</Table.Cell>
              <Table.Cell className="text-gray-300">{menu.menuType}</Table.Cell>
              <Table.Cell className="text-gray-300">{menu.layoutType}</Table.Cell>
              <Table.Cell className="text-gray-300">
                {menu.active ? "True" : "False"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/menu/edit`, { state: { menu } })
                    }
                  >
                    Edit Menu
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
              currentPage === index + 1 ? "bg-nexa-orange" : "bg-gray-700"
            } text-white`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuTable;
