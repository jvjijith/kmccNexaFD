import Container from "../../layout/component/container";
import ContactCard from "../../layout/component/contactCard";
import ContactTable from "../../layout/component/contactTable";


function Contact() {
    return (
        <Container>
         <ContactCard  title ={"Contacts List"}>
             <ContactTable></ContactTable>
         </ContactCard>
        </Container>
     );
}

export default Contact;