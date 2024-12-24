import Container from "../../layout/component/container";
import VendorQuoteRequestCard from "../../layout/component/vendorQuoteRequestCard";
import VendorQuoteRequestForm from "../../layout/component/vendorQuoteRequestForm";

function AddVendorQuoteRequest() {

  return (
    <Container>
      <VendorQuoteRequestCard title={"Add Vendor Quote"}>
        <VendorQuoteRequestForm
        />
      </VendorQuoteRequestCard>
    </Container>
  );
}

export default AddVendorQuoteRequest;
