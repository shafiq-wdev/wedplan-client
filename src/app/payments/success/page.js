import { connection } from "next/server";

import PaymentResultCard from "@/components/payments/PaymentResultCard";
import { requirePageAccess } from "@/lib/auth-guards";
import { getTransactionBySessionId } from "@/lib/payments";

export const instant = false;

export default async function PaymentSuccessPage({ searchParams }) {
  await connection();
  await requirePageAccess(["vendor"]);

  const params = await searchParams;
  const sessionId =
    typeof params?.session_id === "string" ? params.session_id.trim() : "";
  const transaction = sessionId
    ? await getTransactionBySessionId(sessionId)
    : null;
  const status = transaction?.status || "processing";

  let copy;

  if (!sessionId) {
    copy = {
      variant: "error",
      title: "Payment reference missing",
      description:
        "This link does not include a Stripe checkout reference, so we cannot confirm a payment. Return to your subscription page to start a new checkout.",
    };
  } else if (status === "completed") {
    copy = {
      variant: "success",
      title: "Premium is active",
      description:
        "Your payment was confirmed by Stripe. You can now publish unlimited active services.",
    };
  } else {
    copy = {
      variant: "pending",
      title: "Payment confirmation in progress",
      description:
        "Stripe is confirming your payment. Premium access activates only after the verified webhook arrives. Refresh this page in a moment to check the latest status.",
    };
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <PaymentResultCard
        variant={copy.variant}
        title={copy.title}
        description={copy.description}
        statusLabel={sessionId ? status : "missing reference"}
        sessionId={sessionId}
        showRefresh={Boolean(sessionId) && status !== "completed"}
      />
    </main>
  );
}
