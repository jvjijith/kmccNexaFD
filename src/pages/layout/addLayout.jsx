import Container from "../../layout/component/container";
import LayoutCard from "../../layout/component/layoutCard";
import LayoutForm from "../../layout/component/layoutForm";

function AddLayout() {


  return (
    <Container>
      <LayoutCard title="Add Layout">
        <LayoutForm
        />
      </LayoutCard>
    </Container>
  );
}

export default AddLayout;
