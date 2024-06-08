import AddCustomerForm from "../../layout/component/addCustomerForm";
import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";

function AddCustomer() {
  

  return (
    <Container>
      <CustomerCard title={"Add Customer"}>
        <AddCustomerForm
          
        />
      </CustomerCard>
    </Container>
  );
}

export default AddCustomer;
