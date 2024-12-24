import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import { BlobProvider, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import LoadingScreen from "../ui/loading/loading";


// Header Component
function Header({ organization }) {
  const address = organization.addresses[0]  || {};
  console.log("address",address);
  console.log("organization",organization);
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
          },
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
      <View style={styles.headerLine} />
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
    const customer = quote.customer || {};
    const salesman = quote.salesman || {};
    const products = quote.products || [];
    const tax = organization.organizations[0].taxSettings[0] || [];

    console.log("tax",tax );
  
    return (
      <Document>
        {/** Page 1 */}
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Header organization={organization.organizations[0]} />
  
          {/* Main Content */}
          <Text style={styles.section}>
            {"\n\n\n"}
            {"\n\n"}
            {new Date(quote.createdAt).toLocaleDateString()}
            {"\n\n"}
            {quote.quoteNumber}
            {"\n\n"}
            {customer.name}
            {"\n\n"}
            {customer.location}, {customer.country}
            {"\n\n\n"}
            Dear {customer.name},
            {"\n\n\n"}
            Thank you very much for the opportunity to quote for your requirement. Based on our discussions and
            requirement analysis, we are pleased to offer the attached proposal {quote.quoteNumber}. Hope that the
            offer is in line with your requirement and expectation.
            {"\n\n"}
            Please feel free to contact us for any further clarification.
            {"\n\n"}
            We look forward to receiving your valuable order and to work with your esteemed organisation.
            {"\n\n\n\n"}
            Yours faithfully,
            {"\n\n"}
            {salesman.name || "Nishanth M"}
            {"\n"}
            {salesman.designation || "Manager-Pre Sales and Projects"}
            {"\n"}
            {organization.name || "Nexalogics Equipments Pvt Ltd"}
            {"\n"}
            {salesman.email || "nishanth@rgbbroadcasting.com"}
            {"\n"}
            Mob: {salesman.phoneNumber || "9400333609"}
          </Text>
          
          <Footer quote={quote} />
        </Page>
  
        {/** Additional Pages */}
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Header organization={organization.organizations[0]} />
  <View style={{ marginTop: 30 }}>
          {/* Table and Content */}
  {/* Billing and Shipping Details */}
  <View style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 10 }}>
  {/* Billing To */}
  <View style={{ flex: 1, marginRight: 10 }}>
    <Text style={styles.textBold}>Billing To:{"\n"}{"\n"}</Text>
    <Text>{customer.name}</Text>
    <Text>{customer.location}, {customer.country}</Text>
    <Text>{"\n"}Attn: {customer.name}</Text>
    <Text>{customer.email}</Text>
    <Text>{customer.phone}</Text>
  </View>

  {/* Shipping To */}
  <View style={{ flex: 1, marginLeft: 10 }}>
    <Text style={styles.textBold}>Shipping To:{"\n"}{"\n"}</Text>
    <Text>{customer.name}</Text>
    <Text>{customer.location}, {customer.country}</Text>
    <Text>{"\n"}Attn: {customer.name}</Text>
    <Text>{customer.email}</Text>
    <Text>{customer.phone}</Text>
  </View>
</View>
</View>

  {/* Quote Details */}
<Text style={styles.section}>
  <Text>
  {"\n"}{"\n"}{"\n"}
    Quote #: {quote.quoteNumber}
    {"\n"}
    Effective Date: {new Date(quote.createdAt).toLocaleDateString()}
    {"\n"}
    Valid Through: {new Date(quote.validUntil).toLocaleDateString()}
    {"\n"} 
  </Text>
</Text>

