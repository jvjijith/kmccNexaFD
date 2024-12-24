import Container from "../../layout/component/container";
import MenuCard from "../../layout/component/menuCard";
import MenuForm from "../../layout/component/menuForm";

function AddMenu() {


  return (
    <Container>
      <MenuCard title="Add Menu">
        <MenuForm
        />
      </MenuCard>
    </Container>
  );
}

export default AddMenu;