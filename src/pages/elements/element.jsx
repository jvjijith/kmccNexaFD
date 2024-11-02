import Container from "../../layout/component/container";
import ElementCard from "../../layout/component/elementCard";
import ElementTable from "../../layout/component/elementTable";

function Element() {


  return (
    <Container>
      <ElementCard title="Element List" button={true} >
      <ElementTable/>
      </ElementCard>
    </Container>
  );
}

export default Element;
