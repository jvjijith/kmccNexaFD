import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import ContactForm from "../../layout/component/contactForm";
import { useLocation } from "react-router";



function AddContact() {

  const location = useLocation();
  const customer = location.state?.customer || null;

    return (
       <Container>
           <ContactCard
          
          title={customer ? "Edit Contact" : "Add Contact"}
          >
            
          <ContactForm
          
          typeData={customer ? "update" : ""}
          customerId={customer ? customer._id : null}
          ></ContactForm>
          </ContactCard>
       </Container>
      );
}

export default AddContact;