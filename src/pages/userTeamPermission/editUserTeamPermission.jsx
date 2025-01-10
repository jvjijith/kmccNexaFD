import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import UserTeamPermissionCard from "../../layout/component/userTeamPermissionCard";
import UserTeamPermissionForm from "../../layout/component/userTeamPermissionForm";

function EditUserTeamPermission() {
    const location = useLocation();
    const formattedData = location.state?.formattedData || null;
    const permission = location.state?.permission || null;

  return (
    <Container>
      <UserTeamPermissionCard title={"User/Team Permissions"} >
        <UserTeamPermissionForm
        formattedData={formattedData}
        permission={permission}
        />
      </UserTeamPermissionCard>
    </Container>
  );
}

export default EditUserTeamPermission;
