import Container from "../../layout/component/container";
import CategoriesCard from "../../layout/component/categoriesCard";
import CategoryForm from "../../layout/component/categoryForm";


function AddCategories() {

    return (
        <Container>
         <CategoriesCard  title ={"Category List"}>
             <CategoryForm></CategoryForm>
         </CategoriesCard>
        </Container>
     );
}

export default AddCategories;