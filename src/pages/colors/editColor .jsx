import Container from "../../layout/component/container";
import CustomerForm from "../../layout/component/customerForm";
import ColorCard from "../../layout/component/colorCard";
import ColorForm from "../../layout/component/colorForm";
import { useLocation } from "react-router";

function EditColor() {

  const location = useLocation();
  const scheme = location.state?.scheme || null;
  const colorData = location.state?.colorData || null;

  console.log(scheme);

  return (
    <Container>
      <ColorCard title={"Add Color"}>
        <ColorForm
          colorDatas={scheme ? scheme : null}
          data={colorData ? colorData : null}
        />
      </ColorCard>
    </Container>
  );
}

export default EditColor;
