import "./App.css";
import AddCustomer from "./pages/customer/addCustomer";
import Dashboard from "./pages/dashboard/dashboard";
import Forgot from "./pages/login/forgot";
import Login from "./pages/login/login";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./routes/privateRoute";
import PublicRoute from "./routes/publicRoute";
import Customer from "./pages/customer";
import AddContact from "./pages/contact/addContact";
import Contact from "./pages/contact";
import Loading from "./pages/loading/loading";
import { ApiProvider } from "./common/api";
import Group from "./pages/groups";
import Team from "./pages/adminAndSecurity/teamList";
import AddUser from "./pages/adminAndSecurity/addUser";
import User from "./pages/adminAndSecurity/userList";
import Profile from "./pages/profilePage/profile";
import AddVendor from "./pages/vendor/addVendor";
import Vendor from "./pages/vendor/vendorList";
import EditCustomer from "./pages/customer/editCustomer";
import EditVendor from "./pages/vendor/editVendor";
import AddProduct from "./pages/product/addProduct";
import AddVarient from "./pages/product/addVarients";
import Product from "./pages/product/productLIst";
import AddPrice from "./pages/price/addPrice";
import ListPrice from "./pages/price/priceList";
import CustomerContact from "./pages/contact/customerContacts";
import CategoriesList from "./pages/categories/categoriesList";
import AddCategories from "./pages/categories/addCategory";
import CustomerProfile from "./pages/customer/customerProfile";
import CustomerContacts from "./layout/ui/profile/customerProfile/contact";
import CustomerDetails from "./layout/ui/profile/customerProfile/details";
import Varient from "./pages/product/varientList";
import ProductProfile from "./pages/product/productProfile";
import ProductDetails from "./layout/ui/profile/productProfile/productDetails";
import VariantDetails from "./layout/ui/profile/productProfile/variantDetails";
import PriceDetails from "./layout/ui/profile/productProfile/priceDetails";
import ComingSoonPage from "./pages/comingSoon/comingSoon";
import SubCategoriesList from "./pages/categories/subCategories";
import CatalogPage from "./pages/catalog/catalogPage";
import CatalogList from "./pages/catalog/catalogList";
import EditProduct from "./pages/product/editProduct";
import AddApp from "./pages/app/addApp";
import ListApp from "./pages/app/appList";
import AddColor from "./pages/colors/addColor";
import EditApp from "./pages/app/editApp";
import Color from "./pages/colors/colorList";
import EditColor from "./pages/colors/editColor ";
import AddLayout from "./pages/layout/addLayout";
import Layout from "./pages/layout/layout";
import AddElement from "./pages/elements/addElement";
import Element from "./pages/elements/element";
import EditElement from "./pages/elements/editElement";
import AddContainer from "./pages/container/addContainer";
import AddPage from "./pages/page/addPage";
import AddOrganization from "./pages/organization/addOrganization";
import AddQuote from "./pages/quote/addQuote";
import Containers from "./pages/container/container";
import EditContainer from "./pages/container/editContainer";
import AddEnquiry from "./pages/enquiry/addEnquiry";
import Enquiry from "./pages/enquiry/enquiry";
import EditEnquiry from "./pages/enquiry/editEnquiry";
import EditLayout from "./pages/layout/editLayout";
import Quote from "./pages/quote/quote";
import EditQuote from "./pages/quote/editQuote";
import Organization from "./pages/organization/organization";
import EditOrganization from "./pages/organization/editOrganization";
import Page from "./pages/page/page";
import EditPage from "./pages/page/editPage";
import QuotesProfile from "./pages/quote/profile";
import AddPurchaseOrder from "./pages/purchaseOrder/addPurchaseOrder";
import AddSalesInvoice from "./pages/salesInvoice/addSalesInvoice";
import AddVendorQuoteRequest from "./pages/vendorQuoteRequest/addVendorQuoteRequest";
import SalesInvoice from "./pages/salesInvoice/salesInvoice";
import EditSalesInvoice from "./pages/salesInvoice/editSalesInvoice";
import PurchaseOrder from "./pages/purchaseOrder/purchaseOrder";
import EditPurchaseOrder from "./pages/purchaseOrder/editPurchaseOrder";
import VendorQuoteRequest from "./pages/vendorQuoteRequest/vendorQuoteRequest";
import EditVendorQuoteRequest from "./pages/vendorQuoteRequest/editVendorQuoteRequest";
import AddMenu from "./pages/menu/addMenu";
import Menu from "./pages/menu/menu";
import EditMenu from "./pages/menu/editMenu";
import UserTeamPermission from "./pages/userTeamPermission/userTeamPermission";
import AddUserTeamPermission from "./pages/userTeamPermission/addUserTeamPermission";

