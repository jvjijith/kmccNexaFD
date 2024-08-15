import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { FaWhatsapp } from "react-icons/fa";
import { useGetData } from "../../common/api";
import { useState } from "react";
import LoadingScreen from "../ui/loading/loading";

function CustomerContactTable({ customerId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const { data, isLoading, error } = useGetData("contactData", `/contact/customer/${customerId}`, {});
  const navigate = useNavigate();

  const openModal = (contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setModalOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  if (data.contacts.length<1) {
    return <div>No contact data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Contact Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Customer</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Primary Phone Number</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Email</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Designation</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Decision Maker</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.contacts.map((contact) => (
            <Table.Row key={contact._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {contact.name}
              </Table.Cell>
              <Table.Cell className="text-gray-300">{contact.country}</Table.Cell>
              <Table.Cell className="text-gray-300">
                {contact.customer?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">{contact.state}</Table.Cell>
              <Table.Cell className="text-gray-300">
                <div className="flex items-center">
                  {contact.primaryPhoneWhatsApp && <FaWhatsapp size={18} className="text-green-500" />}
                  &nbsp; {contact.primaryPhoneNumber}
                </div>
              </Table.Cell>
              <Table.Cell className="text-gray-300">{contact.email}</Table.Cell>
              <Table.Cell className="text-gray-300">{contact.designation}</Table.Cell>
              <Table.Cell className="text-gray-300">{contact.decisionMaker ? "Yes" : "No"}</Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:bg-orange-600"
                    onClick={() => navigate(`/contact/addContact`, { state: { contact } })}
                  >
                    Edit Contact
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default CustomerContactTable;
