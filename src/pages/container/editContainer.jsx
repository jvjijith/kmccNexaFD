import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import ContainerCard from "../../layout/component/containerCard";
import ContainerForm from "../../layout/component/containerForm";

function EditContainer() {
  
  const location = useLocation();
  const container = location.state?.container || null;

  console.log("container",container);

  return (
    <Container>
      <ContainerCard title={"Edit Container"}>
        <ContainerForm
          container={container ? container : null}
        />
      </ContainerCard>
    </Container>
  );
}

export default EditContainer;
