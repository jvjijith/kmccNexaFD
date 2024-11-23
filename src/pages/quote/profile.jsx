import Container from "../../layout/component/container";
import ProfilePage from "../../layout/ui/profile/quotesProfile";

function QuotesProfile() {
    
    return (
        <Container>
        {/* <AdminCard  title ={"Users"}> */}
            <ProfilePage></ProfilePage>
            {/* </AdminCard> */}
       </Container>
    );
}

export default QuotesProfile;