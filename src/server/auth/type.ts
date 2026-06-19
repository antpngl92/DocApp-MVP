import type {
  CLERK_INVITATION_STATUS,
  CURRENT_AUTHENTICATED_USER_STATUS,
  DOCTOR_PROFILE_APPROVAL_RESULT_STATUS,
  DOCTOR_PROFILE_ACCESS_STATUS,
  DOCTOR_PROFILE_CREATION_RESULT_STATUS,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
  ORGANIZATION_STATUS,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_ONBOARDING_STATUS,
} from "./consts";

type LocalUserRecord = {
  clerkUserId: string;
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  updatedAt: Date;
};

type LocalUserLookupDatabase = {
  user: {
    findUnique: (args: {
      where: {
        clerkUserId: string;
      };
    }) => Promise<LocalUserRecord | null>;
  };
};

type AuthenticatedUserRecord = LocalUserRecord;

type CurrentAuthenticatedUserStatus =
  (typeof CURRENT_AUTHENTICATED_USER_STATUS)[keyof typeof CURRENT_AUTHENTICATED_USER_STATUS];

type CurrentAuthenticatedUserState<
  TStatus extends CurrentAuthenticatedUserStatus,
  TClerkUserId extends string | null,
  TUser extends AuthenticatedUserRecord | null,
> = {
  clerkUserId: TClerkUserId;
  status: TStatus;
  user: TUser;
};

type CurrentAuthenticatedUserResult =
  | CurrentAuthenticatedUserState<typeof CURRENT_AUTHENTICATED_USER_STATUS.signedOut, null, null>
  | CurrentAuthenticatedUserState<
      typeof CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser,
      string,
      null
    >
  | CurrentAuthenticatedUserState<
      typeof CURRENT_AUTHENTICATED_USER_STATUS.authenticated,
      string,
      AuthenticatedUserRecord
    >;

type CurrentUserAuthReader = () => Promise<{
  userId: string | null;
}>;

type GetCurrentAuthenticatedUserOptions = {
  authReader?: CurrentUserAuthReader;
  database?: LocalUserLookupDatabase;
};

type AdminAccessMembership = {
  id?: string;
  organizationId?: string;
  role: string;
  status: string;
};

type RequireAdminAccessOptions = {
  membership: AdminAccessMembership | null;
};

type CurrentClinicRecord = {
  id: string;
  name?: string;
  status?: string;
};

type CurrentClinicAccessResult = {
  clinic: CurrentClinicRecord;
  membership: AdminAccessMembership | null;
  user: AuthenticatedUserRecord;
};

type CurrentClinicAccessDatabase = LocalUserLookupDatabase & {
  organization: {
    findFirst: (args: {
      orderBy: {
        createdAt: "asc";
      };
      where: {
        id?: string;
        status: typeof ORGANIZATION_STATUS.active;
      };
    }) => Promise<CurrentClinicRecord | null>;
  };
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
};

type RequireCurrentClinicAccessOptions = {
  authReader?: CurrentUserAuthReader;
  database?: CurrentClinicAccessDatabase;
};

type PatientProfileRecord = {
  createdAt?: Date;
  email: string;
  id: string;
  name: string | null;
  phone: string | null;
  updatedAt?: Date;
  userId: string;
};

type PatientProfileAccessResult = {
  patientProfile: PatientProfileRecord;
  user: AuthenticatedUserRecord;
};

type PatientProfileAccessDatabase = LocalUserLookupDatabase & {
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
  patientProfile: {
    create: (args: {
      data: {
        email: string;
        name: string | null;
        userId: string;
      };
    }) => Promise<PatientProfileRecord>;
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<PatientProfileRecord | null>;
  };
};

type RequirePatientProfileAccessOptions = {
  authReader?: CurrentUserAuthReader;
  database?: PatientProfileAccessDatabase;
};

