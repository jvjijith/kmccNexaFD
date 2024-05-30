import Container from "../../layout/component/container";
import TeamTable from "../../layout/component/teamTable";
import TeamCard from "../../layout/component/teamCard";

function Team() {
    
    return (
        <Container>
        <TeamCard  title ={"Teams"}>
            <TeamTable></TeamTable>
        </TeamCard>
       </Container>
    );
}

export default Team;