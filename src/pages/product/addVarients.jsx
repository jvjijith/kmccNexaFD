import Container from "../../layout/component/container";
import ProductCard from "../../layout/component/productCard";
import VarientForm from "../../layout/component/varientForm";
import { useLocation } from "react-router";

function AddVarient() {
  const location = useLocation();
  const variant = location.state?.variant || null;
  const product = location.state?.product || null;
  const productId = location.state?.productId || null;
  
  console.log("product",product);
  
  console.log("variant",variant);

  console.log("productId",productId);

  return (
    <Container>
      <ProductCard title={"Add Variant"}>
        <VarientForm 
        variantId={variant?variant._id:null}
        productId={product?product._id:productId?productId:null}
         />
      </ProductCard>
    </Container>
  );
}

export default AddVarient;