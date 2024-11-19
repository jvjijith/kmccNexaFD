import Container from "../../layout/component/container";
import EnquiryCard from "../../layout/component/enquiryCard";
import EnquiryForm from "../../layout/component/enquiryForm";

function AddEnquiry() {


  return (
    <Container>
      <EnquiryCard title="Add Enquiry">
        <EnquiryForm
        />
      </EnquiryCard>
    </Container>
  );
}

export default AddEnquiry;