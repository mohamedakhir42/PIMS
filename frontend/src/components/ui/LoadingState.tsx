import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  size = 'md',
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={sizes[size]} className="animate-spin text-green-600 mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
