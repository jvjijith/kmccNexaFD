import Container from "../../layout/component/container";
import AdminCard from "../../layout/component/adminCard";
import UserTable from "../../layout/component/userTable";

function User() {
    
    return (
        <Container>
        <AdminCard  title ={"Users"}>
            <UserTable></UserTable>
        </AdminCard>
       </Container>
    );
}

export default User;