import AddCustomerForm from "../../layout/component/addCustomerForm";
import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";
import CustomerForm from "../../layout/component/customerForm";

function AddCustomer() {
  

  return (
    <Container>
      <CustomerCard title={"Add Customer"}>
        <CustomerForm
          
        />
      </CustomerCard>
    </Container>
  );
}

export default AddCustomer;
