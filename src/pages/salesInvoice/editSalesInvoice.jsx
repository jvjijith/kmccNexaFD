import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import SalesInvoiceCard from "../../layout/component/salesInvoiceCard";
import SalesInvoiceForm from "../../layout/component/salesInvoiceForm";

function EditSalesInvoice() {
    const location = useLocation();
    const invoice = location.state?.invoice || null;

  return (
    <Container>
      <SalesInvoiceCard title={"Edit Sales Invoice"}>
        <SalesInvoiceForm
        invoiceData={invoice ? invoice : null}
        />
      </SalesInvoiceCard>
    </Container>
  );
}

export default EditSalesInvoice;
