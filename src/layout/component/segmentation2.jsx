import { segmentationData2 } from "../../constant";
import Icon from "../ui/icon/icon";

export default function Segmentation2({ dashboardData }) {
    // Transform dashboard data for event status segmentation
    const transformedSegmentationData2 = dashboardData?.events ? [
        { 
            c1: 'Active Events', 
            c2: dashboardData.events.active.toString(), 
            c3: '#10b981', 
            color: '#059669' 
        },
        { 
            c1: 'Draft Events', 
            c2: dashboardData.events.draft.toString(), 
            c3: '#f59e0b', 
            color: '#d97706' 
        },
        { 
            c1: 'Past Events', 
            c2: dashboardData.events.past.toString(), 
            c3: '#6b7280', 
            color: '#4b5563' 
        },
        { 
            c1: 'Upcoming Events', 
            c2: dashboardData.events.upcoming.toString(), 
            c3: '#3b82f6', 
            color: '#2563eb' 
        },
    ] : segmentationData2;

    return (
      <div className="p-4 h-full">
        <div className="flex justify-between items-center">
          <div className="text-text-color font-bold">Events By Status</div>
  
          <Icon path="res-react-dash-options" className="w-2 h-2" />
        </div>
        <div className="mt-3">All Events</div>
        {transformedSegmentationData2.map(({ c1, c2, c3, color }) => (
          <div className="flex items-center" key={c1}>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: color,
              }}
            />
            <div className="ml-2" style={{ color }}>
              {c1}
            </div>
            <div className="flex-grow" />
            <div className="" style={{ color }}>
              {c2}
            </div>
            <div className="ml-2 w-12 card-stack-border" />
            <div className="ml-2 h-8">
              <div
                className="w-20 h-28 rounded-lg overflow-hidden"
                style={{
                  background: c3,
                }}
              >
                {c1 === 'Past Events' && (
                  <img src="https://assets.codepen.io/3685267/res-react-dash-user-card.svg" alt="" />
                )}
              </div>
            </div>
          </div>
        ))}
{/*   
        <div className="flex mt-3 px-3 items-center justify-between bg-details rounded-xl w-36 h-12">
          <div className="">Details</div>
          <Icon path="res-react-dash-chevron-right" className="w-4 h-4" />
        </div> */}
      </div>
    );
  }
  