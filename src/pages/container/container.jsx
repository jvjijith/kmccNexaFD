import Container from "../../layout/component/container";
import ContainerCard from "../../layout/component/containerCard";
import ContainerTable from "../../layout/component/containerTable";

function Containers() {
    
    return (
        <Container>
          <ContainerCard title={"Containers"} button={true}>
            <ContainerTable></ContainerTable>
        </ContainerCard>
       </Container>
    );
}

export default Containers;