import Container from "../../layout/component/container";
import CategoriesCard from "../../layout/component/categoriesCard";
import SubCategoryTable from "../../layout/component/subCategoryTable";


function SubCategoriesList() {

    return (
        <Container>
         <CategoriesCard type={"subcategory"}  title ={"Sub-Category List"}>
             <SubCategoryTable></SubCategoryTable>
         </CategoriesCard>
        </Container>
     );
}

export default SubCategoriesList;