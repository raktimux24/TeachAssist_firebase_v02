import { ToastOptions } from 'react-hot-toast';

// Base toast styling that follows the app's brand guidelines
export const baseToastStyle = {
  background: '#ffffff',
  color: '#333333',
  padding: '12px 16px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  fontWeight: '500',
  zIndex: 9999,
  maxWidth: '350px',
  display: 'flex',
  alignItems: 'center',
};

// Success toast configuration
export const successToastOptions: ToastOptions = {
  duration: 3000,
  position: 'top-center',
  style: {
    ...baseToastStyle,
    borderLeft: '4px solid #0055FF', // primary-600
  },
  iconTheme: {
    primary: '#0055FF', // primary-600
    secondary: 'white',
  },
  className: 'toast-success',
  ariaProps: {
    role: 'status',
    'aria-live': 'polite',
  },
};

// Error toast configuration
export const errorToastOptions: ToastOptions = {
  duration: 4000,
  position: 'top-center',
  style: {
    ...baseToastStyle,
    borderLeft: '4px solid #EF4444', // red-500
  },
  iconTheme: {
    primary: '#EF4444', // red-500
    secondary: 'white',
  },
  className: 'toast-error',
  ariaProps: {
    role: 'alert',
    'aria-live': 'assertive',
  },
};

// Info toast configuration
export const infoToastOptions: ToastOptions = {
  duration: 3000,
  position: 'top-center',
  style: {
    ...baseToastStyle,
    borderLeft: '4px solid #66B2FF', // primary-400
  },
  iconTheme: {
    primary: '#66B2FF', // primary-400
    secondary: 'white',
  },
};

// Warning toast configuration
export const warningToastOptions: ToastOptions = {
  duration: 4000,
  position: 'top-center',
  style: {
    ...baseToastStyle,
    borderLeft: '4px solid #F59E0B', // amber-500
  },
  iconTheme: {
    primary: '#F59E0B', // amber-500
    secondary: 'white',
  },
};

// Dark mode toast styling
export const darkModeToastStyle = {
  ...baseToastStyle,
  background: '#1F2937', // gray-800
  color: '#F9FAFB', // gray-50
};

// Function to get toast options based on dark mode
export const getToastOptions = (isDarkMode: boolean): ToastOptions => {
  return {
    duration: 3000,
    position: 'top-center',
    style: isDarkMode ? darkModeToastStyle : baseToastStyle,
    className: 'toast-custom',
  };
};

// Add this to ensure the Toaster component is properly configured
export const toasterProps = {
  position: 'top-center',
  reverseOrder: false,
  gutter: 8,
  containerStyle: {
    top: 40,
    left: 40,
    bottom: 40,
    right: 40,
  },
  toastOptions: {
    // Default options for all toasts
    duration: 3000,
    style: baseToastStyle,
  },
};