type PublicNavigationDatabase = LocalUserLookupDatabase & {
  doctor: {
    findFirst: (args: {
      where: {
        organizationId: string;
        OR: Array<
          | {
              organizationMemberId: string;
            }
          | {
              userId: string;
            }
        >;
      };
    }) => Promise<DoctorProfileRecord | null>;
  };
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
};

type GetPublicNavigationForCurrentUserOptions = {
  authReader?: CurrentUserAuthReader;
  database?: PublicNavigationDatabase;
};

type OwnerBootstrapRole = (typeof OWNER_BOOTSTRAP_ROLE)[keyof typeof OWNER_BOOTSTRAP_ROLE];
type OwnerBootstrapMembershipStatus =
  (typeof OWNER_BOOTSTRAP_MEMBERSHIP_STATUS)[keyof typeof OWNER_BOOTSTRAP_MEMBERSHIP_STATUS];
type OwnerBootstrapStatus = (typeof OWNER_BOOTSTRAP_STATUS)[keyof typeof OWNER_BOOTSTRAP_STATUS];

type OwnerBootstrapResult = {
  membership: OwnerBootstrapMembership | null;
  role: OwnerBootstrapRole | null;
  status: OwnerBootstrapStatus;
};

type OwnerBootstrapOrganization = {
  id: string;
};

type OwnerBootstrapMembership = {
  id: string;
  role: string;
  status: string;
  userId: string | null;
};

type OwnerBootstrapLocalUserInput = {
  clerkUserId: string;
  email: string;
  name: string | null;
};

type OwnerBootstrapDatabase = LocalUserLookupDatabase & {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          role: OwnerBootstrapRole;
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
  };
  organization: {
    findFirst: (args: {
      orderBy: {
        createdAt: "asc";
      };
      where: {
        status: typeof OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active;
      };
    }) => Promise<OwnerBootstrapOrganization | null>;
  };
  user: LocalUserLookupDatabase["user"] & {
    upsert: (args: {
      create: OwnerBootstrapLocalUserInput;
      update: Pick<OwnerBootstrapLocalUserInput, "email" | "name">;
      where: {
        clerkUserId: string;
      };
    }) => Promise<LocalUserRecord>;
  };
  organizationMember: {
    create: (args: {
      data: {
        invitedEmail: string;
        organizationId: string;
        role: OwnerBootstrapRole;
        status: typeof OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active;
        userId: string;
      };
    }) => Promise<OwnerBootstrapMembership>;
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<OwnerBootstrapMembership | null>;
  };
};

type ClerkBackendEmailAddress = {
  emailAddress?: string | null;
  id?: string | null;
};

type ClerkBackendUser = {
  emailAddresses?: ClerkBackendEmailAddress[] | null;
  firstName?: string | null;
  id?: string | null;
  lastName?: string | null;
  primaryEmailAddressId?: string | null;
  privateMetadata?: unknown;
  username?: string | null;
};

type ClerkBootstrapProfile = {
  localUserInput: OwnerBootstrapLocalUserInput | null;
  privateMetadata: unknown;
};

type ClerkBootstrapProfileReader = (clerkUserId: string) => Promise<ClerkBootstrapProfile>;

type BootstrapOwnerAdminMembershipOptions = {
  authReader?: CurrentUserAuthReader;
  clerkProfileReader?: ClerkBootstrapProfileReader;
  database?: OwnerBootstrapDatabase;
};

type StaffMemberRole = (typeof STAFF_MEMBER_ROLE)[keyof typeof STAFF_MEMBER_ROLE];
type StaffMemberStatus = (typeof STAFF_MEMBER_STATUS)[keyof typeof STAFF_MEMBER_STATUS];
type StaffOnboardingStatus = (typeof STAFF_ONBOARDING_STATUS)[keyof typeof STAFF_ONBOARDING_STATUS];

type DoctorProfileOnboardingStatus =
  (typeof DOCTOR_PROFILE_ONBOARDING_STATUS)[keyof typeof DOCTOR_PROFILE_ONBOARDING_STATUS];

