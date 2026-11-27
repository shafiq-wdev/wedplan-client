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
    typeof params?.session_id === "string" ? params.session_id : "";
  const transaction = await getTransactionBySessionId(sessionId);
  const status = transaction?.status || "processing";

  const copy =
    status === "completed"
      ? {
          variant: "success",
          title: "Premium is active",
          description:
            "Your payment was confirmed by Stripe. You can now publish unlimited active services.",
        }
      : {
          variant: "pending",
          title: "Payment confirmation in progress",
          description:
            "Stripe is confirming your payment. Premium access activates only after the verified webhook arrives, so please refresh this page shortly.",
        };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <PaymentResultCard
        variant={copy.variant}
        title={copy.title}
        description={copy.description}
        statusLabel={status}
        sessionId={sessionId}
      />
    </main>
  );
}
