import Container from "../../layout/component/container";
import EventCard from "../../layout/component/eventCard";
import EventForm from "../../layout/component/event/eventForm";

function AddEvent() {


  return (
    <Container>
      <EventCard title="Add Event">
        <EventForm
        />
      </EventCard>
    </Container>
  );
}

export default AddEvent;