type DoctorProfileAccessStatus =
  (typeof DOCTOR_PROFILE_ACCESS_STATUS)[keyof typeof DOCTOR_PROFILE_ACCESS_STATUS];

type DoctorProfileRecord = {
  id: string;
  isActive: boolean;
  isBookable: boolean;
  onboardingStatus: string;
  organizationId: string;
  organizationMemberId: string | null;
  userId: string | null;
};

type DoctorProfileAccessResult = {
  doctor: DoctorProfileRecord | null;
  membership: AdminAccessMembership | null;
  status: DoctorProfileAccessStatus;
  user: AuthenticatedUserRecord | null;
};

type DoctorProfileCreationResultStatus =
  (typeof DOCTOR_PROFILE_CREATION_RESULT_STATUS)[keyof typeof DOCTOR_PROFILE_CREATION_RESULT_STATUS];

type DoctorProfileCreationInput = {
  name: string;
  phone?: string | null;
  specialty?: string | null;
};

type DoctorProfileCreationResult = {
  doctorId: string | null;
  status: DoctorProfileCreationResultStatus;
};

type DoctorProfileApprovalResultStatus =
  (typeof DOCTOR_PROFILE_APPROVAL_RESULT_STATUS)[keyof typeof DOCTOR_PROFILE_APPROVAL_RESULT_STATUS];

type PendingDoctorApprovalRecord = {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
};

type DoctorProfileApprovalResult = {
  doctorId: string | null;
  status: DoctorProfileApprovalResultStatus;
};

type DoctorProfileAccessDatabase = LocalUserLookupDatabase & {
  doctor: {
    findFirst: (args: {
      where: {
        organizationId: string;
        OR: Array<
          | {
              organizationMemberId: string;
            }
          | {
              userId: string;
            }
        >;
      };
    }) => Promise<DoctorProfileRecord | null>;
  };
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
};

type DoctorProfileCreationDatabase = DoctorProfileAccessDatabase & {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
  };
  doctor: DoctorProfileAccessDatabase["doctor"] & {
    create: (args: {
      data: {
        email: string;
        isActive: false;
        isBookable: false;
        name: string;
        onboardingStatus: typeof DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval;
        organizationId: string;
        organizationMemberId: string;
        phone: string | null;
        specialty: string | null;
        userId: string;
      };
    }) => Promise<DoctorProfileRecord>;
  };
};

type DoctorProfileApprovalDatabase = LocalUserLookupDatabase & {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
  };
  doctor: {
    findFirst: (args: {
      where: {
        id: string;
        organizationId: string;
      };
    }) => Promise<DoctorProfileRecord | null>;
    findMany: (args: {
      orderBy: {
        createdAt: "asc" | "desc";
      };
      select: {
        createdAt: true;
        email: true;
        id: true;
        name: true;
        phone: true;
        specialty: true;
      };
      where: {
        onboardingStatus: typeof DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval;
        organizationId: string;
      };
    }) => Promise<PendingDoctorApprovalRecord[]>;
    update: (args: {
      data: {
        isActive: true;
        isBookable: false;
        onboardingStatus: typeof DOCTOR_PROFILE_ONBOARDING_STATUS.approved;
      };
      where: {
        id: string;
      };
    }) => Promise<DoctorProfileRecord>;
  };
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
};

type GetDoctorProfileAccessForCurrentUserOptions = {
  authReader?: CurrentUserAuthReader;
  database?: DoctorProfileAccessDatabase;
};

type CreateDoctorProfileForCurrentUserOptions = DoctorProfileCreationInput & {
  authReader?: CurrentUserAuthReader;
  database?: DoctorProfileCreationDatabase;
};

type GetPendingDoctorApprovalsForCurrentAdminOptions = {
  authReader?: CurrentUserAuthReader;
  database?: DoctorProfileApprovalDatabase;
};

