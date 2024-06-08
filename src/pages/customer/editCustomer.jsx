import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";
import CustomerForm from "../../layout/component/customerForm";



function EditCustomer(props) {

  const location = useLocation();
  const customer = location.state?.customer || null;

  return (
    <Container>
      <CustomerCard title={customer ? "Edit Customer" : "Add Customer"}>
        <CustomerForm
          typeData={customer ? "update" : ""}
          customerId={customer ? customer._id : null}
        />
      </CustomerCard>
    </Container>
  );
}

export default EditCustomer;
