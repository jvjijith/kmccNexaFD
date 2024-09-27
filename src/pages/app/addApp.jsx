import Container from "../../layout/component/container";
import AppCard from "../../layout/component/appCard";
import AppForm from "../../layout/component/appForm";

function AddApp() {


  return (
    <Container>
      <AppCard title="Add App">
        <AppForm
        />
      </AppCard>
    </Container>
  );
}

export default AddApp;