const App = () => {
  return (
    <ApiProvider>
 <BrowserRouter>
      <Routes>
      <Route element={<ProtectedRoute></ProtectedRoute>}>
      <Route exact path="/" element={<Dashboard></Dashboard>}></Route>
      <Route exact path="home" element={<Dashboard></Dashboard>}></Route> 
      <Route exact path="customer" element={<Customer></Customer>}></Route> 
      <Route exact path="vendor/list" element={<Vendor></Vendor>}></Route>
      <Route exact path="admin/teams" element={<Team></Team>}></Route>
      <Route exact path="admin/viewuser" element={<User></User>}></Route>
      <Route exact path="vendor/contacts" element={<Contact></Contact>}></Route>
      <Route exact path="customer/contacts" element={<Contact></Contact>}></Route>
      <Route exact path="vendor/add" element={<AddVendor></AddVendor>}></Route>
      <Route exact path="vendor/edit" element={<EditVendor></EditVendor>}></Route>
      <Route exact path="group" element={<Group></Group>}></Route>      
      <Route exact path="/customer/editContact" element={<CustomerContact></CustomerContact>}></Route> 
      <Route exact path="contact/addContact" element={<AddContact></AddContact>}></Route>      
      <Route exact path="/vendor/editContact" element={<CustomerContact></CustomerContact>}></Route>      
      <Route exact path="addContact" element={<AddContact></AddContact>}></Route>
      <Route exact path="loading" element={<Loading></Loading>}></Route>
      <Route path="customer/add" element={<AddCustomer />} />
      <Route path="customer/edit" element={<EditCustomer />} />
      <Route path="admin/adduser" element={<AddUser />} />
      <Route path="admin/edituser" element={<AddUser />} />
      <Route path="product/add" element={<AddProduct />} />
      <Route path="product/edit" element={<EditProduct />} />
      <Route path="product/list" element={<Product />} />
      <Route path="variant/list" element={<Varient />} />
      <Route path="variant/add" element={<AddVarient />} />
      <Route path="product/prices" element={<ListPrice />} />
      <Route path="customer/category" element={<CategoriesList />} />
      <Route path="vendor/category" element={<CategoriesList />} />
      <Route path="product/category" element={<CategoriesList />} />
      <Route path="category/subcategory" element={<SubCategoriesList />} />
      <Route path="addcategory" element={<AddCategories />} />
      <Route path="product/catalog" element={<CatalogList />} />
      <Route path="product/inventory" element={<ComingSoonPage />} />
      <Route path="services/category" element={<ComingSoonPage />} />
      <Route path="services/add" element={<ComingSoonPage />} />
      <Route path="services/list" element={<ComingSoonPage />} />
      <Route path="services/prices" element={<ComingSoonPage />} />
      <Route path="presales/quotes/add" element={<ComingSoonPage />} />
      <Route path="presales/quotes/view" element={<Quote />} />
      <Route path="presales/enquiry/add" element={<ComingSoonPage />} />
      <Route path="presales/enquiry/list" element={<Enquiry />} />
      <Route path="presales/purchaseorder/add" element={<ComingSoonPage />} />
      <Route path="presales/purchaseorder/list" element={<PurchaseOrder />} />
      <Route path="/presales/salesInvoice/list" element={<SalesInvoice />} />
      <Route path="presales/deliverynote/add" element={<ComingSoonPage />} />
      <Route path="presales/deliverynote/list" element={<ComingSoonPage />} />
      <Route path="delivery/shippingcarrier" element={<ComingSoonPage />} />
      <Route path="delivery/logisticmanagement" element={<ComingSoonPage />} />
      <Route path="delivery/byowner" element={<ComingSoonPage />} />
      <Route path="delivery/tracking" element={<ComingSoonPage />} />
      <Route path="store/ordermanagement/add" element={<ComingSoonPage />} />
      <Route path="store/ordermanagement/list" element={<ComingSoonPage />} />
      <Route path="store/ordermanagement/cancel" element={<ComingSoonPage />} />
      <Route path="store/ordermanagement/refund" element={<ComingSoonPage />} />
      <Route path="store/rfq/add" element={<ComingSoonPage />} />
      <Route path="store/rfq/view" element={<ComingSoonPage />} />
      <Route path="store/rfq/cancel" element={<ComingSoonPage />} />
      <Route path="store/rfq/send" element={<ComingSoonPage />} />
      <Route path="store/appmanagement/appsetting/add" element={<AddApp />} />
      <Route path="store/appmanagement/appsetting/edit" element={<EditApp />} />
      <Route path="store/appmanagement/appsetting/list" element={<ListApp />} />
      <Route path="store/appmanagement/page" element={<Page />} />
      <Route path="store/appmanagement/geoblocking" element={<ComingSoonPage />} />
      <Route path="store/appmanagement/layout" element={<Layout />} />
      <Route path="store/appmanagement/element" element={<Element />} />
      <Route path="store/appmanagement/container" element={<Containers />} />
      <Route path="store/appmanagement/menu" element={<ComingSoonPage />} />
      <Route path="store/appmanagement/paymentconfig" element={<ComingSoonPage />} />
      <Route path="store/appmanagement/mailtemplate" element={<ComingSoonPage />} />
      <Route path="store/appmanagement/branding" element={<ComingSoonPage />} />
      <Route path="store/payment/list" element={<ComingSoonPage />} />
      <Route path="store/payment/cancel" element={<ComingSoonPage />} />
      <Route path="store/payment/refund" element={<ComingSoonPage />} />
      <Route path="store/color/add" element={<AddColor />} />
      <Route path="store/color/edit" element={<EditColor />} />
      <Route path="store/color/list" element={<Color />} />
      <Route path="reporting/reports" element={<ComingSoonPage />} />
      <Route path="reporting/analytics" element={<ComingSoonPage />} />
      <Route path="admin/organization" element={<Organization />} />
      <Route path="admin/userpermission" element={<ComingSoonPage />} />
      <Route path="admin/logininfo" element={<ComingSoonPage />} />
      <Route path="admin/logs" element={<ComingSoonPage />} />
      <Route path="layout/add" element={<AddLayout />} />
      <Route path="layout/edit" element={<EditLayout />} />
      <Route path="layout" element={<Layout />} />
      <Route path="element/add" element={<AddElement />} />
      <Route path="element/edit" element={<EditElement />} />
      <Route path="element" element={<Element />} />
      <Route path="container" element={<Containers />} />
      <Route path="container/add" element={<AddContainer />} />
      <Route path="container/edit" element={<EditContainer />} />
      <Route path="page/add" element={<AddPage />} />
      <Route path="page/edit" element={<EditPage />} />
      <Route path="page" element={<Page />} />
      <Route path="enquiry/add" element={<AddEnquiry />} />
      <Route path="enquiry/edit" element={<EditEnquiry />} />
      <Route path="enquiry" element={<Enquiry />} />
      <Route path="organization/add" element={<AddOrganization />} />
      <Route path="purchaseorder/add" element={<AddPurchaseOrder />} />
      <Route path="purchaseorder/edit" element={<EditPurchaseOrder />} />
      <Route path="purchaseorder" element={<PurchaseOrder />} />
      <Route path="salesinvoice/add" element={<AddSalesInvoice />} />
      <Route path="salesinvoice/edit" element={<EditSalesInvoice />} />
      <Route path="salesinvoice" element={<SalesInvoice />} />
      <Route path="quoterequest/add" element={<AddVendorQuoteRequest />} />
      <Route path="quoterequest/edit" element={<EditVendorQuoteRequest />} />
      <Route path="quoterequest" element={<VendorQuoteRequest />} />
      <Route path="organization/edit" element={<EditOrganization />} />
      <Route path="organization" element={<Organization />} />
      <Route path="quote/add" element={<AddQuote />} />
      <Route path="quote/edit" element={<EditQuote />} />
      <Route path="quote" element={<Quote />} />
      <Route path="menu/add" element={<AddMenu />} />
      <Route path="menu/edit" element={<EditMenu />} />
      <Route path="menu" element={<Menu />} />
      <Route path="permission" element={<UserTeamPermission />} />
      <Route path="permission/add" element={<AddUserTeamPermission />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="profile/:userId/details" element={<Profile />} />
            <Route path="/profile/:id" element={<CustomerProfile />}>
                <Route path="customerdetails" element={<CustomerDetails />} />
                <Route path="contacts" element={<CustomerContacts />} />
            </Route>
            <Route path="/product/profile/:id" element={<ProductProfile />}>
                <Route path="productdetails" element={<ProductDetails />} />
                <Route path="variants" element={<VariantDetails />} />
                <Route path="price" element={<PriceDetails />} />
            </Route>
            <Route path="/quote/:id" element={<QuotesProfile />}>
            <Route path="details" element={<QuotesProfile />} />
            <Route path="products" element={<ComingSoonPage />} />
            </Route>
      </Route>

      <Route element={<PublicRoute></PublicRoute>}>
      <Route path="login" element={<Login />} />
      <Route path="forgot" element={<Forgot />} />
      </Route>
     
  
      
       
     
      </Routes>
    </BrowserRouter>
    </ApiProvider>
   
  );
};

export default App;
