import Container from "../../layout/component/container";
import SalesInvoiceTable from "../../layout/component/salesinvoiceTable";
import UserTeamPermissionCard from "../../layout/component/userTeamPermissionCard";

function UserTeamPermission() {

  return (
    <Container>
      <UserTeamPermissionCard title={"User/Team Permissions"} button={true}>
        <SalesInvoiceTable
        />
      </UserTeamPermissionCard>
    </Container>
  );
}

export default UserTeamPermission;