type ApproveDoctorProfileForCurrentAdminOptions = {
  authReader?: CurrentUserAuthReader;
  database?: DoctorProfileApprovalDatabase;
  doctorId: string;
};

type DashboardRoleAccessDatabase = LocalUserLookupDatabase & {
  organizationMember: {
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<AdminAccessMembership | null>;
  };
};

type RequireDashboardRoleAccessOptions = {
  allowedRoles: readonly StaffMemberRole[];
  authReader?: CurrentUserAuthReader;
  database?: DashboardRoleAccessDatabase;
};

type StaffInvitationResultStatus =
  (typeof STAFF_INVITATION_RESULT_STATUS)[keyof typeof STAFF_INVITATION_RESULT_STATUS];

type StaffInvitationOrganization = {
  id: string;
};

type StaffInvitationMembership = {
  role: string;
  status: string;
};

type ClerkInvitationStatus = (typeof CLERK_INVITATION_STATUS)[keyof typeof CLERK_INVITATION_STATUS];

type StaffInvitationPendingMembership = {
  clerkInvitationId: string | null;
  clerkInvitationStatus: string | null;
  id: string;
  invitedEmail: string | null;
  organizationId: string;
  role: string;
  status: string;
};

type StaffInvitationResult = {
  clerkInvitationId: string | null;
  membershipId: string | null;
  organizationId: string | null;
  status: StaffInvitationResultStatus;
};

type StaffInvitationCreateInput = {
  email: string;
  role: StaffMemberRole;
};

type ClerkInvitationCreateInput = {
  emailAddress: string;
  redirectUrl: string;
};

type ClerkInvitationCreateResult = {
  id?: string | null;
};

type ClerkInvitationCreator = (
  input: ClerkInvitationCreateInput,
) => Promise<ClerkInvitationCreateResult>;

type ClerkInvitationRevoker = (invitationId: string) => Promise<unknown>;

type StaffInvitationDatabase = LocalUserLookupDatabase & {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          email: string;
          role: StaffMemberRole;
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
  };
  organization: {
    findFirst: (args: {
      orderBy: {
        createdAt: "asc";
      };
      where: {
        status: typeof ORGANIZATION_STATUS.active;
      };
    }) => Promise<StaffInvitationOrganization | null>;
  };
  organizationMember: {
    create: (args: {
      data: {
        invitedEmail: string;
        organizationId: string;
        role: StaffMemberRole;
        status: typeof STAFF_MEMBER_STATUS.invited;
      };
    }) => Promise<StaffInvitationPendingMembership>;
    delete: (args: {
      where: {
        id: string;
      };
    }) => Promise<unknown>;
    findFirst: (args: {
      where: {
        invitedEmail: string;
        organizationId: string;
        status: {
          in: StaffMemberStatus[];
        };
      };
    }) => Promise<StaffInvitationPendingMembership | null>;
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<StaffInvitationMembership | null>;
    update: (args: {
      data: {
        clerkInvitationId: string | null;
        clerkInvitationStatus: ClerkInvitationStatus;
      };
      where: {
        id: string;
      };
    }) => Promise<StaffInvitationPendingMembership>;
  };
};

type CreateStaffInvitationOptions = StaffInvitationCreateInput & {
  authReader?: CurrentUserAuthReader;
  database?: StaffInvitationDatabase;
  invitationCreator?: ClerkInvitationCreator;
  invitationRevoker?: ClerkInvitationRevoker;
};

type StaffOnboardingMembership = {
  clerkInvitationId: string | null;
  clerkInvitationStatus: string | null;
  id: string;
  invitedEmail: string | null;
  organizationId: string;
  role: string;
  status: string;
  userId: string | null;
};

type StaffOnboardingResult = {
  membership: StaffOnboardingMembership | null;
  status: StaffOnboardingStatus;
};

