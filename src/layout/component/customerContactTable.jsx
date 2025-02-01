import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { FaWhatsapp } from "react-icons/fa";
import { useGetData } from "../../common/api";
import { useState } from "react";
import LoadingScreen from "../ui/loading/loading";

function CustomerContactTable({ customerId, nav }) {
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
    return <div className="text-text-color">Error loading data</div>;
  }

  if (data.contacts.length<1) {
    return <div className="text-text-color">No contact data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Contact Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Country</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Customer</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">State</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Primary Phone Number</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Email</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Designation</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Decision Maker</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {data.contacts.map((contact) => (
            <Table.Row key={contact._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {contact.name}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{contact.country}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                {contact.customer?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{contact.state}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <div className="flex items-center">
                  {contact.primaryPhoneWhatsApp && <FaWhatsapp size={18} className="text-green-500" />}
                  &nbsp; {contact.primaryPhoneNumber}
                </div>
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{contact.email}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{contact.designation}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">{contact.decisionMaker ? "Yes" : "No"}</Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:bg-orange-600"
                    onClick={() => navigate(`/customer/editcontact`, { state: { contact , customerId , nav } })}
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
