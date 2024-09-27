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
          vendor={vendor ? vendor : null}
        />
      </VendorCard>
    </Container>
  );
}

export default EditVendor;
