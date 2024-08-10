import Container from "../../layout/component/container";
import ProductCard from "../../layout/component/productCard";
import VarientForm from "../../layout/component/varientForm";
import { useLocation } from "react-router";

function AddVarient() {
  const location = useLocation();
  
  // Extract the productId from the URL query parameters or state
  const productId = new URLSearchParams(location.search).get("productId");

  return (
    <Container>
      <ProductCard title={"Add Variant"}>
        <VarientForm productId={productId} />
      </ProductCard>
    </Container>
  );
}

export default AddVarient;