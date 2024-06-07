import { Dropdown, Table } from "flowbite-react";
import { useNavigate} from "react-router";
import { FaWhatsapp } from "react-icons/fa";
import { useGetData } from '../../common/api';
import { useState } from "react";
import LoadingScreen from "../ui/loading/loading";
function ContactTable() {

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isApiLoading, setApiLoading] = useState(false);
  
    const { data, isLoading, error, refetch } = useGetData("contactData", "/contact", {});
    const navigate = useNavigate();
  
    const openModal = (team) => {
      setSelectedContact(team);
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
  
    return (
        <div className="overflow-x-auto min-h-96">
      <Table theme={{
    dark: true
  }} >
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white" >Contact name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Customer</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Primary Phone Number</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Email</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Designation</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Decision Maker</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
          Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="border-gray-700 bg-zinc-950">
            <Table.Cell className="whitespace-nowrap font-medium text-white text-white">
              {'John Doe'}
            </Table.Cell>
            <Table.Cell className="text-gray-300">USA</Table.Cell>
            <Table.Cell className="text-gray-300">Amazon</Table.Cell>
            <Table.Cell className="text-gray-300">Texas</Table.Cell>
            <Table.Cell className="text-gray-300"><div className="flex"><FaWhatsapp size={18}/>&nbsp; +1 712-892-658 </div></Table.Cell>
            <Table.Cell className="text-gray-300">john.doe@amazon.com</Table.Cell>
            <Table.Cell className="text-gray-300">Director - Tech</Table.Cell>
            <Table.Cell className="text-gray-300">Yes</Table.Cell>
            <Table.Cell className="text-gray-300">
            <Dropdown label="Actions" inline className="bg-black text-white border-black">
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addContact') }>Add Contact</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/editContact') }>Edit Contact</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addCustomer') }>Delete Contact</Dropdown.Item>
            </Dropdown>
            </Table.Cell>
          </Table.Row>
          <Table.Row className="border-gray-700 bg-zinc-950">
            <Table.Cell className="whitespace-nowrap font-medium text-white text-white">
              {'John Doe'}
            </Table.Cell>
            <Table.Cell className="text-gray-300">USA</Table.Cell>
            <Table.Cell className="text-gray-300">Amazon</Table.Cell>
            <Table.Cell className="text-gray-300">Texas</Table.Cell>
            <Table.Cell className="text-gray-300"><div className="flex">+1 712-892-658 </div></Table.Cell>
            <Table.Cell className="text-gray-300">john.doe@amazon.com</Table.Cell>
            <Table.Cell className="text-gray-300">Director - Tech</Table.Cell>
            <Table.Cell className="text-gray-300">Yes</Table.Cell>
            <Table.Cell className="text-gray-300">
            <Dropdown label="Actions" inline className="bg-black text-white border-black">
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addContact') }>Add Contact</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/editContact') }>Edit Contact</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addCustomer') }>Delete Contact</Dropdown.Item>
            </Dropdown>
            </Table.Cell>
          </Table.Row>
       
        </Table.Body>
      </Table>
    
              
    </div>
    );
}

export default ContactTable;