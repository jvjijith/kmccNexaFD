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
import EditUserTeamPermission from "./pages/userTeamPermission/editUserTeamPermission";
import UserTeamPermissionsPage from "./routes/userPermission";
import ErrorPage from "./pages/error/errorPage";
import VendorProfile from "./pages/vendor/vendorProfile";
import VendorDetails from "./layout/ui/profile/vendorProfile/details";
import VendorContacts from "./layout/ui/profile/vendorProfile/contact";
import Event from "./pages/events/events";
import AddEvent from "./pages/events/addEvents";
import CreateEvent from "./layout/component/event/createEvent";
import EditEvent from "./pages/events/editEvents";
import Membership from "./pages/membership/membership";

const App = () => {
  return (
    <ApiProvider>
 <BrowserRouter>
      <Routes>
      <Route element={<ProtectedRoute></ProtectedRoute>}>
      <Route exact path="/" element={<Dashboard></Dashboard>}></Route>
      <Route exact path="home" element={<Dashboard></Dashboard>}></Route>  
      <Route path="customer/add" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"create"} page={<AddCustomer />} />} />
      <Route exact path="customer/list" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"view"} page={<Customer/>} />}></Route>
      <Route path="/customer/profile/:id" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"view"} page={<CustomerProfile />} />}>
        <Route path="customerdetails" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"view"} page={<CustomerDetails />} />} />
        <Route path="contacts" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"view"} page={<CustomerContacts />} />} />
      </Route>
      <Route path="customer/edit" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"update"} page={<EditCustomer />} />} />
      <Route exact path="/customer/contact" element={<UserTeamPermissionsPage requiredModule={"contacts"} permission={"view"} page={<CustomerContact></CustomerContact>} />}></Route> 
      <Route exact path="customer/addcontact" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"create"} page={<AddContact></AddContact>} />}></Route> 
      <Route exact path="customer/editcontact" element={<UserTeamPermissionsPage requiredModule={"customers"} permission={"update"} page={<AddContact></AddContact>} />}></Route> 
      <Route path="customer/category" element={<UserTeamPermissionsPage requiredModule={"categories"} permission={"view"} page={<CategoriesList />} />} />
      <Route path="customer/category/subcategory" element={<UserTeamPermissionsPage requiredModule={"subcategories"} permission={"view"} page={<SubCategoriesList />} />} />
      <Route exact path="contact" element={<UserTeamPermissionsPage requiredModule={"contacts"} permission={"view"} page={<Contact></Contact>} />}></Route>
      <Route exact path="vendor/add" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"create"} page={<AddVendor></AddVendor>} />}></Route>
      <Route exact path="vendor/list" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"view"} page={<Vendor></Vendor>} />}></Route>
      <Route path="/vendor/profile/:id" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"view"} page={<VendorProfile />} />}>
        <Route path="vendordetails" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"view"} page={<VendorDetails />} />} />
        <Route path="contacts" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"view"} page={<VendorContacts />} />} />
      </Route>
      <Route exact path="vendor/edit" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"update"} page={<EditVendor></EditVendor>} />}></Route>
      <Route exact path="/vendor/editContact" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"update"} page={<CustomerContact></CustomerContact>} />}></Route> 
      <Route path="vendor/category" element={<UserTeamPermissionsPage requiredModule={"vendors"} permission={"view"} page={<CategoriesList />} />} />
      <Route exact path="contact" element={<UserTeamPermissionsPage requiredModule={"contacts"} permission={"view"} page={<Contact></Contact>} />}></Route>
      <Route exact path="contact/edit" element={<UserTeamPermissionsPage requiredModule={"contacts"} permission={"update"} page={<AddContact></AddContact>} />}></Route>
      <Route path="product/add" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"create"} page={<AddProduct />} />} />
      <Route path="product/list" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<Product />} />} />
      <Route path="/product/profile/:id" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<ProductProfile />} />}>
        <Route path="productdetails" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<ProductDetails />} />} />
        <Route path="variants" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<VariantDetails />} />} />
        <Route path="price" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<PriceDetails />} />} />
      </Route>
      <Route path="product/edit" element={<UserTeamPermissionsPage requiredModule={"products"} permission={"view"} page={<EditProduct />} />} />
      <Route path="variant/list" element={<UserTeamPermissionsPage requiredModule={"variants"} permission={"view"} page={<Varient />} />} />
      <Route path="variant/add" element={<UserTeamPermissionsPage requiredModule={"variants"} permission={"update"} page={<AddVarient />} />} />
      <Route path="product/category" element={<UserTeamPermissionsPage requiredModule={"categories"} permission={"view"} page={<CategoriesList />} />} />
      <Route path="product/catalog" element={<UserTeamPermissionsPage requiredModule={"catalogues"} permission={"view"} page={<CatalogList />} />} />
      <Route path="catalog/add" element={<UserTeamPermissionsPage requiredModule={"catalogues"} permission={"create"} page={<CatalogPage />} />} />
      <Route path="catalog/edit" element={<UserTeamPermissionsPage requiredModule={"catalogues"} permission={"update"} page={<CatalogPage />} />} />
      <Route path="product/prices" element={<UserTeamPermissionsPage requiredModule={"pricing"} permission={"view"} page={<ListPrice />} />} />
      <Route path="product/inventory" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="services/category" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="services/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="services/list" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="services/prices" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="presales/quotes/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="presales/quotes/view" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"view"} page={<Quote />} />} />
      <Route path="quote/add" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"create"} page={<AddQuote />} />} />
      <Route path="quote/edit" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"update"} page={<EditQuote />} />} />
      <Route path="/quote/:id" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"update"} page={<QuotesProfile />} />}>
        <Route path="details" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"update"} page={<QuotesProfile />} />} />
        <Route path="products" element={<UserTeamPermissionsPage requiredModule={"quotes"} permission={"update"} page={<ComingSoonPage />} />} />
      </Route>
      <Route path="presales/enquiry/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="presales/enquiry/list" element={<UserTeamPermissionsPage requiredModule={"enquiries"} permission={"view"} page={<Enquiry />} />} />
      <Route path="enquiry/add" element={<UserTeamPermissionsPage requiredModule={"enquiries"} permission={"create"} page={<AddEnquiry />} />} />
      <Route path="enquiry/edit" element={<UserTeamPermissionsPage requiredModule={"enquiries"} permission={"update"} page={<EditEnquiry />} />} />
      <Route path="presales/purchaseorder/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="presales/purchaseorder/list" element={<UserTeamPermissionsPage requiredModule={"purchaseorders"} permission={"view"} page={<PurchaseOrder />} />} />
      <Route path="purchaseorder/add" element={<UserTeamPermissionsPage requiredModule={"purchaseorders"} permission={"create"} page={<AddPurchaseOrder />} />} />
      <Route path="purchaseorder/edit" element={<UserTeamPermissionsPage requiredModule={"purchaseorders"} permission={"update"} page={<EditPurchaseOrder />} />} />
      <Route path="/presales/salesInvoice/list" element={<UserTeamPermissionsPage requiredModule={"salesinvoices"} permission={"view"} page={<SalesInvoice />} />} />
      <Route path="salesinvoice/add" element={<UserTeamPermissionsPage requiredModule={"salesinvoices"} permission={"create"} page={<AddSalesInvoice />} />} />
      <Route path="salesinvoice/edit" element={<UserTeamPermissionsPage requiredModule={"salesinvoices"} permission={"update"} page={<EditSalesInvoice />} />} />
      <Route path="presales/deliverynote/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="presales/deliverynote/list" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="delivery/shippingcarrier" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="delivery/logisticmanagement" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="delivery/byowner" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="delivery/tracking" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/ordermanagement/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/ordermanagement/list" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/ordermanagement/cancel" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/ordermanagement/refund" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/rfq/add" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/rfq/view" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/rfq/cancel" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/rfq/send" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/appmanagement/appsetting/list" element={<UserTeamPermissionsPage requiredModule={"apps"} permission={"view"} page={<ListApp />} />} />
      <Route path="store/appmanagement/appsetting/add" element={<UserTeamPermissionsPage requiredModule={"apps"} permission={"create"} page={<AddApp />} />} />
      <Route path="store/appmanagement/appsetting/edit" element={<UserTeamPermissionsPage requiredModule={"apps"} permission={"update"} page={<EditApp />} />} />
      <Route path="store/appmanagement/page" element={<UserTeamPermissionsPage requiredModule={"pages"} permission={"view"} page={<Page />} />} />
      <Route path="page/add" element={<UserTeamPermissionsPage requiredModule={"pages"} permission={"create"} page={<AddPage />} />} />
      <Route path="page/edit" element={<UserTeamPermissionsPage requiredModule={"pages"} permission={"update"} page={<EditPage />} />} />
      <Route path="store/appmanagement/geoblocking" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/appmanagement/layout" element={<UserTeamPermissionsPage requiredModule={"layoutsettings"} permission={"view"} page={<Layout />} />} />
      <Route path="layout/add" element={<UserTeamPermissionsPage requiredModule={"layoutsettings"} permission={"create"} page={<AddLayout />} />} />
      <Route path="layout/edit" element={<UserTeamPermissionsPage requiredModule={"layoutsettings"} permission={"update"} page={<EditLayout />} />} />
      <Route path="store/appmanagement/element" element={<UserTeamPermissionsPage requiredModule={"elements"} permission={"view"} page={<Element />} />} />
      <Route path="element/add" element={<UserTeamPermissionsPage requiredModule={"elements"} permission={"create"} page={<AddElement />} />} />
      <Route path="element/edit" element={<UserTeamPermissionsPage requiredModule={"elements"} permission={"update"} page={<EditElement />} />} />
      <Route path="store/appmanagement/container" element={<UserTeamPermissionsPage requiredModule={"containers"} permission={"view"} page={<Containers />} />} />
      <Route path="container/add" element={<UserTeamPermissionsPage requiredModule={"containers"} permission={"create"} page={<AddContainer />} />} />
      <Route path="container/edit" element={<UserTeamPermissionsPage requiredModule={"containers"} permission={"update"} page={<EditContainer />} />} />
      <Route path="store/appmanagement/menu" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"view"} page={<Menu />} />} />
      <Route path="store/appmanagement/paymentconfig" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/appmanagement/mailtemplate" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/appmanagement/branding" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/payment/list" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/payment/cancel" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/payment/refund" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="store/color/add" element={<UserTeamPermissionsPage requiredModule={"colorschemes"} permission={"create"} page={<AddColor />} />} />
      <Route path="store/color/edit" element={<UserTeamPermissionsPage requiredModule={"colorschemes"} permission={"update"} page={<EditColor />} />} />
      <Route path="store/color/list" element={<UserTeamPermissionsPage requiredModule={"colorschemes"} permission={"view"} page={<Color />} />} />
      <Route path="reporting/reports" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="reporting/analytics" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="admin/organization" element={<UserTeamPermissionsPage requiredModule={"organizations"} permission={"view"} page={<Organization />} />} />
      <Route path="organization/add" element={<UserTeamPermissionsPage requiredModule={"organizations"} permission={"create"} page={<AddOrganization />} />} />
      <Route path="organization/edit" element={<UserTeamPermissionsPage requiredModule={"organizations"} permission={"update"} page={<EditOrganization />} />} />
      <Route path="admin/teams" element={<UserTeamPermissionsPage requiredModule={"teams"} permission={"view"} page={<Team></Team>} />}></Route>
      <Route path="admin/adduser" element={<UserTeamPermissionsPage requiredModule={"authentication"} permission={"create"} page={<AddUser />} />} />
      <Route path="admin/viewuser" element={<UserTeamPermissionsPage requiredModule={"authentication"} permission={"view"} page={<User></User>} />}></Route>
      <Route path="profile/:userId/details" element={<UserTeamPermissionsPage requiredModule={"authentication"} permission={"view"} page={<Profile />} />} />
      <Route path="admin/edituser" element={<UserTeamPermissionsPage requiredModule={"authentication"} permission={"update"} page={<AddUser />} />} />
      <Route path="admin/userpermission" element={<UserTeamPermissionsPage requiredModule={"User Team Permissions"} permission={"view"} page={<UserTeamPermission />} />} />
      <Route path="admin/logininfo" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="admin/logs" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<ComingSoonPage />} />} />
      <Route path="loading" element={<Loading></Loading>}></Route>

      <Route path="group" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Group></Group>} />}></Route>                
      <Route path="addContact" element={<UserTeamPermissionsPage requiredModule={"contacts"} permission={"create"} page={<AddContact></AddContact>} />}></Route>
      <Route path="addcategory" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<AddCategories />} />} />
      <Route path="layout" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Layout />} />} />
      <Route path="element" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Element />} />} />
      <Route path="container" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Containers />} />} />
      <Route path="page" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Page />} />} />
      <Route path="enquiry" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Enquiry />} />} />
      <Route path="purchaseorder" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<PurchaseOrder />} />} />
      <Route path="salesinvoice" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<SalesInvoice />} />} />
      <Route path="quoterequest/add" element={<UserTeamPermissionsPage requiredModule={"vendorquoterequests"} permission={"create"} page={<AddVendorQuoteRequest />} />} />
      <Route path="quoterequest/edit" element={<UserTeamPermissionsPage requiredModule={"vendorquoterequests"} permission={"update"} page={<EditVendorQuoteRequest />} />} />
      <Route path="quoterequest" element={<UserTeamPermissionsPage requiredModule={"vendorquoterequests"} permission={"view"} page={<VendorQuoteRequest />} />} />
      <Route path="organization" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Organization />} />} />
      <Route path="quote" element={<UserTeamPermissionsPage requiredModule={"comingsoon"} page={<Quote />} />} />
      <Route path="menu/add" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"create"} page={<AddMenu />} />} />
      <Route path="menu/edit" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"update"} page={<EditMenu />} />} />
      <Route path="menu" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"view"} page={<Menu />} />} />
      <Route path="permission" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"view"} page={<UserTeamPermission />} />} />
      <Route path="permission/add" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"create"} page={<AddUserTeamPermission />} />} />
      <Route path="permission/edit" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"update"} page={<EditUserTeamPermission />} />} />
      <Route path="event/catalog" element={<UserTeamPermissionsPage requiredModule={"catalogues"} permission={"view"} page={<CatalogList />} />} />
      <Route path="event/list" element={<UserTeamPermissionsPage requiredModule={"menu"} permission={"view"} page={<Event />} />} />
      <Route path="membership" element={<UserTeamPermissionsPage requiredModule={"membership"} permission={"view"} page={<Membership />} />} />
      <Route path="event/add" element={<AddEvent />} />
      <Route path="event/edit" element={<EditEvent />} />
      <Route path="error" element={<ErrorPage />} />
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
