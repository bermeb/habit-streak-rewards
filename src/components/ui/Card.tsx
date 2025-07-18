import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl ${paddingClasses[padding]} shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};