import Container from "../../layout/component/container";
import QuoteCard from "../../layout/component/quoteCard";
import QuoteTable from "../../layout/component/quoteTable";

function Quote() {
    
    return (
       <Container>
        <QuoteCard  title ={"Quote"} button={true}>
            <QuoteTable></QuoteTable>
        </QuoteCard>
       </Container>
    );
}

export default Quote;