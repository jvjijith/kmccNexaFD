import Container from "../../layout/component/container";
import PriceTable from "../../layout/component/priceTable";
import ProductCard from "../../layout/component/productCard";
import { useLocation } from "react-router";

function ListPrice() {
  const location = useLocation();
  const product = location.state?.product || null;

  return (
    <Container>
      <ProductCard title={"Pricing"}>
        <PriceTable/>
      </ProductCard>
    </Container>
  );
}

export default ListPrice;
