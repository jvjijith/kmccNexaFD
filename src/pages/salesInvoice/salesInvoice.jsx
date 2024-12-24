import Container from "../../layout/component/container";
import SalesInvoiceCard from "../../layout/component/salesInvoiceCard";
import SalesInvoiceTable from "../../layout/component/salesinvoiceTable";

function SalesInvoice() {

  return (
    <Container>
      <SalesInvoiceCard title={"Add Sales Invoice"} button={true}>
        <SalesInvoiceTable
        />
      </SalesInvoiceCard>
    </Container>
  );
}

export default SalesInvoice;
