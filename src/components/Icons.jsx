function Icon({ className = "h-5 w-5", children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const XIcon = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21c-4-3.6-7-7.2-7-11a7 7 0 0 1 14 0c0 3.8-3 7.4-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

export const LocateIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Icon>
);

export const NavigationIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3l6.5 17L12 16l-6.5 4z" fill="currentColor" />
  </Icon>
);

export const DropletIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3c3 3.6 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 9 6.6 12 3z" />
  </Icon>
);

export const WindIcon = (props) => (
  <Icon {...props}>
    <path d="M3 8h10.5a2.5 2.5 0 1 0-2.5-2.5" />
    <path d="M3 12h15.5a2.5 2.5 0 1 1-2.5 2.5" />
    <path d="M3 16h7" />
  </Icon>
);

export const GaugeIcon = (props) => (
  <Icon {...props}>
    <path d="M4.9 19a9 9 0 1 1 14.2 0" />
    <path d="m12 14 4-4" />
    <circle cx="12" cy="14" r="1" />
  </Icon>
);

export const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const ThermometerIcon = (props) => (
  <Icon {...props}>
    <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
  </Icon>
);

export const CloudIcon = (props) => (
  <Icon {...props}>
    <path d="M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 20.4 11a4 4 0 0 1-2.9 8z" />
  </Icon>
);

export const SunIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const ClockIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const CalendarIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Icon>
);

export const HistoryIcon = (props) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const RefreshIcon = (props) => (
  <Icon {...props}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4" />
    <path d="M21 3v6h-6" />
  </Icon>
);

export const AlertIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </Icon>
);

export const Spinner = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`animate-spin ${className}`}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
