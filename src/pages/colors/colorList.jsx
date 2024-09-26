import ColorCard from "../../layout/component/colorCard";
import ColorTable from "../../layout/component/colorTable";
import Container from "../../layout/component/container";

function Color() {
    
    return (
       <Container>
        <ColorCard title ={"Colors List"} button={true}>
            <ColorTable></ColorTable>
        </ColorCard>
       </Container>
    );
}

export default Color;