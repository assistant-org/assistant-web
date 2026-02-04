import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const cardClasses = `bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
