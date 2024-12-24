import Container from "../../layout/component/container";
import SalesInvoiceCard from "../../layout/component/salesInvoiceCard";
import SalesInvoiceForm from "../../layout/component/salesInvoiceForm";

function AddSalesInvoice() {

  return (
    <Container>
      <SalesInvoiceCard title={"Add Sales Invoice"}>
        <SalesInvoiceForm
        />
      </SalesInvoiceCard>
    </Container>
  );
}

export default AddSalesInvoice;
