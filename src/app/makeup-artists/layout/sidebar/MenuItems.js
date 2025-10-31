import {
  IconLayoutDashboard,
  IconChartBar,
  IconHistory,
  IconListCheck,
  IconCalendarEvent,
  IconSoccerField,
  IconPlus,
  // IconUser,
  IconUsers,
  IconMessage,
  // thêm icon danh sách chuyên viên align-box-left-bottom
  IconAlignBoxLeftBottom,
  IconMoneybag,
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
    href: "/makeup-artists"
  },
  {
    id: uniqueId(),
    title: "Doanh thu theo ngày",
    icon: IconChartBar,
    href: "/makeup-artists/doanh-thu"
  },
  {
    id: uniqueId(),
    title: "Lịch sử rút tiền",
    icon: IconHistory,
    href: "/makeup-artists/nap-rut"
  },
  {
    id: uniqueId(),
    title: "Thanh toán cho nền tảng",
    icon: IconMoneybag,
    href: "/makeup-artists/thanh-toan-nen-tang",
    onlyUser: true
  },
  {
    id: uniqueId(),
    title: "Lịch sử giao dịch",
    icon: IconHistory,
    href: "/makeup-artists/lich-su-giao-dich",
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
    href: "/makeup-artists/danh-sach-dat-lich"
  },
  {
    id: uniqueId(),
    title: "Lịch sử đặt lịch",
    icon: IconListCheck,
    href: "/makeup-artists/lich-su-dat-lich"
  },
  {
    id: uniqueId(),
    title: "Trạng thái đặt lịch",
    icon: IconCalendarEvent,
    href: "/makeup-artists/timeline-dich-vu"
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
    href: "/makeup-artists/danh-sach-nguoi-dung",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách chuyên viên",
    icon: IconUsers,
    href: "/makeup-artists/danh-sach-makeup-artists",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách khiếu nại",
    icon: IconMessage,
    href: "/makeup-artists/danh-sach-feedback",
    onlyAdmin: true
  },
  {
    id: uniqueId(),
    title: "Danh sách duyệt chuyên viên",
    icon: IconAlignBoxLeftBottom,
    href: "/makeup-artists/danh-sach-duyet-makeup-artists",
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
    href: "/makeup-artists/danh-sach-dich-vu",
    onlyUser: true
  },
  {
    id: uniqueId(),
    title: "Thêm dịch vụ",
    icon: IconPlus,
    href: "/makeup-artists/them-dich-vu",
    onlyUser: true
  },
  {
    navlabel: true,
    subheader: "Quản lý Blog"
  },
  {
    id: uniqueId(),
    title: "Danh sách bài viết",
    icon: IconListCheck,
    href: "/makeup-artists/danh-sach-blog"
  },
  // {
  //   id: uniqueId(),
  //   title: "Thêm bài viết",
  //   icon: IconPlus,
  //   href: "/makeup-artists/them-blog"
  // }
];

export default Menuitems;
