import Container from "../../layout/component/container";
import CustomerForm from "../../layout/component/customerForm";
import ColorCard from "../../layout/component/colorCard";
import ColorForm from "../../layout/component/colorForm";

function AddColor() {

  return (
    <Container>
      <ColorCard title={"Add Color"}>
        <ColorForm
          
        />
      </ColorCard>
    </Container>
  );
}

export default AddColor;
