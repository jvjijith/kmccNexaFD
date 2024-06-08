import Container from "../../layout/component/container";
import VendorCard from "../../layout/component/vendorCard";
import VendorForm from "../../layout/component/vendorForm";
import { useLocation } from "react-router";

function EditVendor() {
  const location = useLocation();
  const vendor = location.state?.vendor || null;

  return (
    <Container>
      <VendorCard title={vendor ? "Edit Vendor" : "Add Vendor"}>
        <VendorForm
          typeData={vendor ? "update" : ""}
          vendorId={vendor ? vendor._id : null}
        />
      </VendorCard>
    </Container>
  );
}

export default EditVendor;
