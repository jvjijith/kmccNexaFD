import Container from "../../layout/component/container";
import PriceForm from "../../layout/component/priceForm";
import ProductCard from "../../layout/component/productCard";
import { useLocation } from "react-router";

function AddPrice() {
  const location = useLocation();
  const price = location.state?.price || null;

  return (
    <Container>
      <ProductCard title={price ? "Edit Price" : "Add Price"}>
        <PriceForm
          // typeData={product ? "update" : ""}
          priceId={price ? price._id : null}
        />
      </ProductCard>
    </Container>
  );
}

export default AddPrice;
