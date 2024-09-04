import { useEffect } from "react";
import AddCustomerForm from "../../layout/component/addCustomerForm";
import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";
import CustomerForm from "../../layout/component/customerForm";

function AddCustomer() {
  
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

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
