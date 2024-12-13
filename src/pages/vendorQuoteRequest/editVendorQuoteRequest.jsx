import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import VendorQuoteRequestCard from "../../layout/component/vendorQuoteRequestCard";
import VendorQuoteRequestForm from "../../layout/component/vendorQuoteRequestForm";

function EditVendorQuoteRequest() {
    const location = useLocation();
    const request = location.state?.request || null;

  return (
    <Container>
      <VendorQuoteRequestCard title={"Edit Vendor Quote"}>
        <VendorQuoteRequestForm
        vendorRequest={request ? request : null}
        />
      </VendorQuoteRequestCard>
    </Container>
  );
}

export default EditVendorQuoteRequest;
