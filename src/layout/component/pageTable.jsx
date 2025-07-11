import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import Pagination from "../ui/pagination/Pagination";

function PageTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: pageData, isLoading, error, refetch } = useGetData(
    "PageData",
    `/pages?page=${currentPage}&limit=${limit}`,
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

  // Calculate totalPages properly using totalCount and limit
  const totalPages = Math.ceil((pageData?.pagination?.totalCount || 0) / limit);

  console.log("PageData:", pageData);
  console.log("Total Count:", pageData?.pagination?.totalCount);
  console.log("Calculated Total Pages:", totalPages);
  console.log("Current Page:", currentPage);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Slug</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Reference Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Type</Table.HeadCell>
          {/* <Table.HeadCell className="border-border bg-table-heading text-text-color">Internal Type</Table.HeadCell> */}
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Created At</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {pageData?.pages?.map((page) => (
            <Table.Row key={page._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {page.slug}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{page.referenceName}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{page.type}</Table.Cell>
              {/* <Table.Cell className="border-bordertext-text-color">{page.internalType}</Table.Cell> */}
              <Table.Cell className="border-bordertext-text-color">
                {new Date(page.created_at).toLocaleString()}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/page/edit`, { state: { page } })
                    }
                  >
                    Edit Page
                  </Dropdown.Item>
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

export default PageTable;