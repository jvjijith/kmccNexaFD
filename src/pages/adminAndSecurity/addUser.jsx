
import AdminCard from "../../layout/component/adminCard";
import Container from "../../layout/component/container";
import UserForm from "../../layout/component/userForm";


function AddUser() {
 



    return (
       <Container>
           <AdminCard
          
            title ={"Add User"}
          >
            
          <UserForm></UserForm>
          </AdminCard>
       </Container>
      );
}

export default AddUser;