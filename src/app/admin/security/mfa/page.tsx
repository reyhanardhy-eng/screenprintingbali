import { requireMfaSetup } from "@/lib/auth";
import MfaEnrollment from "./MfaEnrollment";

export const dynamic = "force-dynamic";

export default async function MfaSetupPage() {
  await requireMfaSetup();
  return <MfaEnrollment />;
}
