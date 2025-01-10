import Container from "../../layout/component/container";
import UserTeamPermissionCard from "../../layout/component/userTeamPermissionCard";
import UserTeamPermissionTable from "../../layout/component/userTeamPermissionTable";

function UserTeamPermission() {

  return (
    <Container>
      <UserTeamPermissionCard title={"User/Team Permissions"} button={true}>
        <UserTeamPermissionTable
        />
      </UserTeamPermissionCard>
    </Container>
  );
}

export default UserTeamPermission;
