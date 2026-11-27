"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Ban, Loader2, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIGNUP_ROLES, getRoleLabel } from "@/lib/roles";
import { cn } from "cn";

const roleStyles = {
  admin: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  vendor: "bg-amber-50 text-amber-700 ring-amber-200",
  customer: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const filters = [
  { value: "all", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "vendor", label: "Vendors" },
  { value: "admin", label: "Admins" },
];

function initialsOf(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export default function UsersManager({ currentUserId, initialRole = "all" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const params = new URLSearchParams();

        if (roleFilter !== "all") params.set("role", roleFilter);
        if (query) params.set("q", query);

        const response = await fetch(
          `/api/admin/users?${params.toString()}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          throw new Error(data.error || "Unable to load users.");
        }

        setUsers(data.users ?? []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [roleFilter, query]);

  const handleSearch = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    setQuery(searchInput.trim());
  };

  const updateRole = async (user, role) => {
    if (role === user.role) return;

    setBusyId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update role.");
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, role } : item
        )
      );

      toast.success(
        `${user.name || user.email} is now ${getRoleLabel(role)}.`
      );
    } catch (updateError) {
      toast.error(updateError.message);
    } finally {
      setBusyId("");
    }
  };

  const toggleBlock = async (user) => {
    const nextBlocked = !user.isBlocked;

    setBusyId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: nextBlocked }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update user status.");
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isBlocked: nextBlocked } : item
        )
      );

      toast.success(
        nextBlocked
          ? `${user.name || user.email} is now blocked.`
          : `${user.name || user.email} can access the platform again.`
      );
    } catch (blockError) {
      toast.error(blockError.message);
    } finally {
      setBusyId("");
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name || user.email}? This removes the account and all sessions.`
    );

    if (!confirmed) return;

    setBusyId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete user.");
      }

      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success("User deleted.");
    } catch (deleteError) {
      toast.error(deleteError.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                setRoleFilter(filter.value);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                roleFilter === filter.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or email"
              className="h-10 w-full rounded-xl border-slate-200 pl-9 sm:w-64"
            />
          </div>

          <Button
            type="submit"
            className="h-10 rounded-xl bg-slate-900 px-4 text-white hover:bg-slate-800"
          >
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <UserRound className="mx-auto h-6 w-6 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      No users match this filter.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isBusy = busyId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || "User"}
                                width={40}
                                height={40}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initialsOf(user.name || user.email)
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {user.name || "Unnamed user"}
                              {isSelf && (
                                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            roleStyles[user.role] || roleStyles.customer
                          )}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            user.isBlocked
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          )}
                        >
                          {user.isBlocked ? (
                            <Ban className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={(event) =>
                              updateRole(user, event.target.value)
                            }
                            disabled={isSelf || isBusy}
                            aria-label={`Role for ${user.email}`}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {SIGNUP_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {getRoleLabel(role)}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => toggleBlock(user)}
                            disabled={isSelf || isBusy}
                            aria-label={`${user.isBlocked ? "Unblock" : "Block"} ${user.email}`}
                            title={user.isBlocked ? "Unblock user" : "Block user"}
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40",
                              user.isBlocked
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            )}
                          >
                            {user.isBlocked ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            disabled={isSelf || isBusy}
                            aria-label={`Delete ${user.email}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing up to 200 accounts. You cannot change your own role, block or
        unblock yourself, or delete your own account.
      </p>
    </div>
  );
}
