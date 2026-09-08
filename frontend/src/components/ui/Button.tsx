import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading = false, icon,
  iconPosition = 'left', fullWidth = false, disabled, className = '', ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`btn btn-${variant === 'ghost' ? 'light' : variant} ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''} ${fullWidth ? 'w-100' : ''} ${className}`}
  >
    {loading ? <Loader2 className="animate-spin me-2" size={size === 'sm' ? 14 : 16} /> : icon && iconPosition === 'left' ? <span className="me-2">{icon}</span> : null}
    {children}
    {!loading && icon && iconPosition === 'right' ? <span className="ms-2">{icon}</span> : null}
  </button>
);

export default Button;
