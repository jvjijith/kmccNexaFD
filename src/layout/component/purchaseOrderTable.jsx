import { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { BlobProvider, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import PopUpModal from "../ui/modal/modal";

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
  function QuotePDF({ quote, organization, productData, varientData }) {
    const customer = quote.purchaser || {};
    const createdBy = quote.createdBy || {};
    const products = quote.items || [];
    const termsAndConditions = quote.termsAndConditions || [];
    const totalAmount = quote.totalAmount || 0;
    const finalAmount = quote.finalAmount || 0;
    const currencySymbol = organization?.organizations[0]?.currency?.symbol || "$";
    const bankAccountDetails = organization?.organizations[0]?.bankAccounts[0];
    const tax = organization.organizations[0].taxSettings[0] || [];
    const taxAmount = (quote.totalAmount * 0.18).toFixed(2);

    console.log("quote",quote);
    console.log("organization",organization);
    console.log("productData",productData);
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>          
          {/* Header */}
          <Header
            organization={organization.organizations[0]}
          />
        <Text style={styles.mHeader}>Purchase Order</Text>
        <View style={{  justifyContent: "center", paddingHorizontal: 10, marginTop: 60 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
    {/* Organization Details */}
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={{ textAlign: "left" }}>{organization?.organizations[0]?.name}</Text>
      <Text style={{ textAlign: "left" }}>
        Address: {organization?.organizations[0]?.addresses[0]?.street}, {organization?.organizations[0]?.addresses[0]?.city}
      </Text>
      <Text style={{ textAlign: "left" }}>Email: {organization?.organizations[0]?.email || "N/A"}</Text>
      <Text style={{ textAlign: "left" }}>Phone: {organization?.organizations[0]?.phone || "N/A"}</Text>
    </View>

    {/* Quote Details */}
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={{ textAlign: "left" }}>PO Number #: {quote.poNumber}</Text>
      <Text style={{ textAlign: "left" }}>Created Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
      <Text style={{ textAlign: "left" }}>Expected Delivery Date: {new Date(quote.expectedDeliveryDate).toLocaleDateString()}</Text>
      <Text style={{ textAlign: "left" }}>Payment Terms: {quote.paymentTerms || "N/A"}</Text>
    </View>
  </View>
</View>

  
          {/* Customer Details */}
          <View style={[styles.section,{ marginTop: 60}]}>
            <Text style={styles.textBold}>Customer Details</Text>
            </View>
            <View style={{ justifyContent: "center", paddingHorizontal: 10, marginTop: 10 }}>
  {/* Billing & Shipping Details */}
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
    {/* Billing To */}
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={[styles.textBold, { textAlign: "left" }]}>Billing To:{"\n\n"}</Text>
      <Text style={{ textAlign: "left" }}>{customer.name}</Text>
      <Text style={{ textAlign: "left" }}>{quote.billingAddress}</Text>
      {/* <Text style={{ textAlign: "left" }}>
        {customer.location}, {customer.country}
      </Text> */}
      <Text style={{ textAlign: "left" }}>Email: {customer.email}</Text>
      <Text style={{ textAlign: "left" }}>Phone: {customer.phoneNumber}</Text>
    </View>

    {/* Shipping To */}
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={[styles.textBold, { textAlign: "left" }]}>Shipping To:{"\n\n"}</Text>
      <Text style={{ textAlign: "left" }}>{customer.name}</Text>
      <Text style={{ textAlign: "left" }}>{quote.shippingAddress}</Text>
      {/* <Text style={{ textAlign: "left" }}>
        {customer.location}, {customer.country}
      </Text> */}
      <Text style={{ textAlign: "left" }}>Email: {customer.email}</Text>
      <Text style={{ textAlign: "left" }}>Phone: {customer.phoneNumber}</Text>
    </View>
  </View>
</View>

  
        {/* Product Table */} 
        <View style={[styles.table,{marginTop: 30}]}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <Text style={[styles.tableCell, { flex: 1 }]} fixed>No</Text>
            <Text style={[styles.tableCell, { flex: 3 }]} fixed>Product</Text>
            <Text style={[styles.tableCell, { flex: 2 }]} fixed>Variant</Text>
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
              <Text style={[styles.tableCell, { flex: 3 }]}>{productData?.products?.find((v) => v._id === product.productId)?.name || "N/A"}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{varientData?.variants?.find((v) => v._id === product.variantId)?.name || "N/A"}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{product.model || "N/A"}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{product.quantity || 0}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>18%</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{product.unitPrice?.toFixed(2) || "0.00"}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(product.unitPrice * product.quantity)?.toFixed(2) || "0.00"}</Text>
            </View>
          ))}

          {/* Subtotal, IGST, and Total */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 8, textAlign: "right", fontWeight: "bold" }]}>Subtotal</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{currencySymbol}{quote.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 8, textAlign: "right", fontWeight: "bold" }]}>Discount</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{currencySymbol}{quote.totalDiscount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 8, textAlign: "right", fontWeight: "bold" }]}>{tax.name} @ 18%</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{currencySymbol}{taxAmount}</Text>
          </View>
          <View style={styles.tableRow}>
  <Text style={[styles.tableCell, { flex: 8, textAlign: "right", fontWeight: "bold" }]}>Total</Text>
  <Text style={[styles.tableCell, { flex: 2 }]}>{currencySymbol}{(Number(finalAmount.toFixed(2)) + Number((quote.totalAmount * 0.18).toFixed(2))).toFixed(2)}</Text>
