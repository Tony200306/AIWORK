export const RouteConfig = {
  //auth
  LoginPage: {
    path: "/login",
  },
  Logout: {
    path: "/logout",
  },
  ForgotPasswordPage: {
    path: "/forgot-password",
  },
  ProfilePage: {
    path: "/profile",
  },
  HomePage: {
    path: "/",
  },

  SearchPage: {
    path: "/search",
    getPath: (searchKey?: string) => {
      return searchKey ? `/search?searchKey=${searchKey}` : "/search";
    },
  },
  DetailSearchPage: {
    getPath: (id: string) => {
      return `/search/${id}`;
    },
  },
  TrackOrderPage: {
    path: "/track-order",
  },
  DetailTrackOrderPage: {
    getPath: (id: string) => {
      return `/track-order/${id}`;
    },
  },
  CreateOrderPage: {
    path: "/create-order",
  },
  DebtPage: {
    path: "/debt",
  },
  DetailDebtPage: {
    getPath: (id: string) => {
      return `/debt/${id}`;
    },
  },
  OrderAssistPage: {
    path: "/order-assist",
  },
  BulkOrderPage: {
    path: "/bulk-order",
  },
  NotificationPage: {
    path: "/notification",
  },

  BrainDumpPage: {
    path: "/brain-dump",
  },
  AtomicSplitPage: {
    path: "/atomic-split",
    getPath: (id: string) => {
      return `/atomic-split/${id}`;
    },
  },
  FTEKanbanPage: {
    path: "/fte-kanban",
    getPath: (id: string) => {
      return `/fte-kanban/${id}`;
    },
  },
  MasterKanBan: {
    path: "/master-kanban",
    getPath: (id: string) => {
      return `/master-kanban/${id}`;
    },
  },
  BackLog: {
    path: "/backlog",
  },
  StartNewSprint: {
    path: "/start-new-sprint",
  },
  VantumCalendar: {
    path: "/vantum-calendar",
  },
  SprintComplete: {
    path: "/sprint-complete",
    getPath: (id: string) => {
      return `/sprint-complete/${id}`;
    },
  },
  GuideStepsPage: {
    path: "/guide-steps",
  },

  // External Routes (from landing page)
  ExtBrainDumpPage: {
    path: "/ext-braindump",
  },
  ExtAtomicSplitPage: {
    path: "/ext/ext-atomic-split",
    getPath: (id: string) => {
      return `/ext-atomic-split/${id}`;
    },
  },
  ExtFTEKanbanPage: {
    path: "/ext/ext-fte-kanban",
    getPath: (id: string) => {
      return `/ext-fte-kanban/${id}`;
    },
  },

  // Onboarding
  OnboardingPage: {
    path: "/onboarding",
  },
  YourNamePage: {
    path: "/onboarding/your-name",
  },
  PrimaryRolePage: {
    path: "/onboarding/primary-role",
  },
  WeeklyHoursPage: {
    path: "/onboarding/weekly-hours",
  },
  TaskSourcesPage: {
    path: "/onboarding/task-sources",
  },
  QuarterlyGoalPage: {
    path: "/onboarding/quarterly-goal",
  },
  CoreValuesPage: {
    path: "/onboarding/core-values",
  },
  TopClientPage: {
    path: "/onboarding/top-client",
  },
  ClientHealthPage: {
    path: "/onboarding/client-health",
  },
  ClientGoalPage: {
    path: "/onboarding/client-goal",
  },
  ClientRevenuePage: {
    path: "/onboarding/client-revenue",
  },
  TaskTimelinePage: {
    path: "/onboarding/task-timeline",
  },
  OnboardingBrainDump: {
    path: "/onboarding/brain-dump",
  },
  OnboardingEmailCollector: {
    path: "/onboarding/email-collector",
  },
  OnboardingCapacityReport: {
    path: "/onboarding/capacity-report",
  },

} as const;

// Onboarding Flow Session Storage Keys
export const ONBOARDING_FLOW_KEYS = {
  GET_VANTUM_LANDING_PAGE: "get-vantum-landing-page",
  HOME_LANDING_PAGE: "home-landing-page",
} as const;
