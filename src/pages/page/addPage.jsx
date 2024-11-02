import Container from "../../layout/component/container";
import PageCard from "../../layout/component/pageCard";
import PageForm from "../../layout/component/pageForm";

function AddPage() {


  return (
    <Container>
      <PageCard title="Add Page">
        <PageForm
        />
      </PageCard>
    </Container>
  );
}

export default AddPage;