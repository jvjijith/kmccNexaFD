import Container from "../../layout/component/container";
import VendorQuoteRequestCard from "../../layout/component/vendorQuoteRequestCard";
import VendorQuoteTable from "../../layout/component/vendorQuoteTable";

function VendorQuoteRequest() {

  return (
    <Container>
      <VendorQuoteRequestCard title={"Vendor Quote"} button={true}>
        <VendorQuoteTable
        />
      </VendorQuoteRequestCard>
    </Container>
  );
}

export default VendorQuoteRequest;
