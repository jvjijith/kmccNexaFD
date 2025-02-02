import Container from "../../layout/component/container";
import EventCard from "../../layout/component/eventCard";
import EventTable from "../../layout/component/EVENTtABLE.JSX";

function Event() {


  return (
    <Container>
      <EventCard title="Events"  button={true}>
      <EventTable/>
      </EventCard>
    </Container>
  );
}

export default Event;
