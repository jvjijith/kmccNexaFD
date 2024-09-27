import Container from "../../layout/component/container";
import AppCard from "../../layout/component/appCard";
import AppForm from "../../layout/component/appForm";
import { useLocation } from "react-router";

function EditApp() {

  const location = useLocation();
  const app = location.state?.app || null;

  return (
    <Container>
      <AppCard title={app ? "Edit App" : "Add App"}>
        <AppForm
          typeData={app ? "update" : ""}
          appDatas={app ? app : null}
        />
      </AppCard>
    </Container>
  );
}

export default EditApp;
