import Container from "../../layout/component/container";
import PurchaseOrderCard from "../../layout/component/purchaseOrderCard";
import PurchaseOrderTable from "../../layout/component/purchaseOrderTable";

function PurchaseOrder() {

  return (
    <Container>
      <PurchaseOrderCard title={"Purchase Order"} button={true}>
        <PurchaseOrderTable
        />
      </PurchaseOrderCard>
    </Container>
  );
}

export default PurchaseOrder;
