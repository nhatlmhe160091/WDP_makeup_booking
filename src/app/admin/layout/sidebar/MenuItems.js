import {
  IconLayoutDashboard,
  IconChartBar,
  IconHistory,
  IconListCheck,
  IconCalendarEvent,
  IconSoccerField,
  IconPlus,
  IconUser,
  IconUsers,
  IconMessage,
  // thêm icon danh sách chủ sân align-box-left-bottom
  IconAlignBoxLeftBottom,
  IconMoneybag,
  IconSettings
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Tài chính"
  },
  {
    id: uniqueId(),
    title: "Tổng quan đặt lịch",
    icon: IconLayoutDashboard,
    href: "/admin"
  },
  {
    id: uniqueId(),
    title: "Chi tiết doanh thu",
    icon: IconChartBar,
    href: "/admin/doanh-thu"
  },
  {
    id: uniqueId(),
    title: "Lịch sử rút tiền",
    icon: IconHistory,
    href: "/admin/nap-rut"
  },
  {
    id: uniqueId(),
    title: "Thanh toán cho nền tảng",
    icon: IconMoneybag,
    href: "/admin/thanh-toan-nen-tang",
    onlyUser: true
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
    title: "Danh sách chủ sân",
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
    title: "Danh sách duyệt chủ sân",
    icon: IconAlignBoxLeftBottom,
    href: "/admin/danh-sach-duyet-makeup-artists",
    onlyAdmin: true
  },
  {
    navlabel: true,
    subheader: "Quản lý dịch vụ makeup",
    onlyUser: true
  },
  {
    id: uniqueId(),
    title: "Danh sách dịch vụ",
    icon: IconSoccerField,
    href: "/admin/danh-sach-dich-vu",
    onlyUser: true
  },
  {
    id: uniqueId(),
    title: "Thêm dịch vụ",
    icon: IconPlus,
    href: "/admin/them-dich-vu",
    onlyUser: true
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