</View>

        </View>



  
         {/* Terms & Conditions */}
<View
  style={[
    styles.termsTable,
    { marginTop: 30, breakInside: 'avoid', breakBefore: 'auto' },
  ]}
  wrap={false} // Prevents wrapping across pages
>
  <View style={[styles.tableRow, styles.tableHeader]} >
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
          <Text style={styles.footer}>Thank you for considering us!</Text>
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
    mHeader: { fontSize: 16, textAlign: "center", marginBottom: 10 },
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
      borderWidth: 1,
      borderColor: "#000",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#000",
    },
    tableHeader: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
    },
    tableCell: {
      padding: 8,
      textAlign: "center",
      borderRightWidth: 1,
      borderColor: "#000",
    },
    summary: {
      marginTop: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: "#000",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    summaryLabel: {
      fontWeight: "bold",
    },
    bankDetails: {
      marginTop: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: "#000",
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

function PurchaseOrderTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State for modal visibility
  const [previewInvoice, setPreviewInvoice] = useState(null); // State for selected invoice preview
  const limit = 10;

  const { data: PurchaseOrdersData, isLoading, error, refetch } = useGetData(
    "PurchaseOrdersData",
    `/purchaseOrders?page=${currentPage}&limit=${limit}`,
    {}
  );

  const { data: organizationData, organizationLoading, organizationError, organizationRefetch } = useGetData(
    "OrganizationsData",
    `/organizations?page=${currentPage}&limit=${limit}`,
    {}
  );

const { data: productData, productLoading, productError, productRefetch } = useGetData(
    "productData",
    `/product`,
    {}
  );

const { data: varientData, varientLoading, varientError, varientRefetch } = useGetData(
  "varientData",
  `/variant/`,
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

  console.log("PurchaseOrdersData",PurchaseOrdersData);

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
                   <Dropdown.Item>
                    <BlobProvider document={<QuotePDF quote={po} organization={organizationData} productData={productData} varientData={varientData} />}>
                      {({ url, loading }) =>
                        loading ? (
                          "Generating PDF..."
                        ) : (
                          <button onClick={() => downloadURI(url, `PO-${po.poNumber}.pdf`)}>
                            Download PDF
                          </button>
                        )
                      }
                    </BlobProvider>
                  </Dropdown.Item>
                  <Dropdown.Item
                  onClick={() => {
                    setPreviewInvoice(po);
                    setIsPreviewOpen(true); // Open the modal
                  }}
                >
                  Preview PO
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
      {/* Preview Modal */}
    <PopUpModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="PO Preview" size={true}>
  {previewInvoice && (
    <BlobProvider document={<QuotePDF quote={previewInvoice} organization={organizationData} />}>
      {({ blob, url, loading }) =>
        loading ? (
          <p className="text-white">Loading preview...</p>
        ) : (
          <iframe
            src={url}
            title="Invoice Preview"
            style={{ width: "100%", height: "100%", border: "none" }}
          ></iframe>
        )
      }
    </BlobProvider>
  )}
</PopUpModal>
    </div>
  );
}

export default PurchaseOrderTable;
