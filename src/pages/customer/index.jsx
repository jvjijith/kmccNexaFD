import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";
import CustomerTable from "../../layout/component/customerTable";

function Customer() {
    
    return (
       <Container>
        <CustomerCard  title ={"Customer"} button={true}>
            <CustomerTable></CustomerTable>
        </CustomerCard>
       </Container>
    );
}

export default Customer;