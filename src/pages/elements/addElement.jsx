import Container from "../../layout/component/container";
import ElementCard from "../../layout/component/elementCard";
import ElementForm from "../../layout/component/elementForm";

function AddElement() {


  return (
    <Container>
      <ElementCard title="Add Element">
        <ElementForm
        />
      </ElementCard>
    </Container>
  );
}

export default AddElement;
