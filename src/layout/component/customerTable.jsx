import { Dropdown, Table } from "flowbite-react";
import { useNavigate} from "react-router";

function CustomerTable() {

    const navigate = useNavigate();
    return (
        <div className="overflow-x-auto min-h-96">
      <Table theme={{
    dark: true
  }} >
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white" >Customer name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Location</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Number of Contacts</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">
          Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="border-gray-700 bg-zinc-950">
            <Table.Cell className="whitespace-nowrap font-medium text-white text-white">
              {'Amazon"'}
            </Table.Cell>
            <Table.Cell  className="text-gray-300">USA</Table.Cell>
            <Table.Cell  className="text-gray-300">Sofware Company</Table.Cell>
            <Table.Cell  className="text-gray-300">Texas</Table.Cell>
            <Table.Cell  className="text-gray-300">Silicon Valley</Table.Cell>
            <Table.Cell  className="text-gray-300">6</Table.Cell>
            <Table.Cell  className="text-gray-300">
            <Dropdown label="Actions" inline className="bg-black text-white border-black">
          
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/editCustomer') }>Edit Customer</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addCustomer') }>Delete Customer</Dropdown.Item>
            <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() =>navigate('/addCustomer') }>Add Contacts</Dropdown.Item>
            </Dropdown>
            </Table.Cell>
          </Table.Row>
       
       
        </Table.Body>
      </Table>
    
              
    </div>
    );
}

export default CustomerTable;