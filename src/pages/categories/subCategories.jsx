import Container from "../../layout/component/container";
import CategoriesCard from "../../layout/component/categoriesCard";
import SubCategoryTable from "../../layout/component/subCategoryTable";
import { useLocation } from "react-router";


function SubCategoriesList() {

    const location = useLocation();
    const category = location.state?.category || null;

    return (
        <Container>
         <CategoriesCard type={"subcategory"}  title ={"Sub-Category List"}>
             <SubCategoryTable categoryId={category?category._id:null}></SubCategoryTable>
         </CategoriesCard>
        </Container>
     );
}

export default SubCategoriesList;