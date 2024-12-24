import Container from "../../layout/component/container";
import MenuCard from "../../layout/component/menuCard";
import MenuTable from "../../layout/component/menuTable";

function Menu() {


  return (
    <Container>
      <MenuCard title="Menu"  button={true}>
      <MenuTable/>
      </MenuCard>
    </Container>
  );
}

export default Menu;
