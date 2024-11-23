import Container from "../../layout/component/container";
import EnquiryCard from "../../layout/component/enquiryCard";
import EnquiryTable from "../../layout/component/enquiryTable";

function Enquiry() {


  return (
    <Container>
      <EnquiryCard title="Enquiry"  button={true}>
      <EnquiryTable/>
      </EnquiryCard>
    </Container>
  );
}

export default Enquiry;
