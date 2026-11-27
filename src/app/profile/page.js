import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { requirePageAccess } from "@/lib/auth-guards";
import { getDashboardPath, getRoleLabel } from "@/lib/roles";

export const instant = false;

export default async function ProfilePage() {
  const session = await requirePageAccess();

  const { user } = session;
  const role = user.role || "customer";
  const displayName = user.name || "WedPlan user";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl animate-fade-up">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-100/60">
          <div className="h-32 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600" />

          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-rose-100 text-2xl font-bold text-rose-600 shadow-md">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={displayName}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {getRoleLabel(role)}
                  </p>
                </div>
              </div>

              <Link
                href={getDashboardPath(role)}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-rose-400">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="mt-2 break-all text-sm font-medium text-gray-700">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-rose-400">
                  <ShieldCheck className="h-4 w-4" />
                  Account role
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {getRoleLabel(role)}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Profile editing is coming soon.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
