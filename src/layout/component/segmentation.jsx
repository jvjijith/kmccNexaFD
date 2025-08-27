import { segmentationData } from "../../constant";
import Icon from "../ui/icon/icon";

export default function Segmentation({ dashboardData }) {
    // Transform dashboard data for member status segmentation
    const transformedSegmentationData = dashboardData?.members ? [
        { 
            c1: 'Active Members', 
            c2: dashboardData.members.active.toString(), 
            c3: '#4ade80', 
            color: '#22c55e' 
        },
        { 
            c1: 'Pending Members', 
            c2: dashboardData.members.pending.toString(), 
            c3: '#fbbf24', 
            color: '#f59e0b' 
        },
        { 
            c1: 'Inactive Members', 
            c2: dashboardData.members.inactive.toString(), 
            c3: '#ef4444', 
            color: '#dc2626' 
        },
        { 
            c1: 'Rejected Members', 
            c2: dashboardData.members.rejected.toString(), 
            c3: '#6b7280', 
            color: '#4b5563' 
        },
    ] : segmentationData;

    return (
      <div className="p-4 h-full">
        <div className="flex justify-between items-center">
          <div className="text-text-color font-bold">Member Status</div>
  
          <Icon path="res-react-dash-options" className="w-2 h-2" />
        </div>
        <div className="mt-3">All members</div>
        {transformedSegmentationData.map(({ c1, c2, c3, color }) => (
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
                {c1 === 'Inactive Members' && (
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
  