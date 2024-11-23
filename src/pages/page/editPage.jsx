import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import PageCard from "../../layout/component/pageCard";
import PageForm from "../../layout/component/pageForm";

function EditPage() {
    const location = useLocation();
    const page = location.state?.page || null;


  return (
    <Container>
      <PageCard title="Edit Page">
        <PageForm
        pageDatas={page ? page : null}
        />
      </PageCard>
    </Container>
  );
}

export default EditPage;