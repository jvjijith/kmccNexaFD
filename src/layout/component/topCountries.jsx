import { Countrydata } from "../../constant";
import Icon from "../ui/icon/icon";


export default function TopCountries({ dashboardData }) {
    // Transform dashboard data for top countries/events
    const transformedCountryData = dashboardData ? [
        { 
            name: 'Active Events', 
            rise: dashboardData.events?.active > 0, 
            value: dashboardData.events?.active || 0, 
            id: 1 
        },
        { 
            name: 'Total Members', 
            rise: dashboardData.members?.active > dashboardData.members?.inactive, 
            value: dashboardData.members?.total || 0, 
            id: 2 
        },
        { 
            name: 'Event Registrations', 
            rise: dashboardData.registrations?.paid > dashboardData.registrations?.unpaid, 
            value: dashboardData.registrations?.total || 0, 
            id: 3 
        },
        { 
            name: 'Total Earnings', 
            rise: dashboardData.summary?.totalEventEarnings?.totalEarnings > 0, 
            value: dashboardData.summary?.totalEventEarnings?.totalEarnings || 0, 
            id: 4 
        },
    ] : Countrydata;

    return (
      <div className="flex p-4 flex-col h-full">
        <div className="flex justify-between items-center">
          <div className="text-text-color font-bold">Key Metrics</div>
          {/* <Icon path="res-react-dash-plus" className="w-5 h-5" /> */}
        </div>
        <div className="">Overview of Main Statistics</div>
        {transformedCountryData.map(({ name, rise, value, id }) => (
          <div className="flex items-center mt-3" key={id}>
            <div className="">{id}</div>
  
            {/* <Image path={`res-react-dash-flag-${id}`} className="ml-2 w-6 h-6" /> */}
            <div className="ml-2">{name}</div>
            <div className="flex-grow" />
            <div className="">
              {name === 'Total Earnings' ? `$${value.toLocaleString()}` : `${value.toLocaleString()}`}
            </div>
            <Icon
              path={
                rise ? 'res-react-dash-country-up' : 'res-react-dash-country-down'
              }
              className="w-4 h-4 mx-3"
            />
            <Icon path="res-react-dash-options" className="w-2 h-2" />
          </div>
        ))}
        <div className="flex-grow" />
        <div className="flex justify-center">
          <div className="">View Details</div>
        </div>
      </div>
    );
  }
  