import Container from "../../layout/component/container";
import DonationCard from "../../layout/component/eventCard";
import EventForm from "../../layout/component/donationEvent/eventForm";

function AddDonationt() {


  return (
    <Container>
      <DonationCard title="Add Donation">
        <EventForm
        />
      </DonationCard>
    </Container>
  );
}

export default AddDonationt;