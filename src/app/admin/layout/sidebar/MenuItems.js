import {
  IconLayoutDashboard,
  IconChartBar,
  IconHistory,
  IconListCheck,
  // IconCalendarEvent,
  // IconSoccerField,
  // IconPlus,
  // IconUser,
  IconUsers,
  IconMessage,
  // thêm icon danh sách chuyên viên align-box-left-bottom
  IconAlignBoxLeftBottom,
  IconMoneybag,
  IconSettings,
  IconCalendarEvent
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Tài chính"
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/admin"
  },
  {
    id: uniqueId(),
    title: "Doanh thu",
    icon: IconChartBar,
    href: "/admin/doanh-thu"
  },
    {
    id: uniqueId(),
    title: "Gói nền tảng",
    icon: IconMoneybag,
    href: "/admin/thong-ke-goi-nen-tang"
  },
  {
    id: uniqueId(),
    title: "Lịch sử rút tiền",
    icon: IconHistory,
    href: "/admin/nap-rut"
  },
  {
    id: uniqueId(),
    title: "Lịch sử giao dịch",
    icon: IconHistory,
    href: "/admin/lich-su-giao-dich",
    onlyAdmin: true
  },
  {
    navlabel: true,
    subheader: "Quản lý đặt lịch makeup"
  },
  {
    id: uniqueId(),
    title: "Danh sách đặt lịch",
    icon: IconListCheck,
    href: "/admin/danh-sach-dat-lich"
  },
  {
    id: uniqueId(),
    title: "Lịch sử đặt lịch",
    icon: IconListCheck,
    href: "/admin/lich-su-dat-lich"
  },
  {
      id: uniqueId(),
      title: "Trạng thái đặt lịch",
      icon: IconCalendarEvent,
      href: "/admin/timeline-dich-vu"
    },
  {
    navlabel: true,
    subheader: "Quản lý người dùng",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách người dùng",
    icon: IconUsers,
    href: "/admin/danh-sach-nguoi-dung",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách chuyên viên",
    icon: IconUsers,
    href: "/admin/danh-sach-makeup-artists",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách khiếu nại",
    icon: IconMessage,
    href: "/admin/danh-sach-feedback",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách duyệt chuyên viên",
    icon: IconAlignBoxLeftBottom,
    href: "/admin/danh-sach-duyet-makeup-artists",
    onlyAdmin: true
  },

  {
    navlabel: true,
    subheader: "Quản trị website"
  },
  {
    id: uniqueId(),
    title: "Quản lý banner",
    icon: IconSettings,
    href: "/admin/quan-ly-banner",
    onlyAdmin: true
  },
  // {
  //   id: uniqueId(),
  //   title: "Quản trị website",
  //   icon: IconSettings,
  //   href: "/admin/quan-tri-website",
  //   onlyAdmin: true
  // }
];

export default Menuitems;
