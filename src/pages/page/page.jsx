import Container from "../../layout/component/container";
import PageCard from "../../layout/component/pageCard";
import PageTable from "../../layout/component/pageTable";

function Page() {


  return (
    <Container>
      <PageCard title="Page"  button={true}>
        <PageTable
        />
      </PageCard>
    </Container>
  );
}

export default Page;