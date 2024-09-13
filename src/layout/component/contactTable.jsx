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
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Contact name</Table.HeadCell>
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
        {contact.customer?.name || "N/A"} {/* Display the customer's name or "N/A" if not available */}
      </Table.Cell>
      <Table.Cell className="text-gray-300">{contact.state}</Table.Cell>
      <Table.Cell className="text-gray-300">
        <div className="flex">
          {contact.primaryPhoneWhatsApp && <FaWhatsapp size={18} />}
          &nbsp; {contact.primaryPhoneNumber}
        </div>
      </Table.Cell>
      <Table.Cell className="text-gray-300">{contact.email}</Table.Cell>
      <Table.Cell className="text-gray-300">{contact.designation}</Table.Cell>
      <Table.Cell className="text-gray-300">{contact.decisionMaker ? "Yes" : "No"}</Table.Cell>
      <Table.Cell className="text-gray-300">
        <Dropdown label="Actions" inline className="bg-black text-white border-black">
          {/* <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate('/addContact')}>Edit Contact</Dropdown.Item> */}
          <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/contact/addContact`, { state: { contact: contact } })}>Edit Contact</Dropdown.Item>
          {/* <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate('/addCustomer')}>Delete Contact</Dropdown.Item> */}
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
