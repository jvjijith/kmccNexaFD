import Container from "../../layout/component/container";
import ProductCard from "../../layout/component/productCard";
import ProductTable from "../../layout/component/productTable";

function Product() {
    
    return (
       <Container>
        <ProductCard  title ={"Product"} button={true} >
            <ProductTable></ProductTable>
        </ProductCard>
       </Container>
    );
}

export default Product;