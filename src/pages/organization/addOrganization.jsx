import Container from "../../layout/component/container";
import OrganizationCard from "../../layout/component/organizationCard";
import OrganizationForm from "../../layout/component/organizationForm";

function AddOrganization() {


  return (
    <Container>
      <OrganizationCard title="Add Organization">
        <OrganizationForm
        />
      </OrganizationCard>
    </Container>
  );
}

export default AddOrganization;