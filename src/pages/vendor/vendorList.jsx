import Container from "../../layout/component/container";
import VendorCard from "../../layout/component/vendorCard";
import VendorTable from "../../layout/component/vendorTable";

function Vendor() {
    
    return (
       <Container>
        <VendorCard  title ={"Vendor"} button={true}>
            <VendorTable></VendorTable>
        </VendorCard>
       </Container>
    );
}

export default Vendor;