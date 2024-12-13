import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";

function PurchaseOrderTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: PurchaseOrdersData, isLoading, error, refetch } = useGetData(
    "PurchaseOrdersData",
    `/purchaseOrders?page=${currentPage}&limit=${limit}`,
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

  const totalPages = Math.ceil(PurchaseOrdersData.pagination.totalCount / limit);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">PO Number</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Purchaser</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Vendor</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Total Amount</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Final Amount</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {PurchaseOrdersData.purchaseOrders.map((po) => (
            <Table.Row key={po._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {po.poNumber}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {po.purchaser?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {po.vendor?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {po.totalAmount}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {po.finalAmount}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {po.poStatus}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/purchaseorder/edit`, { state: { po } })
                    }
                  >
                    Edit PO
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

export default PurchaseOrderTable;
