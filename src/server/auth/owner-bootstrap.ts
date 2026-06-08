import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_METADATA_NAMESPACE,
  OWNER_BOOTSTRAP_METADATA_ROLE_KEY,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
} from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  BootstrapOwnerAdminMembershipOptions,
  ClerkBackendUser,
  ClerkBootstrapProfile,
  ClerkBootstrapProfileReader,
  LocalUserRecord,
  OwnerBootstrapDatabase,
  OwnerBootstrapLocalUserInput,
  OwnerBootstrapMembershipStatus,
  OwnerBootstrapResult,
  OwnerBootstrapRole,
  OwnerBootstrapStatus,
} from "./type";
import {
  createOwnerAdminMembership,
  getDefaultOwnerBootstrapDatabase,
  hasDocAppBootstrapMetadata,
  isOwnerBootstrapRole,
  mapClerkBackendUserToBootstrapProfile,
  parseOwnerBootstrapRole,
  readClerkBootstrapProfile,
  upsertLocalUserFromClerkProfile,
} from "./utils";

const bootstrapOwnerAdminMembershipFromClerkPrivateMetadata = async ({
  authReader,
  clerkProfileReader = readClerkBootstrapProfile,
  database,
}: BootstrapOwnerAdminMembershipOptions = {}): Promise<OwnerBootstrapResult> => {
  const ownerBootstrapDatabase = database ?? (await getDefaultOwnerBootstrapDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: ownerBootstrapDatabase,
  });

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.signedOut) {
    return {
      membership: null,
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.signedOut,
    };
  }

  let localUser: LocalUserRecord | null =
    currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.authenticated
      ? currentUser.user
      : null;

  const existingMembership = localUser
    ? await ownerBootstrapDatabase.organizationMember.findUnique({
        where: {
          userId: localUser.id,
        },
      })
    : null;

  if (existingMembership) {
    return {
      membership: existingMembership,
      role: isOwnerBootstrapRole(existingMembership.role) ? existingMembership.role : null,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    };
  }

  const clerkProfile = await clerkProfileReader(currentUser.clerkUserId);

  if (!localUser) {
    if (!clerkProfile.localUserInput) {
      return {
        membership: null,
        role: null,
        status: OWNER_BOOTSTRAP_STATUS.invalidClerkUser,
      };
    }

    localUser = await upsertLocalUserFromClerkProfile(
      ownerBootstrapDatabase,
      clerkProfile.localUserInput,
    );
  }

  const membershipCreatedByConcurrentRequest =
    await ownerBootstrapDatabase.organizationMember.findUnique({
      where: {
        userId: localUser.id,
      },
    });

  if (membershipCreatedByConcurrentRequest) {
    return {
      membership: membershipCreatedByConcurrentRequest,
      role: isOwnerBootstrapRole(membershipCreatedByConcurrentRequest.role)
        ? membershipCreatedByConcurrentRequest.role
        : null,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    };
  }

  const role = parseOwnerBootstrapRole(clerkProfile.privateMetadata);

  if (!role) {
    return {
      membership: null,
      role: null,
      status: hasDocAppBootstrapMetadata(clerkProfile.privateMetadata)
        ? OWNER_BOOTSTRAP_STATUS.invalidRole
        : OWNER_BOOTSTRAP_STATUS.noBootstrapMetadata,
    };
  }

  return createOwnerAdminMembership({
    database: ownerBootstrapDatabase,
    localUser,
    role,
  });
};

export {
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_METADATA_NAMESPACE,
  OWNER_BOOTSTRAP_METADATA_ROLE_KEY,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
  isOwnerBootstrapRole,
  mapClerkBackendUserToBootstrapProfile,
  parseOwnerBootstrapRole,
};
export type {
  BootstrapOwnerAdminMembershipOptions,
  ClerkBackendUser,
  ClerkBootstrapProfile,
  ClerkBootstrapProfileReader,
  OwnerBootstrapDatabase,
  OwnerBootstrapLocalUserInput,
  OwnerBootstrapMembershipStatus,
  OwnerBootstrapResult,
  OwnerBootstrapRole,
  OwnerBootstrapStatus,
};
