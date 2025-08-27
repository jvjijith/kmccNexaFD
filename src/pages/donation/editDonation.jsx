import Container from "../../layout/component/container";
import DonationCard from "../../layout/component/eventCard";
import EventForm from "../../layout/component/donationEvent/eventForm";
import { useLocation } from "react-router-dom";

function EditDonationt() {
  const location = useLocation();
  const event = location.state?.event;

  return (
    <Container>
      <DonationCard title="Edit Donation">
        <EventForm event={event} />
      </DonationCard>
    </Container>
  );
}

export default EditDonationt;