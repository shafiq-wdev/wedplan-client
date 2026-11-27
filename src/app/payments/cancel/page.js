import { connection } from "next/server";

import PaymentResultCard from "@/components/payments/PaymentResultCard";
import { requirePageAccess } from "@/lib/auth-guards";
import { getTransactionBySessionId } from "@/lib/payments";

export const instant = false;

export default async function PaymentCancelPage({ searchParams }) {
  await connection();
  await requirePageAccess(["vendor"]);

  const params = await searchParams;
  const sessionId =
    typeof params?.session_id === "string" ? params.session_id.trim() : "";
  const transaction = sessionId
    ? await getTransactionBySessionId(sessionId)
    : null;
  const status = transaction?.status || "cancelled";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <PaymentResultCard
        variant={sessionId ? "cancel" : "error"}
        title={sessionId ? "Checkout cancelled" : "Checkout reference missing"}
        description={
          sessionId
            ? "No charge was made. Your current plan has not changed, and you can start a new checkout whenever you are ready."
            : "We could not find a checkout reference in this link, so there is no payment to cancel. Return to your subscription page to try again."
        }
        statusLabel={sessionId ? status : "missing reference"}
        sessionId={sessionId}
        showRefresh={Boolean(sessionId) && status === "processing"}
      />
    </main>
  );
}
