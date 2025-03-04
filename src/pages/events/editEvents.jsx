import { useLocation } from "react-router";
import Container from "../../layout/component/container";
import EventForm from "../../layout/component/event/eventForm";
import EventCard from "../../layout/component/eventCard";

function EditEvent() {

    const location = useLocation();
    const event = location.state?.event || null;

  return (
    <Container>
      <EventCard title="Add Event">
        <EventForm
        event={event ? event : null}
        />
      </EventCard>
    </Container>
  );
}

export default EditEvent;