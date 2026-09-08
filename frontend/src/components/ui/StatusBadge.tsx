import React from 'react';
import { Check, X, AlertTriangle, Clock, PauseCircle } from 'lucide-react';
import Badge from './Badge';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getStatusConfig = (status:	string) => {
    const normalizedStatus = status.toUpperCase().replace(/ /g, '_');
    
    const configs: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary'; icon: React.ReactNode }> = {
      // Stock Status
      CRITICAL: { variant: 'danger', icon: <X size={12} /> },
      LOW: { variant: 'warning', icon: <AlertTriangle size={12} /> },
      NORMAL: { variant: 'success', icon: <Check size={12} /> },
      
      // Request Status
      DRAFT: { variant: 'secondary', icon: <Clock size={12} /> },
      SUBMITTED: { variant: 'info', icon: <Clock size={12} /> },
      PENDING_APPROVAL: { variant: 'warning', icon: <Clock size={12} /> },
      APPROVED: { variant: 'success', icon: <Check size={12} /> },
      REJECTED: { variant: 'danger', icon: <X size={12} /> },
      READY_FOR_ISSUE: { variant: 'success', icon: <Check size={12} /> },
      PARTIALLY_FULFILLED: { variant: 'info', icon: <Clock size={12} /> },
      FULFILLED: { variant: 'success', icon: <Check size={12} /> },
      CANCELLED: { variant: 'secondary', icon: <PauseCircle size={12} /> },
      
      // Article Status
      ACTIVE: { variant: 'success', icon: <Check size={12} /> },
      INACTIVE: { variant: 'secondary', icon: <PauseCircle size={12} /> },
      DISCONTINUED: { variant: 'danger', icon: <X size={12} /> },
      
      // User Status
      USER_ACTIVE: { variant: 'success', icon: <Check size={12} /> },
      USER_DISABLED: { variant: 'danger', icon: <X size={12} /> },
      
      // Movement Types
      RECEIPT: { variant: 'success', icon: <Check size={12} /> },
      ISSUE: { variant: 'danger', icon: <X size={12} /> },
      TRANSFER: { variant: 'info', icon: <Clock size={12} /> },
      RETURN: { variant: 'warning', icon: <AlertTriangle size={12} /> },
      ADJUSTMENT: { variant: 'secondary', icon: <PauseCircle size={12} /> },
      INVENTORY_ADJUSTMENT: { variant: 'secondary', icon: <PauseCircle size={12} /> },
      
      // Priority
      PRIORITY_LOW: { variant: 'secondary', icon: <Clock size={12} /> },
      PRIORITY_NORMAL: { variant: 'info', icon: <Clock size={12} /> },
      PRIORITY_HIGH: { variant: 'warning', icon: <AlertTriangle size={12} /> },
      PRIORITY_URGENT: { variant: 'danger', icon: <X size={12} /> },
    };
    
    return configs[normalizedStatus] || { variant: 'secondary', icon: <Clock size={12} /> };
  };
  
  const config = getStatusConfig(status);
  const displayStatus = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Badge variant={config.variant} size={size} className={className}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {displayStatus}
    </Badge>
  );
};

export default StatusBadge;
