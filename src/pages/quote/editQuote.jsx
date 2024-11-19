import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import QuoteCard from "../../layout/component/quoteCard";
import QuoteForm from "../../layout/component/quoteForm";

function EditQuote() {
    const location = useLocation();
    const quote = location.state?.quote || null;

  return (
    <Container>
      <QuoteCard title={"Edit Quotes"}>
        <QuoteForm
          quotes={quote ? quote : null}
        />
      </QuoteCard>
    </Container>
  );
}

export default EditQuote;
