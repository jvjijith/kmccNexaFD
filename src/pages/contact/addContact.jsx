import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import ContactForm from "../../layout/component/contactForm";



function AddContact() {

    return (
       <Container>
           <ContactCard
          
            title ={"Add Contact"}
          >
            
          <ContactForm></ContactForm>
          </ContactCard>
       </Container>
      );
}

export default AddContact;