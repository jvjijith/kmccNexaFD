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
      <Route exact path="customer/addContact" element={<AddContact></AddContact>}></Route> 
      <Route exact path="contact/addContact" element={<AddContact></AddContact>}></Route>      
      <Route exact path="vendor/addContact" element={<AddContact></AddContact>}></Route>      
      <Route exact path="addContact" element={<AddContact></AddContact>}></Route>
      <Route exact path="loading" element={<Loading></Loading>}></Route>
      <Route path="customer/add" element={<AddCustomer />} />
      <Route path="admin/adduser" element={<AddUser />} />
      <Route path="admin/edituser" element={<AddUser />} />
      <Route path="customer/edit" element={<EditCustomer />} />
      <Route path="/profile/:userId/details" element={<Profile />} />
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
