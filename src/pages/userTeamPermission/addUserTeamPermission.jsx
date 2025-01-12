import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import UserTeamPermissionCard from "../../layout/component/userTeamPermissionCard";
import UserTeamPermissionForm from "../../layout/component/userTeamPermissionForm";

function AddUserTeamPermission() {
    const location = useLocation();
    const formattedData = location.state?.formattedData || null;

  return (
    <Container>
      <UserTeamPermissionCard title={"User/Team Permissions"} >
        <UserTeamPermissionForm
        formattedData={formattedData}
        />
      </UserTeamPermissionCard>
    </Container>
  );
}

export default AddUserTeamPermission;
