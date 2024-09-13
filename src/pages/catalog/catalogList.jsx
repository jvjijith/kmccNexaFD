import Container from "../../layout/component/container";
import CatalogCard from "../../layout/component/catalogCard";
import CatalogTable from "../../layout/component/catalogTable";

function CatalogList() {
    
    return (
        <Container>
        <CatalogCard  title ={"Catalog"} button={true}>
            <CatalogTable></CatalogTable>
        </CatalogCard>
       </Container>
    );
}

export default CatalogList;