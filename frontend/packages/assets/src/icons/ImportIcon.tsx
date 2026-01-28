import React from 'react'

export const ImportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M14 8V6C14 4.89543 14.8954 4 16 4H32C33.1046 4 34 4.89543 34 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 20L24 28L32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 28V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 38H24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
