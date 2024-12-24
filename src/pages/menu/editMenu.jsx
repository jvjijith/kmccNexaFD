import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import MenuCard from "../../layout/component/menuCard";
import MenuForm from "../../layout/component/menuForm";

function EditMenu() {

    const location = useLocation();
    const menu = location.state?.menu || null;

  return (
    <Container>
      <MenuCard title="Add Menu">
        <MenuForm
        menu={menu ? menu : null}
        />
      </MenuCard>
    </Container>
  );
}

export default EditMenu;