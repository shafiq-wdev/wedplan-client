import { ReceiptText } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { requireAdminPage } from "@/lib/admin";
import { db } from "@/lib/db";
import { isStripeWebhookConfigured, serializeTransaction } from "@/lib/payments";

export const instant = false;

function isSuccessful(status) {
  return ["completed", "paid", "succeeded"].includes(status);
}

export default async function AdminTransactionsPage() {
  await requireAdminPage();

  let rawTransactions = [];
  let loadError = "";

  try {
    rawTransactions = await db
      .collection("transactions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
  } catch (error) {
    console.error("Unable to load transactions:", error);
    loadError = "Transactions are temporarily unavailable. Please try again shortly.";
  }

  const transactions = rawTransactions.map(serializeTransaction);
  const totalVolume = transactions
    .filter((transaction) => isSuccessful(transaction.status))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const webhookConfigured = isStripeWebhookConfigured();

  return (
    <AdminShell
      title="Platform transactions"
      description="Monitor read-only payment records. Payment status is only updated by verified Stripe webhooks, never by the success redirect or manual admin edits."
    >
      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {loadError}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Transactions
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {transactions.length}
          </p>
        </article>

        <article className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Confirmed volume
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            ${totalVolume.toLocaleString()}
          </p>
        </article>

        <article className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payment provider
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {webhookConfigured ? "Stripe (test mode)" : "Not configured"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {webhookConfigured
              ? "Webhook endpoint: /api/payments/webhook"
              : "Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PREMIUM_PRICE_ID."}
          </p>
        </article>
      </section>

      <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-rose-50/70 text-xs uppercase tracking-wide text-rose-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Subscription plan</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Stripe reference</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <ReceiptText className="mx-auto h-6 w-6 text-rose-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No transactions recorded yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Stripe subscription payments will show up here.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {transaction.customerName || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.customerEmail || ""}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {transaction.vendorName || "—"}
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-700">
                      {transaction.plan || "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {transaction.description || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${transaction.amount.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        {transaction.currency}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={transaction.status || "pending"} />
                      {transaction.providerStatus ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Stripe: {transaction.providerStatus}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-slate-600">
                        {transaction.stripeSubscriptionId ||
                          transaction.stripeSessionId ||
                          "—"}
                      </p>
                      {transaction.stripeSubscriptionId &&
                      transaction.stripeSessionId ? (
                        <p className="mt-1 font-mono text-[11px] text-slate-400">
                          {transaction.stripeSessionId}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
