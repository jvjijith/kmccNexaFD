import Container from "../../layout/component/container";
import PriceForm from "../../layout/component/priceForm";
import ProductCard from "../../layout/component/productCard";
import { useLocation } from "react-router";

function AddPrice() {
  const location = useLocation();
  const product = location.state?.product || null;

  return (
    <Container>
      <ProductCard title={product ? "Edit Price" : "Add Price"}>
        <PriceForm
          typeData={product ? "update" : ""}
          productId={product ? product._id : null}
        />
      </ProductCard>
    </Container>
  );
}

export default AddPrice;