{/* Product Table */}
<View style={styles.table}>
  {/* Table Header */}
  <View style={[styles.tableRow, styles.tableHeader]}>
    <Text style={[styles.tableCell, { flex: 1 }]} fixed>No</Text>
    <Text style={[styles.tableCell, { flex: 3 }]} fixed>Description</Text>
    <Text style={[styles.tableCell, { flex: 2 }]} fixed>Make</Text>
    <Text style={[styles.tableCell, { flex: 2 }]} fixed>Model</Text>
    <Text style={[styles.tableCell, { flex: 1 }]} fixed>Qty</Text>
    <Text style={[styles.tableCell, { flex: 1 }]} fixed>{tax.name}</Text>
    <Text style={[styles.tableCell, { flex: 2 }]} fixed>Unit Price</Text>
    <Text style={[styles.tableCell, { flex: 2 }]} fixed>EXT. Price</Text>
  </View>

  {/* Table Rows */}
  {products.map((product, index) => (
    <View key={index} style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 1 }]}>{index + 1}</Text>
      <Text style={[styles.tableCell, { flex: 3 }]}>{product.productId || "N/A"}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{product.make || "N/A"}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{product.model || "N/A"}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{product.quantity || 0}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>18%</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{product.unitPrice?.toFixed(2) || "0.00"}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{product.totalPrice?.toFixed(2) || "0.00"}</Text>
    </View>
  ))}

  {/* Subtotal, IGST, and Total */}
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 7, textAlign: "right", fontWeight: "bold" }]}>Subtotal</Text>
    <Text style={[styles.tableCell, { flex: 1 }]}>₹{quote.totalAmount.toFixed(2)}</Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 7, textAlign: "right", fontWeight: "bold" }]}>{tax.name} @ 18%</Text>
    <Text style={[styles.tableCell, { flex: 1 }]}>₹{(quote.totalAmount * 0.18).toFixed(2)}</Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 7, textAlign: "right", fontWeight: "bold" }]}>Total</Text>
    <Text style={[styles.tableCell, { flex: 1 }]}>₹{quote.finalAmount.toFixed(2)}</Text>
  </View>
</View>

{/* Terms & Conditions Table */}
<View style={[styles.termsTable,{marginTop:60}]}>
  {/* Table Header */}
  <View style={[styles.tableRow, styles.tableHeader]}>
    <Text style={[styles.tableCell, { flex: 1 }]} fixed>Terms & Conditions</Text>
  </View>

  {/* Table Rows */}
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 1 }]}>Payment</Text>
    <Text style={[styles.tableCell, { flex: 3 }]}>100% Advance</Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 1 }]}>Shipping</Text>
    <Text style={[styles.tableCell, { flex: 3 }]}>
      3-4 Weeks from the date of payment transfer
    </Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 1 }]}>Warranty</Text>
    <Text style={[styles.tableCell, { flex: 3 }]}>1-Year Standard Warranty</Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 1 }]}>Validity</Text>
    <Text style={[styles.tableCell, { flex: 3 }]}>7 Days from the date of offer</Text>
  </View>
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, { flex: 1 }]}>Duties & Tax</Text>
    <Text style={[styles.tableCell, { flex: 3 }]}>All Inclusive</Text>
  </View>
</View>

        </Page>
      </Document>
    );
  }
  
 // Styles
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
      justifyContent: "space-between"
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
    },
    tableHeader: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
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

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const totalPages = Math.ceil(QuoteData.pagination.totalCount / limit);

  console.log(organizationData);
  console.log(QuoteData);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Enquiry Mode
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Salesman Name
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Valid Until
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Quote Status
          </Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {QuoteData?.quotes.map((quote) => (
            <Table.Row key={quote._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {quote.enquiryId?.enquiryMode || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {quote.salesman?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {quote.validUntil
                  ? new Date(quote.validUntil).toLocaleDateString()
                  : "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                {quote.quoteStatus || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown
                  label="Actions"
                  inline
                  className="bg-black text-white border-black"
                >
                  <Dropdown.Item
                    onClick={() =>
                      navigate(`/quote/edit`, { state: { quote } })
                    }
                  >
                    Edit Quote
                  </Dropdown.Item><Dropdown.Item
                    onClick={() =>
                      navigate(`/quote/${quote._id}/details`, { state: { quote } })
                    }
                  >
                    Details
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <BlobProvider document={<QuotePDF quote={quote} organization={organizationData} />}>
                      {({ url, loading }) =>
                        loading ? (
                          "Generating PDF..."
                        ) : (
                          <button onClick={() => downloadURI(url, `Quote-${quote.quoteNumber}.pdf`)}>
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

export default QuoteTable;
