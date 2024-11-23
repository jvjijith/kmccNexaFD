import { useGetData } from "../../common/api";
import Container from "../../layout/component/container";
import OrganizationCard from "../../layout/component/organizationCard";
import OrganizationTable from "../../layout/component/organizationTable";

function Organization() {

  const { data: organizationData, isLoading, error, refetch } = useGetData(
    "OrganizationData",
    `/organizations`,
    {}
  );


  return (
    <Container>
      <OrganizationCard title="Organization" button={organizationData?.organizations?.length>=1?false:true}>
        <OrganizationTable
        />
      </OrganizationCard>
    </Container>
  );
}

export default Organization;