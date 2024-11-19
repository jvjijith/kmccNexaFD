import Container from "../../layout/component/container";
import QuoteCard from "../../layout/component/quoteCard";
import QuoteForm from "../../layout/component/quoteForm";

function AddQuote() {

  return (
    <Container>
      <QuoteCard title={"Add Quotes"}>
        <QuoteForm
        />
      </QuoteCard>
    </Container>
  );
}

export default AddQuote;
