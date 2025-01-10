import React from 'react';
import Icon from '../ui/icon/icon';
import IconButton from '../ui/icon/iconButton';
import Card from '../ui/card/card';
import { useSidebar } from '../../context/sidebar.context';
import { useNavigate } from 'react-router';

function PageCard({children,title,button}) {
  
  const navigate = useNavigate();

  const {toggleSidebar} = useSidebar();
    return (
        <div className="flex w-full">
              <div className="w-full h-screen hidden sm:block sm:w-20 xl:w-60 flex-shrink-0">
          .
        </div>
            <div className="h-screen flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
            <div className="w-full sm:flex p-2 items-end">
            <div className="sm:flex-grow flex justify-between">
              <div className="">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-text-color">Pages</div>
                  
                </div>
             {/*    <div className="flex items-center">
                  <Icon
                    path="res-react-dash-date-indicator"
                    className="w-3 h-3"
                  />
                  <div className="ml-2">Dashboard/ Add Customer</div>
                </div> */}
              </div>
              <IconButton
                icon="res-react-dash-sidebar-open"
                className="block sm:hidden"
                onClick={toggleSidebar}
              />
            </div>
            <div className="w-full sm:w-56 mt-4 sm:mt-0 relative">
              <Icon
                path="res-react-dash-search"
                className="w-5 h-5 search-icon left-3 absolute"
              />
              <form action="#" method="POST">
                <input
                  type="text"
                  name="company_website"
                  id="company_website"
                  className="pl-12 py-2 pr-2 block w-full rounded-lg border-nexa-gray secondary-card text-text-color"
                  placeholder="search"
                />
              </form>
            </div>
          </div>

          
           <Card title={title}
           component={button?
            (<button
              className="bg-primary-button-color text-text-color px-4 py-2 rounded"
              onClick={() => navigate(`/page/add`)}
            >
              Add
            </button>):null
          }>
          {children}
            </Card>
            </div>

        </div>
    );
}

export default PageCard;