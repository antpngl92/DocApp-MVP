import type {
  CURRENT_AUTHENTICATED_USER_STATUS,
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
  role: string;
  status: string;
};

type RequireAdminAccessOptions = {
  membership: AdminAccessMembership | null;
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

type StaffInvitationResultStatus =
  (typeof STAFF_INVITATION_RESULT_STATUS)[keyof typeof STAFF_INVITATION_RESULT_STATUS];

type StaffInvitationOrganization = {
  id: string;
};

type StaffInvitationMembership = {
  role: string;
  status: string;
};

type StaffInvitationResult = {
  clerkInvitationId: string | null;
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

type StaffInvitationDatabase = LocalUserLookupDatabase & {
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
    findUnique: (args: {
      where: {
        userId: string;
      };
    }) => Promise<StaffInvitationMembership | null>;
  };
};

type CreateStaffInvitationOptions = StaffInvitationCreateInput & {
  authReader?: CurrentUserAuthReader;
  database?: StaffInvitationDatabase;
  invitationCreator?: ClerkInvitationCreator;
};

type StaffOnboardingMembership = {
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
  CurrentUserAuthReader,
  GetCurrentAuthenticatedUserOptions,
  LocalUserLookupDatabase,
  LocalUserLookupDatabase as CurrentUserDatabase,
  LocalUserRecord,
  OwnerBootstrapDatabase,
  OwnerBootstrapLocalUserInput,
  OwnerBootstrapMembership,
  OwnerBootstrapMembershipStatus,
  OwnerBootstrapResult,
  OwnerBootstrapRole,
  OwnerBootstrapStatus,
  RequireAdminAccessOptions,
  ActivateStaffInvitationOptions,
  StaffMemberRole,
  StaffMemberStatus,
  ClerkInvitationCreator,
  CreateStaffInvitationOptions,
  StaffInvitationDatabase,
  StaffInvitationResult,
  StaffInvitationResultStatus,
  StaffOnboardingDatabase,
  StaffOnboardingMembership,
  StaffOnboardingResult,
  StaffOnboardingStatus,
};
