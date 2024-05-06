import React from "react";
import Container from "../../layout/component/container";
import GroupCard from "../../layout/component/groupCard";
import GroupList from "../../layout/component/groupList";

const Group = () => {
  return (
    <Container>
      <GroupCard title={"Groups"}>
       
       
          <div className="flex-grow flex flex-wrap justify-center">
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          <GroupList></GroupList>
          </div>

     
      
      </GroupCard>
    </Container>
  );
};

export default Group;
