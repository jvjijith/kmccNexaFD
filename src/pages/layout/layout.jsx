import Container from "../../layout/component/container";
import LayoutCard from "../../layout/component/layoutCard";
import LayoutTable from "../../layout/component/layoutTable";

function Layout() {
    
    return (
       <Container>
        <LayoutCard  title ={"Layout"} button={true}>
            <LayoutTable></LayoutTable>
        </LayoutCard>
       </Container>
    );
}

export default Layout;