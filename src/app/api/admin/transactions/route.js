import { NextResponse } from "next/server";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import { serializeTransaction } from "@/lib/payments";

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
    transactions: transactions.map(serializeTransaction),
  });
}
