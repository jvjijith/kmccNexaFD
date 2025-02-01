import Container from "../../layout/component/container";
import CategoriesCard from "../../layout/component/categoriesCard";
import CategoryTable from "../../layout/component/categoryTable";


function CategoriesList() {

    return (
        <Container>
         <CategoriesCard  title ={"Category List"}>
             <CategoryTable nav={"customer"}></CategoryTable>
         </CategoriesCard>
        </Container>
     );
}

export default CategoriesList;