type StaffOnboardingDatabase = LocalUserLookupDatabase & {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          email: string;
          role: StaffMemberRole;
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
  };
  user: LocalUserLookupDatabase["user"] & {
    upsert: (args: {
      create: OwnerBootstrapLocalUserInput;
      update: Pick<OwnerBootstrapLocalUserInput, "email" | "name">;
      where: {
        clerkUserId: string;
      };
    }) => Promise<LocalUserRecord>;
  };
  organizationMember: {
    findFirst: (args: {
      where: {
        invitedEmail: string;
        status: typeof STAFF_MEMBER_STATUS.invited;
      };
    }) => Promise<StaffOnboardingMembership | null>;
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<StaffOnboardingMembership | null>;
    update: (args: {
      data: {
        clerkInvitationStatus: typeof CLERK_INVITATION_STATUS.accepted;
        status: typeof STAFF_MEMBER_STATUS.active;
        userId: string;
      };
      where: {
        id: string;
      };
    }) => Promise<StaffOnboardingMembership>;
  };
};

type ActivateStaffInvitationOptions = {
  authReader?: CurrentUserAuthReader;
  clerkProfileReader?: ClerkBootstrapProfileReader;
  database?: StaffOnboardingDatabase;
};

export type {
  AdminAccessMembership,
  AuthenticatedUserRecord,
  BootstrapOwnerAdminMembershipOptions,
  ClerkBackendUser,
  ClerkBootstrapProfile,
  ClerkBootstrapProfileReader,
  CurrentAuthenticatedUserResult,
  CurrentAuthenticatedUserStatus,
  CurrentClinicAccessDatabase,
  CurrentClinicAccessResult,
  CurrentUserAuthReader,
  GetPublicNavigationForCurrentUserOptions,
  GetCurrentAuthenticatedUserOptions,
  LocalUserLookupDatabase,
  LocalUserLookupDatabase as CurrentUserDatabase,
  LocalUserRecord,
  PublicNavigationDatabase,
  PatientProfileAccessDatabase,
  PatientProfileAccessResult,
  PatientProfileRecord,
  OwnerBootstrapDatabase,
  OwnerBootstrapLocalUserInput,
  OwnerBootstrapMembership,
  OwnerBootstrapMembershipStatus,
  OwnerBootstrapResult,
  OwnerBootstrapRole,
  OwnerBootstrapStatus,
  RequireAdminAccessOptions,
  RequireCurrentClinicAccessOptions,
  RequirePatientProfileAccessOptions,
  ActivateStaffInvitationOptions,
  StaffMemberRole,
  StaffMemberStatus,
  ClerkInvitationCreateResult,
  ClerkInvitationCreator,
  ClerkInvitationRevoker,
  ClerkInvitationStatus,
  CreateStaffInvitationOptions,
  ApproveDoctorProfileForCurrentAdminOptions,
  DoctorProfileApprovalDatabase,
  DoctorProfileApprovalResult,
  DoctorProfileApprovalResultStatus,
  DoctorProfileAccessDatabase,
  DoctorProfileAccessResult,
  DoctorProfileAccessStatus,
  DoctorProfileCreationDatabase,
  DoctorProfileCreationInput,
  DoctorProfileCreationResult,
  DoctorProfileCreationResultStatus,
  DoctorProfileOnboardingStatus,
  DoctorProfileRecord,
  CreateDoctorProfileForCurrentUserOptions,
  GetPendingDoctorApprovalsForCurrentAdminOptions,
  DashboardRoleAccessDatabase,
  GetDoctorProfileAccessForCurrentUserOptions,
  RequireDashboardRoleAccessOptions,
  PendingDoctorApprovalRecord,
  StaffInvitationDatabase,
  StaffInvitationPendingMembership,
  StaffInvitationResult,
  StaffInvitationResultStatus,
  StaffOnboardingDatabase,
  StaffOnboardingMembership,
  StaffOnboardingResult,
  StaffOnboardingStatus,
};
