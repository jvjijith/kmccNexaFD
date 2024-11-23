import Container from "../../layout/component/container";
import OrganizationCard from "../../layout/component/organizationCard";
import OrganizationTable from "../../layout/component/organizationTable";

function Organization() {


  return (
    <Container>
      <OrganizationCard title="Organization" button={true}>
        <OrganizationTable
        />
      </OrganizationCard>
    </Container>
  );
}

export default Organization;