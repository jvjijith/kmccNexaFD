import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminCard from "../../layout/component/adminCard";
import Container from "../../layout/component/container";
import UserForm from "../../layout/component/userForm";

function AddUser() {
  const location = useLocation();
  const { userId } = location.state || {};

  return (
    <Container>
      <AdminCard title={userId ? "Edit User" : "Add User"}>
        <UserForm userId={userId} />
      </AdminCard>
    </Container>
  );
}

export default AddUser;
