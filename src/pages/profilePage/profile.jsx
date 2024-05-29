import AdminCard from "../../layout/component/adminCard";
import Container from "../../layout/component/container";
import ProfilePage from "../../layout/ui/profile/profilePage";

function Profile() {
    
    return (
        <Container>
        {/* <AdminCard  title ={"Users"}> */}
            <ProfilePage></ProfilePage>
            {/* </AdminCard> */}
       </Container>
    );
}

export default Profile;