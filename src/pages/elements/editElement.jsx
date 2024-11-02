import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import ElementCard from "../../layout/component/elementCard";
import ElementForm from "../../layout/component/elementForm";

function EditElement() {
  const location = useLocation();
  const element = location.state?.element || null;

console.log(element);
  return (
    <Container>
      <ElementCard title="Add Element">
        <ElementForm
        elementsDatas={element ? element : null}
        />
      </ElementCard>
    </Container>
  );
}

export default EditElement;
