/**
 * PIMS Color Palette
 * Consistent color scheme for the entire application
 */

// Primary Colors
export const PRIMARY = '#4472C4';
export const PRIMARY_DARK = '#335a9a';
export const PRIMARY_LIGHT = '#6b8fd6';

// Status Colors
export const STATUS = {
  SUCCESS: '#28a745',
  SUCCESS_BG: '#d4edda',
  SUCCESS_TEXT: '#155724',
  
  DANGER: '#dc3545',
  DANGER_BG: '#f8d7da',
  DANGER_TEXT: '#721c24',
  
  WARNING: '#ffc107',
  WARNING_BG: '#fff3cd',
  WARNING_TEXT: '#856404',
  
  INFO: '#17a2b8',
  INFO_BG: '#d1ecf1',
  INFO_TEXT: '#0c5460',
  
  SECONDARY: '#6c757d',
  SECONDARY_BG: '#e2e3e5',
  SECONDARY_TEXT: '#383d41',
  
  DARK: '#343a40',
  DARK_BG: '#d6d8db',
  DARK_TEXT: '#1b1e21',
};

// Stock Status Colors
export const STOCK_STATUS = {
  CRITICAL: STATUS.DANGER,
  LOW: STATUS.WARNING,
  NORMAL: STATUS.SUCCESS,
};

// Movement Type Colors
export const MOVEMENT_TYPE = {
  RECEIPT: STATUS.SUCCESS,
  ISSUE: STATUS.DANGER,
  TRANSFER: STATUS.INFO,
  RETURN: STATUS.WARNING,
  ADJUSTMENT: STATUS.SECONDARY,
  INVENTORY_ADJUSTMENT: STATUS.DARK,
};

// Request Status Colors
export const REQUEST_STATUS = {
  DRAFT: STATUS.SECONDARY,
  SUBMITTED: STATUS.INFO,
  PENDING_APPROVAL: STATUS.WARNING,
  APPROVED: STATUS.SUCCESS,
  REJECTED: STATUS.DANGER,
  PREPARING: STATUS.INFO,
  READY: STATUS.SUCCESS,
  ISSUED: STATUS.SUCCESS,
  CANCELLED: STATUS.DANGER,
};

// Request Priority Colors
export const REQUEST_PRIORITY = {
  LOW: STATUS.SECONDARY,
  NORMAL: STATUS.INFO,
  HIGH: STATUS.WARNING,
  URGENT: STATUS.DANGER,
};

// Article Status Colors
export const ARTICLE_STATUS = {
  ACTIVE: STATUS.SUCCESS,
  INACTIVE: STATUS.SECONDARY,
  DISCONTINUED: STATUS.DANGER,
};

// User Status Colors
export const USER_STATUS = {
  ACTIVE: STATUS.SUCCESS,
  DISABLED: STATUS.DANGER,
};

// Badge Color Mapping for Bootstrap
export const getBootstrapBadgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    // Stock Status
    CRITICAL: 'danger',
    LOW: 'warning',
    NORMAL: 'success',
    
    // Movement Types
    RECEIPT: 'success',
    ISSUE: 'danger',
    TRANSFER: 'info',
    RETURN: 'warning',
    ADJUSTMENT: 'secondary',
    INVENTORY_ADJUSTMENT: 'dark',
    
    // Request Status
    DRAFT: 'secondary',
    SUBMITTED: 'info',
    PENDING_APPROVAL: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PREPARING: 'info',
    READY: 'success',
    ISSUED: 'success',
    CANCELLED: 'danger',
    
    // Request Priority
    PRIORITY_LOW: 'secondary',
    PRIORITY_NORMAL: 'info',
    PRIORITY_HIGH: 'warning',
    PRIORITY_URGENT: 'danger',
    
    // Article Status
    ARTICLE_ACTIVE: 'success',
    ARTICLE_INACTIVE: 'secondary',
    ARTICLE_DISCONTINUED: 'danger',
    
    // User Status
    USER_ACTIVE: 'success',
    USER_DISABLED: 'danger',
  };
  
  return colorMap[status] || 'secondary';
};

// Text Color Mapping
export const getTextColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    CRITICAL: STATUS.DANGER_TEXT,
    LOW: STATUS.WARNING_TEXT,
    NORMAL: STATUS.SUCCESS_TEXT,
    SUCCESS: STATUS.SUCCESS_TEXT,
    DANGER: STATUS.DANGER_TEXT,
    WARNING: STATUS.WARNING_TEXT,
    INFO: STATUS.INFO_TEXT,
    SECONDARY: STATUS.SECONDARY_TEXT,
    DARK: STATUS.DARK_TEXT,
  };
  
  return colorMap[status] || STATUS.SECONDARY_TEXT;
};

// Background Color Mapping
export const getBgColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    CRITICAL: STATUS.DANGER_BG,
    LOW: STATUS.WARNING_BG,
    NORMAL: STATUS.SUCCESS_BG,
    SUCCESS: STATUS.SUCCESS_BG,
    DANGER: STATUS.DANGER_BG,
    WARNING: STATUS.WARNING_BG,
    INFO: STATUS.INFO_BG,
    SECONDARY: STATUS.SECONDARY_BG,
    DARK: STATUS.DARK_BG,
  };
  
  return colorMap[status] || STATUS.SECONDARY_BG;
};
