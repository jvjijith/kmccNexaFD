import Container from "../../layout/component/container";
import CatalogCard from "../../layout/component/catalogCard";
import Catalog from "../../layout/component/catalog";
import { useLocation } from "react-router";


function CatalogPage() {

  const location = useLocation();
  const catalog = location.state?.catalog || null;

  console.log(catalog);

    return (
       <Container>
           <CatalogCard title ={"Catalog"}>
            <Catalog catalogId={catalog?catalog._id:null} />
          </CatalogCard>
       </Container>
      );
}

export default CatalogPage;