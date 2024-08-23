import Container from "../../layout/component/container";
import ContactForm from "../../layout/component/contactForm";
import ComingSoonCard from "../../layout/component/comingSoonCard";
import ComingSoon from "../../layout/component/comingSoon";


function ComingSoonPage() {

    return (
       <Container>
           <ComingSoonCard >
            <ComingSoon/>
          </ComingSoonCard>
       </Container>
      );
}

export default ComingSoonPage;