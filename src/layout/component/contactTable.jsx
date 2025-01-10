import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { FaWhatsapp } from "react-icons/fa";
import { useGetData } from "../../common/api";
import { useEffect, useState } from "react";
import LoadingScreen from "../ui/loading/loading";

function ContactTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const { data, isLoading, error, refetch } = useGetData("contactData", "/contact", {});
  const navigate = useNavigate();

    // Simulate loading for 10 seconds before showing content
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

  const openModal = (team) => {
    setSelectedContact(team);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setModalOpen(false);
  };

  if ( isLoading|| loading ) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-secondary-card text-text-color">
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Contact name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Customer</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Primary Phone Number</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Email</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Designation</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Decision Maker</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
  {data.contacts.map((contact) => (
    <Table.Row key={contact._id} className="border-gray-700 bg-secondary-card">
      <Table.Cell className="whitespace-nowrap font-medium text-text-color">
        {contact.name}
      </Table.Cell>
      <Table.Cell className="text-text-color">{contact.country}</Table.Cell>
      <Table.Cell className="text-text-color">
        {contact.customer?.name || "N/A"} {/* Display the customer's name or "N/A" if not available */}
      </Table.Cell>
      <Table.Cell className="text-text-color">{contact.state}</Table.Cell>
      <Table.Cell className="text-text-color">
        <div className="flex">
          {contact.primaryPhoneWhatsApp && <FaWhatsapp size={18} />}
          &nbsp; {contact.primaryPhoneNumber}
        </div>
      </Table.Cell>
      <Table.Cell className="text-text-color">{contact.email}</Table.Cell>
      <Table.Cell className="text-text-color">{contact.designation}</Table.Cell>
      <Table.Cell className="text-text-color">{contact.decisionMaker ? "Yes" : "No"}</Table.Cell>
      <Table.Cell className="text-text-color">
        <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
          {/* <Dropdown.Item className="text-text-color hover:!bg-orange-600" onClick={() => navigate('/addContact')}>Edit Contact</Dropdown.Item> */}
          <Dropdown.Item className="text-text-color hover:!bg-orange-600" onClick={() => navigate(`/contact/addContact`, { state: { contact: contact } })}>Edit Contact</Dropdown.Item>
          {/* <Dropdown.Item className="text-text-color hover:!bg-orange-600" onClick={() => navigate('/addCustomer')}>Delete Contact</Dropdown.Item> */}
        </Dropdown>
      </Table.Cell>
    </Table.Row>
  ))}
</Table.Body>

      </Table>
    </div>
  );
}

export default ContactTable;
