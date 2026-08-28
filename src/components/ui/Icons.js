import { cn } from '@/lib/utils';

function Svg({ className, children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('h-5 w-5 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconHome(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20V10.5z" />
      <path {...stroke} d="M9 21.5V12h6v9.5" />
    </Svg>
  );
}

export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle {...stroke} cx="11" cy="11" r="7" />
      <path {...stroke} d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

export function IconUsers(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle {...stroke} cx="9" cy="7" r="3.25" />
      <path {...stroke} d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a3.25 3.25 0 010 6.74" />
    </Svg>
  );
}

export function IconFolder(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M3 7.5A1.5 1.5 0 014.5 6h4.4l1.8 2H19.5A1.5 1.5 0 0121 9.5v8A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5v-10z" />
    </Svg>
  );
}

export function IconClipboard(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M9 5h6M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2" />
      <path {...stroke} d="M9 12h6M9 16h4" />
    </Svg>
  );
}

export function IconMegaphone(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M4 10v4l12 5V5L4 10z" />
      <path {...stroke} d="M16 9.5a4.5 4.5 0 010 5M7.5 14.5v3.2a1.8 1.8 0 003.4.8" />
    </Svg>
  );
}

export function IconShield(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M12 3l8 3.5v6.2c0 4.4-3.2 7.5-8 8.8-4.8-1.3-8-4.4-8-8.8V6.5L12 3z" />
      <path {...stroke} d="M9.5 12.2l1.8 1.8 3.4-3.6" />
    </Svg>
  );
}

export function IconPackage(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M21 8.5L12 4 3 8.5v7L12 20l9-4.5v-7z" />
      <path {...stroke} d="M12 12V4M3 8.5L12 12l9-3.5" />
    </Svg>
  );
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconMail(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M4 6.5h16v11H4v-11z" />
      <path {...stroke} d="M4 8l8 5 8-5" />
    </Svg>
  );
}

export function IconClose(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconMenu(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconBuilding(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M4 21V5.5A1.5 1.5 0 015.5 4h9A1.5 1.5 0 0116 5.5V21M16 10h3.5A1.5 1.5 0 0121 11.5V21" />
      <path {...stroke} d="M8 8h3M8 12h3M8 16h3M3 21h18" />
    </Svg>
  );
}

export function IconInfo(props) {
  return (
    <Svg {...props}>
      <circle {...stroke} cx="12" cy="12" r="8.25" />
      <path {...stroke} d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

export function IconChat(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M5 18.5l-1.5 2.8 3.6-.8A8.5 8.5 0 1012 20.5a8.4 8.4 0 01-3.4-.7L5 18.5z" />
    </Svg>
  );
}

export function IconDownload(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M12 4v10M8 10l4 4 4-4M5 18.5h14" />
    </Svg>
  );
}

export function IconCheck(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function IconFilter(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M4 6h16M7 12h10M10 18h4" />
    </Svg>
  );
}

export function IconWhatsApp({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      dir="ltr"
      className={cn('h-5 w-5 shrink-0', className)}
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconFamily(props) {
  return (
    <Svg {...props}>
      <circle {...stroke} cx="8" cy="7" r="2.4" />
      <circle {...stroke} cx="16" cy="7.5" r="2" />
      <path {...stroke} d="M3.8 19v-1.4A3.4 3.4 0 017.2 14h1.8A3.4 3.4 0 0112.4 17.6V19" />
      <path {...stroke} d="M13.2 19v-1.6A2.8 2.8 0 0116 14.6h.8A2.8 2.8 0 0120.6 17.4V19" />
    </Svg>
  );
}

export function IconCopy(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M8 8.5h10.5V20H8V8.5z" />
      <path {...stroke} d="M5.5 15.5H4.5V4h10.5v1" />
    </Svg>
  );
}

export function IconChevron(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M15 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconBell(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M6 9a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path {...stroke} d="M10 19a2 2 0 004 0" />
    </Svg>
  );
}

export function IconUser(props) {
  return (
    <Svg {...props}>
      <circle {...stroke} cx="12" cy="8" r="3.25" />
      <path {...stroke} d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" />
    </Svg>
  );
}

export function IconList(props) {
  return (
    <Svg {...props}>
      <path {...stroke} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </Svg>
  );
}

export const NAV_ICONS = {
  home: IconHome,
  search: IconSearch,
  users: IconUsers,
  folder: IconFolder,
  clipboard: IconClipboard,
  megaphone: IconMegaphone,
  shield: IconShield,
  package: IconPackage,
  plus: IconPlus,
  mail: IconMail,
  filter: IconFilter,
  family: IconFamily,
  bell: IconBell,
  user: IconUser,
  menu: IconMenu,
  list: IconList,
};
