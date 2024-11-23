import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import LayoutCard from "../../layout/component/layoutCard";
import LayoutForm from "../../layout/component/layoutForm";

function EditLayout() {

    const location = useLocation();
    const layoutData = location.state?.setting || null;

    console.log("layoutData from first",layoutData);

  return (
    <Container>
      <LayoutCard title="Edit Layout">
        <LayoutForm
        layoutDatas={layoutData ? layoutData : null}
        />
      </LayoutCard>
    </Container>
  );
}

export default EditLayout;
