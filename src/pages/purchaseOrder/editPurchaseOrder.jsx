import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import PurchaseOrderCard from "../../layout/component/purchaseOrderCard";
import PurchaseOrderForm from "../../layout/component/purchaseOrderForm";

function EditPurchaseOrder() {

    const location = useLocation();
    const po = location.state?.po || null;

    console.log('po',po)

  return (
    <Container>
      <PurchaseOrderCard title={"Edit Purchase Order"}>
        <PurchaseOrderForm
        purchaseOrder={po ? po : null}
        />
      </PurchaseOrderCard>
    </Container>
  );
}

export default EditPurchaseOrder;
