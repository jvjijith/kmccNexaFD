import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import CustomerContactTable from "../../layout/component/customerContactTable";
import { useLocation } from "react-router";


function CustomerContact() {

    const location = useLocation();
  const customer = location.state?.customer || null;
  const vendor = location.state?.vendor || null;


  console.log("customer",customer);
  console.log("vendor",vendor);

    return (
        <Container>
         <ContactCard  title ={"Contacts List"}>
             <CustomerContactTable
             customerId={customer?customer._id:vendor._id}
             ></CustomerContactTable>
         </ContactCard>
        </Container>
     );
}

export default CustomerContact;