import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import ContactForm from "../../layout/component/contactForm";
import { useLocation } from "react-router";



function AddContact() {

  const location = useLocation();
  const customer = location.state?.customer || null;
  const contact = location.state?.contact || null;

    return (
       <Container>
           <ContactCard
          
          title={customer ? "Edit Contact" : contact ? "Edit Contact" : "Add Contact"}
          >
            
          <ContactForm
          
          typeData={customer ? "update" : contact ? "contacts" : ""}
          customerId={customer ? customer._id : contact ? contact._id : null}
          ></ContactForm>
          </ContactCard>
       </Container>
      );
}

export default AddContact;