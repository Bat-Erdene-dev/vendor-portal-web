import type { NavItem, UserRole } from "@/models/sidebarModel";
import {
  Package,
  Settings,
  MapPin,
  Bell,
  TvMinimal,
  Wallet,
  ClipboardList,
  BriefcaseBusiness,
  BookMarked,
  CircleCheck,
  CircleAlert,
  MessageCircle,
} from "lucide-react";

const COMMON_BOTTOM: NavItem[] = [
  {
    label: "Тусламж",
    href: "/help",
    icon: CircleCheck,
    description: "Системтийн ажилгаатай холбоотой заавар зөвөлгөө",
  },
  {
    label: "Салбарын байршил",
    href: "/branches",
    icon: MapPin,
    description: "Байгууллагын салбарын байршилын",
  },
  {
    label: "Санал хүсэлт",
    href: "/feedback",
    icon: CircleAlert,
    description: "Үйл ажиллагаатай холбоотой санал хүсэлт",
  },
  {
    label: "Холбоо барих",
    href: "/contact",
    icon: MessageCircle,
    description: "Харилцаа холбоо",
  },
];

const HOME: NavItem = {
  label: "Нүүр хуудас",
  href: "/dashboard",
  icon: TvMinimal,
  description: "Мэдээ мэдээлэл",
};

const REPORTS: NavItem = {
  label: "Тайлан",
  icon: BookMarked,
  children: [
    {
      label: "Борлуулалтын тайлан",
      href: "/reports",
    },
    {
      label: "Нөөцийн тайлан",
      href: "/reports/inventory",
    },
  ],
};

const PAYMENTS: NavItem = {
  label: "Төлбөр тооцоо",
  icon: Wallet,
  children: [
    {
      label: "Авлагын дэлгэрэнгүй",
      href: "/payments/receivables",
    },
    {
      label: "Харилцагчийн суутгалууд",
      href: "/payments/deductions",
    },
    {
      label: "Нэхэмжлэх",
      href: "/payments/invoices",
    },
    {
      label: "Тооцооны акт",
      href: "/payments/acts",
    },
  ],
};

const ORDERS_VIEW: NavItem = {
  label: "Захиалга",
  icon: ClipboardList,
  children: [
    {
      label: "Захиалга үзэх",
      href: "/orders",
    },
    {
      label: "Захиалгын хуваарь",
      href: "/orders/schedule",
    },
    {
      label: "Захиалгын биелэлт",
      href: "/orders/fulfillment",
    },
    {
      label: "Буцаалтын захиалга",
      href: "/orders/returns",
    },
  ],
};

const PARTNERS: NavItem = {
  label: "Хамтын ажиллагаа",
  icon: BriefcaseBusiness,
  roles: ["system_admin", "accountant", "pharmacy_manager"],
  children: [
    {
      label: "Бараа бүтээгдэхүүн",
      href: "/partners/products",
      roles: ["system_admin", "accountant", "pharmacy_manager"],
    },
    {
      label: "Бар код өөрчлөх",
      href: "/partners/barcode",
      roles: ["system_admin", "accountant", "pharmacy_manager"],
    },
    {
      label: "Үнэ өөрчлөх",
      href: "/partners/price",
      roles: ["system_admin", "customer", "accountant", "pharmacy_manager"],
    },
    {
      label: "Урамшуулал",
      href: "/partners/promotions",
      roles: ["system_admin", "customer", "accountant", "pharmacy_manager"],
    },
    {
      label: "Тасалдал",
      href: "/partners/outages",
      roles: ["system_admin", "customer", "accountant", "pharmacy_manager"],
    },
  ],
};

const CUSTOMER_SETTINGS: NavItem = {
  label: "Харилцагчийн тохиргоо",
  icon: Settings,
  children: [
    {
      label: "Байгууллагын мэдээлэл",
      href: "/settings/company",
    },
    {
      label: "Хэрэглэгчийн жагсаалт",
      href: "/settings/users",
    },
    {
      label: "Хэрэглэгчийн эрхийн тохиргоо",
      href: "/settings/permissions",
    },
    {
      label: "Систем ашиглалтын төлбөр",
      href: "/settings/billing",
    },
    {
      label: "Харилцагчид",
      href: "/settings/customers",
    },
    {
      label: "Гэрээ",
      href: "/settings/contracts",
    },
  ],
};

type RoleConfig = { nav: NavItem[]; bottom: NavItem[] };

const NAV_CONFIG: Record<UserRole, RoleConfig> = {
  system_admin: {
    nav: [HOME, PAYMENTS, ORDERS_VIEW, PARTNERS, REPORTS, CUSTOMER_SETTINGS],
    bottom: COMMON_BOTTOM,
  },

  customer: {
    nav: [
      HOME,
      ORDERS_VIEW,
      { label: "Бараа", href: "/products", icon: Package },
    ],
    bottom: COMMON_BOTTOM,
  },

  accountant: {
    nav: [HOME, PAYMENTS, PARTNERS, CUSTOMER_SETTINGS],
    bottom: COMMON_BOTTOM,
  },

  pharmacy_manager: {
    nav: [HOME, PARTNERS],
    bottom: COMMON_BOTTOM,
  },

  pharmacist: {
    nav: [HOME, ORDERS_VIEW],
    bottom: COMMON_BOTTOM,
  },

  marketing_manager: {
    nav: [
      HOME,
      {
        label: "Маркетинг, Сурталчилгаа",
        icon: Bell,
        children: [
          { label: "Аян", href: "/marketing/campaigns" },
          { label: "Хүсэлтүүд", href: "/marketing/promotions" },
          { label: "Баннер, Попап", href: "/marketing/reports" },
        ],
      },
    ],
    bottom: COMMON_BOTTOM,
  },
};

function filterNav(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterNav(item.children, role) : undefined,
    }))
    .filter((item) => {
      if (!item.children) return true;
      return item.children.length > 0;
    });
}

export function getNavByRole(role: UserRole): RoleConfig {
  const base = NAV_CONFIG[role] ?? NAV_CONFIG.customer;
  return {
    nav: filterNav(base.nav, role),
    bottom: filterNav(base.bottom, role),
  };
}

export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: "Систем администратор",
  customer: "Харилцагч хэрэглэгч",
  accountant: "Санхүү - Нягтлан бодогч",
  pharmacy_manager: "Эмийн алба - Менежер",
  pharmacist: "Эмийн сан - Жор баригч",
  marketing_manager: "Маркетинг - Менежер",
};
