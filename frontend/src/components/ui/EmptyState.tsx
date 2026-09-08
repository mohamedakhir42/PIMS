import React from 'react';
import { Package, Search, FileText, Users, AlertCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon?: 'package' | 'search' | 'document' | 'users' | 'alert' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const getIcon = () => {
    if (typeof icon === 'object') return icon;
    
    const icons = {
      package: <Package size={48} className="text-gray-300" />,
      search: <Search size={48} className="text-gray-300" />,
      document: <FileText size={48} className="text-gray-300" />,
      users: <Users size={48} className="text-gray-300" />,
      alert: <AlertCircle size={48} className="text-gray-300" />,
    };
    
    return icons[icon as keyof typeof icons] || <Package size={48} className="text-gray-300" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{getIcon()}</div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
