import Container from "../../layout/component/container";
import MembershipCard from "../../layout/component/membershipCard";
import MembershipTable from "../../layout/component/membershipTable";

function Membership() {


  return (
    <Container>
      <MembershipCard title="Membership" >
      <MembershipTable/>
      </MembershipCard>
    </Container>
  );
}

export default Membership;
