import Container from "../../layout/component/container";
import CustomerCard from "../../layout/component/customerCard";
import CustomerForm from "../../layout/component/customerForm";



function EditCustomer(props) {

  return (
    <Container>
      <CustomerCard
       
        title={"Edit Customer"}
      >
        <CustomerForm></CustomerForm>
      </CustomerCard>
    </Container>
  );
}

export default EditCustomer;
