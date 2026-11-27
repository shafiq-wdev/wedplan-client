import { ReceiptText } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/admin";
import { db } from "@/lib/db";

export const instant = false;

const statusStyles = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  refunded: "bg-slate-100 text-slate-600 ring-slate-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default async function AdminTransactionsPage() {
  await requireAdminPage();

  const transactions = await db
    .collection("transactions")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const totalVolume = transactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0
  );

  return (
    <AdminShell
      title="Platform transactions"
      description="Monitor payment activity across the marketplace. Transactions appear here as customers book vendors."
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Transactions
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {transactions.length}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total volume
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            ${totalVolume.toLocaleString()}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payment provider
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            Not connected
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Stripe integration is the next step.
          </p>
        </article>
      </section>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <ReceiptText className="mx-auto h-6 w-6 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No transactions recorded yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Bookings and Stripe payments will show up here once they
                      are connected.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id.toString()}>
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

                    <td className="px-4 py-3 text-slate-600">
                      {transaction.description || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${(Number(transaction.amount) || 0).toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        {transaction.currency || "USD"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                          statusStyles[transaction.status] ||
                          statusStyles.pending
                        }`}
                      >
                        {transaction.status || "pending"}
                      </span>
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
