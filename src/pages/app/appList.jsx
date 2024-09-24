import AppCard from "../../layout/component/appCard";
import AppTable from "../../layout/component/appSettingTable";
import Container from "../../layout/component/container";

function ListApp() {
    
    return (
       <Container>
        <AppCard title={"App Settings"} button={true}>
            <AppTable></AppTable>
        </AppCard>
       </Container>
    );
}

export default ListApp;