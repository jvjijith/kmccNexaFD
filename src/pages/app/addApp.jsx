import Container from "../../layout/component/container";
import AppCard from "../../layout/component/appCard";
import AppForm from "../../layout/component/appForm";
import { useLocation } from "react-router";

function AddApp() {

  const location = useLocation();
  const app = location.state?.app || null;

  return (
    <Container>
      <AppCard title={app ? "Edit App Settings" : "Add App Settings"}>
        <AppForm
          typeData={app ? "update" : ""}
          appDatas={app ? app : null}
        />
      </AppCard>
    </Container>
  );
}

export default AddApp;
