import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { FiPackage, FiActivity, FiCpu, FiTruck, FiCheckCircle } from 'react-icons/fi';

export const LiveTracker = ({ orderId, initialStatus }) => {
  const { joinOrderTracking, leaveOrderTracking } = useSocket();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    // Join socket tracking room for this order
    joinOrderTracking(orderId, (data) => {
      console.log(`[Socket Update] Order ${orderId} status changed:`, data.status);
      setStatus(data.status);
    });

    // Cleanup: leave tracking room
    return () => {
      leaveOrderTracking(orderId);
    };
  }, [orderId]);

  const stages = [
    { key: 'received', name: 'Order Received', icon: <FiPackage /> },
    { key: 'preparing', name: 'Preparing', icon: <FiActivity /> },
    { key: 'kitchen', name: 'In Kitchen', icon: <FiCpu /> },
    { key: 'delivery', name: 'Out For Delivery', icon: <FiTruck /> },
    { key: 'delivered', name: 'Delivered', icon: <FiCheckCircle /> }
  ];

  const getStageIndex = (currentKey) => {
    return stages.findIndex(s => s.key === currentKey);
  };

  const currentStageIndex = getStageIndex(status);

  return (
    <div className="w-full py-6 font-sans">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 text-center sm:text-left">
        🔴 Live Socket Tracking Status: <strong className="text-brand uppercase">{status}</strong>
      </span>
      
      {/* Horizontal Timeline (Desktop) */}
      <div className="hidden sm:flex items-center justify-between relative w-full px-4">
        
        {/* Connector Line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-10">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;
          
          return (
            <div key={stage.key} className="flex flex-col items-center relative space-y-2.5">
              
              {/* Node Circle */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-350 ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : isActive 
                    ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20 timeline-pulse' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                {stage.icon}
              </div>

              {/* Node Name */}
              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                isActive ? 'text-brand' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
              }`}>{stage.name}</span>

            </div>
          );
        })}

      </div>

      {/* Vertical Timeline (Mobile) */}
      <div className="flex sm:hidden flex-col space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800 relative ml-3">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;

          return (
            <div key={stage.key} className="flex items-center space-x-4 relative">
              
              {/* Indicator Circle */}
              <div className={`absolute -left-[27px] w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : isActive 
                    ? 'bg-brand border-brand text-white timeline-pulse' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                {isCompleted && '✓'}
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-lg p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${
                  isActive ? 'text-brand' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                }`}>{stage.icon}</span>
                <span className={`text-xs font-bold ${
                  isActive ? 'text-brand' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                }`}>{stage.name}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LiveTracker;
