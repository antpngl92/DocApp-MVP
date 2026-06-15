import { ROUTES } from "@/config/routes";
import { getAuthenticatedHomeForCurrentUser } from "@/server/auth/navigation";
import { bootstrapOwnerAdminMembershipFromClerkPrivateMetadata } from "@/server/auth/owner-bootstrap";
import { getAuthenticatedSession } from "@/server/auth/session";
import { activateStaffInvitationForCurrentUser } from "@/server/auth/staff-onboarding";

import PostAuthRedirect from "./PostAuthRedirect";

const PostAuthPage = async () => {
  const session = await getAuthenticatedSession();

  if (!session.userId) {
    return <PostAuthRedirect destination={ROUTES.signIn} />;
  }

  await activateStaffInvitationForCurrentUser();
  await bootstrapOwnerAdminMembershipFromClerkPrivateMetadata();

  return <PostAuthRedirect destination={await getAuthenticatedHomeForCurrentUser()} />;
};

export default PostAuthPage;
