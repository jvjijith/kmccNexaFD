import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import EnquiryCard from "../../layout/component/enquiryCard";
import EnquiryForm from "../../layout/component/enquiryForm";

function EditEnquiry() {

    const location = useLocation();
    const enquiry = location.state?.enquiry || null;

  return (
    <Container>
      <EnquiryCard title="Add Enquiry">
        <EnquiryForm
        quotes={enquiry ? enquiry : null}
        />
      </EnquiryCard>
    </Container>
  );
}

export default EditEnquiry;