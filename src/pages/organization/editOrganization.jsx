import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import OrganizationCard from "../../layout/component/organizationCard";
import OrganizationForm from "../../layout/component/organizationForm";

function EditOrganization() {
    const location = useLocation();
    const organization = location.state?.organization || null;


  return (
    <Container>
      <OrganizationCard title="Edit Organization">
        <OrganizationForm
        organizationDatas={organization ? organization : null}
        />
      </OrganizationCard>
    </Container>
  );
}

export default EditOrganization;