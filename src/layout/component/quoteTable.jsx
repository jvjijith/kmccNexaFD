import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import UserTeamPermissionsPage from "../../routes/userPermission";
import Pagination from "../ui/pagination/Pagination";

function QuoteTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: QuoteData, isLoading, error, refetch } = useGetData(
    "QuoteData",
    `/quotes?page=${currentPage}&limit=${limit}`,
    {}
  );

  const { data: organizationData, organizationLoading, organizationError, organizationRefetch } = useGetData(
    "OrganizationsData",
    `/organizations?page=${currentPage}&limit=${limit}`,
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

  // Handle PDF download by opening the URL directly
  const handleDownloadPDF = (quoteId) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const pdfUrl = `${baseUrl}/quotes/${quoteId}/pdf`;
    window.open(pdfUrl, '_blank');
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-text-color">Error loading data</div>;
  }

  const totalPages = Math.ceil((QuoteData?.pagination?.totalCount || 0) / limit);

  console.log(organizationData);
  console.log(QuoteData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">
            Enquiry Mode
          </Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">
            Salesman Name
          </Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">
            Valid Until
          </Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">
            Quote Status
          </Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {QuoteData?.quotes?.map((quote) => (
            <Table.Row key={quote._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {quote.enquiryId?.enquiryMode || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {quote.salesman?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {quote.validUntil
                  ? new Date(quote.validUntil).toLocaleDateString()
                  : "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {quote.quoteStatus || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown
                  label="Actions"
                  inline
                  className="bg-secondary-card text-text-color border-black"
                >
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/quote/edit`, { state: { quote } })
                    }
                  >
                    Edit Quote
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/quote/${quote._id}/details`, { state: { quote } })
                    }
                  >
                    Details
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <UserTeamPermissionsPage 
                      requiredModule={"quotes"} 
                      permission={"view"} 
                      page={
                        <button 
                          onClick={() => handleDownloadPDF(quote._id)}
                        >
                          Download PDF
                        </button>
                      } 
                    />
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

export default QuoteTable;