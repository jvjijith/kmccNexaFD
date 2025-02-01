import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import ContactForm from "../../layout/component/contactForm";
import { useLocation } from "react-router";



function AddContact() {

  const location = useLocation();
  const customerId = location.state?.customerId || null;
  const customer = location.state?.customer || null;
  const contact = location.state?.contact || null;
  const vendor = location.state?.vendor || null;
  const nav = location.state?.nav || null;

  console.log("customer",customer);
  console.log("contact",contact);
  console.log("vendor",vendor);
    return (
       <Container>
           <ContactCard
          
          title={customer ? "Edit Contact" : vendor ? "Add Contact" : contact ? "Edit Contact" : "Add Contact"}
          >
            
          <ContactForm
          
          typeData={contact ? "contacts" : customer? "customer" : vendor? "vendor" : ""}
          contact={customer ? customer : vendor ? vendor : contact ? contact : null}
          custId={customerId}
          nav={nav}
          ></ContactForm>
          </ContactCard>
       </Container>
      );
}

export default AddContact;