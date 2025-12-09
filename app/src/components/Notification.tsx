import React from "react";
import { Icon } from "@iconify/react";

export type NotificationType =
  | "approved"
  | "warning"
  | "overdue"
  | "repair_success"
  | "repair_failed"
  | "repair_new"
  | "request_new"
  | "request_pending"
  | "rejected";

export interface NotificationItemProps {
  type: NotificationType;
  title: string;
  description: React.ReactNode;
  timestamp: string;
  isRead?: boolean;
  onClick?: () => void;
}

const getIconAndColor = (type: NotificationType) => {
  switch (type) {
    case "approved":
      return {
        icon: "mdi:check-bold",
        color: "bg-[#00C853]",
        iconColor: "text-white",
      };
    case "warning":
      return {
        icon: "mdi:clock-time-three-outline",
        color: "bg-[#FF9100]",
        iconColor: "text-white",
      }; // Orange for nearing due
    case "overdue":
      return {
        icon: "mdi:alert-circle-outline",
        color: "bg-[#FF5252]",
        iconColor: "text-white",
      }; // Red for overdue
    case "repair_success":
      return {
        icon: "mdi:clipboard-check-outline",
        color: "bg-[#2962FF]",
        iconColor: "text-white",
      }; // Blue for repair success
    case "repair_failed":
      return {
        icon: "mdi:clipboard-alert-outline",
        color: "bg-[#2962FF]",
        iconColor: "text-white",
      }; // Blue for repair failed
    case "repair_new":
      return {
        icon: "mdi:wrench",
        color: "bg-[#40C4FF]",
        iconColor: "text-white",
      }; // Light blue for new repair
    case "request_new":
      return {
        icon: "mdi:information-variant",
        color: "bg-[#40C4FF]",
        iconColor: "text-white",
      }; // Light blue for new request
    case "request_pending":
      return {
        icon: "mdi:clock-time-three-outline",
        color: "bg-[#FF9100]",
        iconColor: "text-white",
      }; // Orange for pending
    case "rejected":
      return {
        icon: "mdi:close-thick",
        color: "bg-[#FF5252]",
        iconColor: "text-white",
      }; // Red for rejected
    default:
      return {
        icon: "mdi:bell",
        color: "bg-gray-400",
        iconColor: "text-white",
      };
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  description,
  timestamp,
  isRead = false,
  onClick,
}) => {
  const { icon, color, iconColor } = getIconAndColor(type);

  return (
    <div
      onClick={onClick}
      className={`flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !isRead ? "bg-blue-50/30" : "bg-white"
      }`}
    >
      {/* Icon Circle */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-full ${color} flex items-center justify-center mr-4`}
      >
        <Icon icon={icon} className={`w-7 h-7 ${iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
            {title}
          </h4>
          <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
            {timestamp}
          </span>
        </div>
        <div className="text-base text-gray-600 break-words line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  );
};

export interface NotificationListProps {
  notifications: NotificationItemProps[];
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h3 className="text-xl font-bold text-gray-800">การแจ้งเตือน</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <NotificationItem key={index} {...notif} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Icon
              icon="mdi:bell-off-outline"
              className="w-16 h-16 mb-2 opacity-50"
            />
            <p>ไม่มีการแจ้งเตือน</p>
          </div>
        )}
      </div>

      {/* Footer (Optional) */}
      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <button className="text-blue-500 text-sm font-medium hover:underline">
            ดูทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-colors"
    >
      <Icon icon="mdi:bell" className="text-black w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      )}
    </button>
  );
};
