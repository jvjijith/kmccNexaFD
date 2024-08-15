import Container from "../../layout/component/container";
import ProductCard from "../../layout/component/productCard";
import { useLocation } from "react-router";
import VarientTable from "../../layout/component/varientTable";

function Varient() {

    const location = useLocation();
  const product = location.state?.product || null;
  const productId = location.state?.productId || null;
  
  console.log("product",product);
  console.log("productId",productId);
    
    return (
       <Container>
        <ProductCard  title ={"Variants"}>
            <VarientTable
        productId={product?product._id:productId?productId:null}
            ></VarientTable>
        </ProductCard>
       </Container>
    );
}

export default Varient;