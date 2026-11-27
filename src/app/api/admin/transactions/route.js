import { NextResponse } from "next/server";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const transactions = await db
    .collection("transactions")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({
    transactions: transactions.map((transaction) => ({
      id: transaction._id.toString(),
      customerName: transaction.customerName || "",
      customerEmail: transaction.customerEmail || "",
      vendorName: transaction.vendorName || "",
      description: transaction.description || "",
      amount: Number(transaction.amount) || 0,
      currency: transaction.currency || "USD",
      status: transaction.status || "pending",
      createdAt: transaction.createdAt
        ? new Date(transaction.createdAt).toISOString()
        : null,
    })),
  });
}
