import Container from "../../layout/component/container";
import ProductCard from "../../layout/component/productCard";
import ProductForm from "../../layout/component/productForm";
import { useLocation } from "react-router";

function AddProduct() {
  const location = useLocation();
  const product = location.state?.product || null;

  return (
    <Container>
      <ProductCard title={product ? "Edit Product" : "Add Product"}>
        <ProductForm
          typeData={product ? "update" : ""}
          productId={product ? product._id : null}
        />
      </ProductCard>
    </Container>
  );
}

export default AddProduct;
