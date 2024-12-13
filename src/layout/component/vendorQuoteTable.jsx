import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { BlobProvider, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Header Component
function Header({ organization }) {
  const address = organization.addresses[0]  || {};
  console.log("address",address);
  console.log("organization",organization);
  console.log("logo",organization.logo);
  return (
    <View
      style={[
        styles.headerContainer,
        { position: "fixed", top: 0, left: 0, right: 0 },
      ]}
      fixed
    >
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }
        ]}
      >
        {/* Left Side: Logo */}
        <View style={{ width: "20%" }}>
          <Image
            src={organization.logo || "icon.png"}
            style={{ width: 60, height: 60 }}
          />
        </View>

        {/* Right Side: Organization Details */}
        <View style={{ width: "75%", textAlign: "right" }}>
          <Text style={{ fontWeight: "bold" }}>
            {organization.name || "Company Name"}
          </Text>
          <Text>
            {`${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.country || ""}, ${address.postalCode || ""}`}
          </Text>
          <Text>Phone: {organization.phone || "000-000-0000"}</Text>
          <Text>Email: {organization.email || "info@example.com"}</Text>
          <Text>Website: {organization.website || "www.example.com"}</Text>
        </View>
      </View>

      {/* Line Below Header */}
      <View style={[styles.headerLine, { marginBottom: 30 }]} />
    </View>
  );
}

  
  // Footer Component
  function Footer({ quote }) {
    return (
      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 10,
        }}
        fixed
      >
        <View
          style={{
            borderTop: "1px solid black",
            marginBottom: 5,
            width: "100%",
          }}
        />
        <Text
          render={({ pageNumber, totalPages }) =>
            `Nexalogics Page ${pageNumber}/${totalPages} ${quote.quoteNumber || ""}`
          }
        />
      </View>
    );
  }
  
  // Quote PDF Component
  function QuotePDF({ quote, organization }) {
    const vendor = quote.vendor || {};
    const createdBy = quote.createdBy || {};
    const termsAndConditions = quote.termsAndConditions || [];
    const products = quote.products || [];

    console.log(quote);
  
    return (
      <Document>
        {/** Page 1 */}
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Header
            organization={organization.organizations[0]}
          />
  
          {/* Main Content */}
          <View>
            {/* Quote Metadata */}
            <Text style={styles.section}>
              {"\n\n\n"}
              Quote #: {quote.quoteRequestNumber || "N/A"}
              {"\n"}
              Created Date: {new Date(quote.createdAt).toLocaleDateString()}
              {"\n"}
              Required Delivery Date:{" "}
              {new Date(quote.requiredDeliveryDate).toLocaleDateString()}
              {"\n\n"}
            </Text>
  
            {/* Billing & Shipping Details */}
            <View
              style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 10 }}
            >
              {/* Billing To */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.textBold}>Billing To:{"\n\n"}</Text>
                <Text>{vendor.name}</Text>
                <Text>{vendor.billingAddress}</Text>
                <Text>{vendor.location}, {vendor.country}</Text>
                <Text>Email: {vendor.email}</Text>
                <Text>Phone: {vendor.phone}</Text>
              </View>
  
              {/* Shipping To */}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.textBold}>Shipping To:{"\n\n"}</Text>
                <Text>{vendor.name}</Text>
                <Text>{vendor.shippingAddress}</Text>
                <Text>{vendor.location}, {vendor.country}</Text>
                <Text>Email: {vendor.email}</Text>
                <Text>Phone: {vendor.phone}</Text>
              </View>
            </View>
          </View>
  
          {/* Product Table */}
          <View style={[styles.table, { marginTop: 60 }]}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 1 }]}>No</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>Product Name</Text>
              <Text style={[styles.tableCell, { flex: 4 }]}>Description</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Qty</Text>
            </View>
  
            {/* Table Rows */}
            {products.map((product, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{product.productName || "N/A"}</Text>
                <Text style={[styles.tableCell, { flex: 4 }]}>{product.description || "N/A"}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{product.quantity || 0}</Text>
              </View>
            ))}
          </View>
  
          {/* Terms & Conditions */}
          <View style={[styles.termsTable, { marginTop: 60 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 1 }]}>Terms & Conditions</Text>
            </View>
            {termsAndConditions.map((term, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{term.name}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{term.content}</Text>
              </View>
            ))}
          </View>
  
          {/* Footer */}
          <Footer quote={quote} />
        </Page>
      </Document>
    );
  }
  
  
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 10,
      lineHeight: 1.5,
    },
    textBold: {
      fontWeight: "bold",
      fontSize: 16,
    },
    header: {
      marginBottom: 10,
      justifyContent: "space-between",
    },
    headerLine: {
      marginVertical: 5,
      height: 1,
      backgroundColor: "#000",
    },
    companyInfo: {
      textAlign: "center",
    },
    section: {
      marginBottom: 20,
    },
    table: {
      display: "table",
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      marginTop: 10,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCell: {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#000",
      padding: 5,
      fontSize: 9,
      textAlign: "center", // Aligns text to the center, as in the image.
    },
    tableHeader: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
      textAlign: "center", // Ensures the header text is centered.
      fontSize: 10, // Slightly larger font for the header.
    },
    termsTable: {
      display: "table",
      width: "100%",
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#000",
      borderStyle: "solid",
    },
    footer: {
      position: "absolute",
      bottom: 10,
      left: 30,
      right: 30,
      textAlign: "center",
      fontSize: 9,
    },
  });
  
  

// Main Component for PDF Rendering and Download
  

function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.href = uri;
  link.download = name;
  link.click();
}


function VendorQuoteTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: quoteRequestData, isLoading, error, refetch } = useGetData(
    "quoteRequest",
    `/quoteRequests?page=${currentPage}&limit=${limit}`,
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

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const totalPages = Math.ceil(quoteRequestData.pagination.totalCount / limit);

  console.log("organizationData",organizationData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Quote Request Number
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Vendor Name
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Vendor Email
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Status
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {quoteRequestData.vendorQuoteRequests.map((request) => (
            <Table.Row key={request._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {request.quoteRequestNumber}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {request.vendor.name}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {request.vendor.email}
              </Table.Cell>
              <Table.Cell className={`text-gray-300 `}>
                {request.vendorQuoteRequestStatus}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/quoterequest/edit`, {
                        state: { request },
                      })
                    }
                  >
                    Edit Request
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <BlobProvider document={<QuotePDF quote={request} organization={organizationData} />}>
                      {({ url, loading }) =>
                        loading ? (
                          "Generating PDF..."
                        ) : (
                          <button onClick={() => downloadURI(url, `Quote-${request.quoteRequestNumber}.pdf`)}>
                            Download PDF
                          </button>
                        )
                      }
                    </BlobProvider>
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

export default VendorQuoteTable;
