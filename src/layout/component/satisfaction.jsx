import { pi,map,tau } from "../../dummy";
import { useSpring,config,animated } from "@react-spring/web";
import Icon from "../ui/icon/icon";

export default function Satisfication({ dashboardData }) {
    // Calculate conversion rate percentage for animation
    const conversionRate = dashboardData?.summary?.registrationConversionRate 
        ? parseFloat(dashboardData.summary.registrationConversionRate.replace('%', ''))
        : 90; // Default to 90% if no data

    // Calculate dash offset based on conversion rate (785.4 is full circle, 0 is complete)
    const targetDashOffset = 785.4 - (785.4 * (conversionRate / 100));

    const { dashOffset } = useSpring({
      dashOffset: targetDashOffset,
      from: { dashOffset: 785.4 },
      config: config.molasses,
    });

    return (
      <div className="p-4 h-full">
        <div className="flex justify-between items-center">
          <div className="text-text-color font-bold">Conversion Rate</div>
          <Icon path="res-react-dash-options" className="w-2 h-2" />
        </div>
        <div className="mt-3">Registration Conversion Rate</div>
        <div className="flex justify-center">
          <svg
            viewBox="0 0 700 380"
            fill="none"
            width="300"
            xmlns="http://www.w3.org/2000/svg"
            id="svg"
          >
            <path
              d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
              stroke="#2d2d2d"
              strokeWidth="40"
              strokeLinecap="round"
            />
            <animated.path
              d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
              stroke="#19e36d"
              strokeWidth="40"
              strokeLinecap="round"
              strokeDasharray="785.4"
              strokeDashoffset={dashOffset}
              id="svgPath"
              className="svgPath"
            />
  
            <animated.circle
              cx={dashOffset.interpolate(
                (x) => 350 + 250 * Math.cos(map(x, 785.4, 0, pi, tau)),
              )}
              cy={dashOffset.interpolate(
                (x) => 350 + 250 * Math.sin(map(x, 785.4, 0, pi, tau)),
              )}
              r="12"
              fill="#fff"
              stroke="#19e36d"
              strokeWidth="4"
            />
  
            <circle cx="350" cy="350" r="8" fill="#2d2d2d" />
            <circle cx="600" cy="350" r="8" fill="#2d2d2d" />
            <circle cx="100" cy="350" r="8" fill="#2d2d2d" />
            <circle cx="526.777" cy="173.223" r="8" fill="#2d2d2d" />
            <circle cx="173.223" cy="173.223" r="8" fill="#2d2d2d" />
            <circle cx="350" cy="100" r="8" fill="#2d2d2d" />
  
            <text
              x="350"
              y="350"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#19e36d"
              fontSize="48"
              fontWeight="bold"
            >
              {Math.round(conversionRate)}%
            </text>
          </svg>
        </div>
  
        <div className="flex justify-between mt-2" style={{ width: '300px' }}>
          <div className="" style={{ width: '50px', paddingLeft: '16px' }}>
            <div
              className=""
              style={{
                width: '150px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#19e36d', fontSize: '18px' }}>
                {dashboardData?.registrations?.paid || 0}
              </div>
              <div>Paid</div>
            </div>
          </div>
          <div className="" style={{ width: '50px' }}>
            <div
              className=""
              style={{
                width: '150px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#19e36d', fontSize: '18px' }}>
                {dashboardData?.registrations?.total || 0}
              </div>
              <div>Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  