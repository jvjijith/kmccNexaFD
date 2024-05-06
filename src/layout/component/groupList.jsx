import { Card, Dropdown, ListGroup } from "flowbite-react";
export default function GroupList() {
  return (
    <Card className="max-w-sm bg-black text-white max-w-[320px]  lg:w-1/3  mx-4 mb-8 min-w-[300px] border-0">
      <div className="flex justify-end px-4 pt-4">
        <Dropdown inline label="">
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Edit
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              View Contacts
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Add Contacts
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Edit Contacts
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Delete
            </a>
          </Dropdown.Item>
        </Dropdown>
      </div>
      <div className="flex flex-col items-center pb-5">
        <img
          alt="Bonnie image"
          height="48"
          src="/icon.png"
          width="48"
          className="mb-3 rounded-full shadow-lg"
        />
        <h5 className="mb-1 text-xl font-medium text-white">ABC Private Limited</h5>
        <span className="text-sm text-gray-400">Media Industry</span>
      </div>
      <div className="bg-#050404 text-white w-full">
        <ul className="list-none p-0 m-0 block text-center">
          <li className="py-2 px-4 text-#ff4a17">20 Contacts</li>
          <li className="py-2 px-4 text-#ff4a17">8 Companies</li>
        </ul>
      </div>
    </Card>
  );
}
