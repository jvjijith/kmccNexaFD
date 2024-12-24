import Container from "../../layout/component/container";
import PurchaseOrderCard from "../../layout/component/purchaseOrderCard";
import PurchaseOrderForm from "../../layout/component/purchaseOrderForm";

function AddPurchaseOrder() {

  return (
    <Container>
      <PurchaseOrderCard title={"Add Purchase Order"}>
        <PurchaseOrderForm
        />
      </PurchaseOrderCard>
    </Container>
  );
}

export default AddPurchaseOrder;
