"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type {
  AdminBusinessOwnerSummary,
  AdminJobSummary,
  AdminOverview,
  AdminUserSummary,
} from "@/lib/admin-overview";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { authClient } from "@/lib/auth-client";

function fmtMoney(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function toMs(value?: string) {
  if (!value) return 0;
  const d = new Date(value);
  const ms = d.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function norm(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function initials(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  const parts = src
    .replace(/[^a-zA-Z0-9\s@._-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const first = parts[0]?.[0] ?? "?";
  const second =
    parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] ?? email?.[0] ?? "");

  return (String(first) + String(second || "")).toUpperCase().slice(0, 2);
}

function SocialBlock({ social }: { social?: Record<string, any> }) {
  if (!social || typeof social !== "object") return <span>-</span>;
  const entries = Object.entries(social).filter(([k]) => !!k);
  if (!entries.length) return <span>-</span>;
  return (
    <div className="space-y-1">
      {entries.map(([platform, v]) => (
        <div key={platform} className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{platform}:</span>{" "}
          {v?.username ? `@${v.username}` : "-"}
          {v?.followers !== undefined && v?.followers !== null
            ? ` (${v.followers})`
            : ""}
        </div>
      ))}
    </div>
  );
}

function errorMessage(err: unknown) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium break-words">{value ?? "-"}</span>
    </div>
  );
}

function isUserBanned(u: AdminUserSummary) {
  if (typeof u.banned === "boolean") return u.banned;
  if (u.banExpiresAt) {
    const ms = new Date(u.banExpiresAt).getTime();
    if (Number.isFinite(ms) && ms > Date.now()) return true;
  }
  return false;
}

type UserSortKey =
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";

type OwnerSortKey =
  | "jobs_desc"
  | "jobs_asc"
  | "company_asc"
  | "company_desc"
  | "created_desc"
  | "created_asc";

type JobSortKey =
  | "created_desc"
  | "created_asc"
  | "price_desc"
  | "price_asc"
  | "title_asc"
  | "title_desc"
  | "proposals_desc"
  | "contracts_desc";

function matchesUser(u: AdminUserSummary, q: string) {
  if (!q) return true;
  const hay = [
    u.name,
    u.email,
    u.role,
    u.companyName,
    u.industry,
    u.location,
    u.businessPhone,
  ]
    .map(norm)
    .join(" ");
  return hay.includes(q);
}

function sortUsers(list: AdminUserSummary[], key: UserSortKey) {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (key) {
      case "created_asc":
        return toMs(a.createdAt) - toMs(b.createdAt);
      case "created_desc":
        return toMs(b.createdAt) - toMs(a.createdAt);
      case "email_asc":
        return norm(a.email).localeCompare(norm(b.email));
      case "email_desc":
        return norm(b.email).localeCompare(norm(a.email));
      case "name_desc":
        return norm(b.name || b.email).localeCompare(norm(a.name || a.email));
      case "name_asc":
      default:
        return norm(a.name || a.email).localeCompare(norm(b.name || b.email));
    }
  });
  return copy;
}

function sortOwners(list: AdminBusinessOwnerSummary[], key: OwnerSortKey) {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (key) {
      case "jobs_asc":
        return (a.jobs?.length ?? 0) - (b.jobs?.length ?? 0);
      case "jobs_desc":
        return (b.jobs?.length ?? 0) - (a.jobs?.length ?? 0);
      case "company_desc":
        return norm(b.companyName || b.name || b.email).localeCompare(
          norm(a.companyName || a.name || a.email),
        );
      case "company_asc":
        return norm(a.companyName || a.name || a.email).localeCompare(
          norm(b.companyName || b.name || b.email),
        );
      case "created_asc":
        return toMs(a.createdAt) - toMs(b.createdAt);
      case "created_desc":
      default:
        return toMs(b.createdAt) - toMs(a.createdAt);
    }
  });
  return copy;
}

function sortJobs(list: AdminJobSummary[], key: JobSortKey) {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (key) {
      case "created_asc":
        return toMs(a.createdAt) - toMs(b.createdAt);
      case "created_desc":
        return toMs(b.createdAt) - toMs(a.createdAt);
      case "price_asc":
        return (a.price ?? 0) - (b.price ?? 0);
      case "price_desc":
        return (b.price ?? 0) - (a.price ?? 0);
      case "title_desc":
        return norm(b.title).localeCompare(norm(a.title));
      case "title_asc":
        return norm(a.title).localeCompare(norm(b.title));
      case "proposals_desc":
        return (b.proposals?.length ?? 0) - (a.proposals?.length ?? 0);
      case "contracts_desc":
        return (b.contracts?.length ?? 0) - (a.contracts?.length ?? 0);
      default:
        return 0;
    }
  });
  return copy;
}

function ControlsRow({
  title,
  count,
  query,
  onQuery,
  sortLabel,
  sortValue,
  onSort,
  sortItems,
}: {
  title: string;
  count: number;
  query: string;
  onQuery: (next: string) => void;
  sortLabel: string;
  sortValue: string;
  onSort: (next: string) => void;
  sortItems: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{title}</div>
        <Badge variant="secondary" className="rounded-full">
          {count} results
        </Badge>
      </div>

      <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name, email, location…"
          className="lg:w-[360px]"
        />
        <Select value={sortValue} onValueChange={onSort}>
          <SelectTrigger className="lg:w-[220px]">
            <SelectValue placeholder={sortLabel} />
          </SelectTrigger>
          <SelectContent>
            {sortItems.map((it) => (
              <SelectItem key={it.value} value={it.value}>
                {it.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function AdminDashboard({ overview }: { overview: AdminOverview }) {
  const router = useRouter();

  const influencers = React.useMemo(
    () => overview.users.filter((u) => u.role === "influencer"),
    [overview.users],
  );

  const [usersQuery, setUsersQuery] = React.useState("");
  const [usersSort, setUsersSort] = React.useState<UserSortKey>("created_desc");

  const [influencersQuery, setInfluencersQuery] = React.useState("");
  const [influencersSort, setInfluencersSort] =
    React.useState<UserSortKey>("created_desc");

  const [ownersQuery, setOwnersQuery] = React.useState("");
  const [ownersSort, setOwnersSort] = React.useState<OwnerSortKey>("jobs_desc");

  const [jobsQuery, setJobsQuery] = React.useState("");
  const [jobsSort, setJobsSort] = React.useState<JobSortKey>("created_desc");

  const qUsers = norm(usersQuery);
  const qInfluencers = norm(influencersQuery);
  const qOwners = norm(ownersQuery);
  const qJobs = norm(jobsQuery);

  const [removedUserIds, setRemovedUserIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const filteredUsers = React.useMemo(() => {
    const base = overview.users
      .filter((u) => !removedUserIds.has(u.id))
      .filter((u) => matchesUser(u, qUsers));
    return sortUsers(base, usersSort);
  }, [overview.users, qUsers, usersSort, removedUserIds]);

  const filteredInfluencers = React.useMemo(() => {
    const base = influencers
      .filter((u) => !removedUserIds.has(u.id))
      .filter((u) => matchesUser(u, qInfluencers));
    return sortUsers(base, influencersSort);
  }, [influencers, qInfluencers, influencersSort, removedUserIds]);

  const filteredOwners = React.useMemo(() => {
    const base = overview.businessOwners.filter((o) => {
      if (!qOwners) return true;
      const hay = [
        o.companyName,
        o.name,
        o.email,
        o.location,
        o.businessPhone,
        String(o.jobs?.length ?? 0),
      ]
        .map(norm)
        .join(" ");
      return hay.includes(qOwners);
    });
    return sortOwners(base, ownersSort);
  }, [overview.businessOwners, qOwners, ownersSort]);

  const filteredJobs = React.useMemo(() => {
    const base = overview.jobs.filter((j) => {
      if (!qJobs) return true;
      const hay = [
        j.title,
        j.status,
        j.description,
        j.postedBy?.companyName,
        j.postedBy?.name,
        j.postedBy?.email,
        String(j.price ?? ""),
        String(j.proposals?.length ?? 0),
        String(j.contracts?.length ?? 0),
      ]
        .map(norm)
        .join(" ");
      return hay.includes(qJobs);
    });
    return sortJobs(base, jobsSort);
  }, [overview.jobs, qJobs, jobsSort]);

  const [userAction, setUserAction] = React.useState<{
    userId: string;
    action: "ban" | "unban" | "remove";
    state: "idle" | "loading" | "success" | "error";
    message?: string;
  } | null>(null);

  const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
  const [adminDialog, setAdminDialog] = React.useState<{
    user: AdminUserSummary;
    action: "ban" | "unban" | "remove";
  } | null>(null);

  const [banReason, setBanReason] = React.useState("Spamming");
  const [banExpiresInSeconds, setBanExpiresInSeconds] = React.useState(
    String(60 * 60 * 24 * 7),
  );

  async function runAdminAction<T>(
    userId: string,
    action: "ban" | "unban" | "remove",
    fn: () => Promise<T>,
  ) {
    setUserAction({ userId, action, state: "loading" });
    try {
      const res: any = await fn();
      if (res && typeof res === "object" && "error" in res && res.error) {
        const msg =
          (res.error && (res.error.message || res.error.code)) ||
          "Request failed";
        throw new Error(String(msg));
      }
      setUserAction({
        userId,
        action,
        state: "success",
        message: "Done.",
      });
      return res as T;
    } catch (e) {
      setUserAction({
        userId,
        action,
        state: "error",
        message: errorMessage(e),
      });
      return null;
    }
  }

  const dialogIsBusy = !!(
    isAdminDialogOpen &&
    adminDialog &&
    userAction?.state === "loading" &&
    userAction.userId === adminDialog.user.id
  );

  function openBanDialog(user: AdminUserSummary) {
    setAdminDialog({ user, action: "ban" });
    setBanReason("Spamming");
    setBanExpiresInSeconds(String(60 * 60 * 24 * 7));
    setIsAdminDialogOpen(true);
  }

  function openUnbanDialog(user: AdminUserSummary) {
    setAdminDialog({ user, action: "unban" });
    setIsAdminDialogOpen(true);
  }

  function openRemoveDialog(user: AdminUserSummary) {
    setAdminDialog({ user, action: "remove" });
    setIsAdminDialogOpen(true);
  }

  async function confirmDialogAction() {
    if (!adminDialog) return;
    const userId = adminDialog.user.id;

    if (adminDialog.action === "ban") {
      const expires = Math.floor(Number(banExpiresInSeconds));
      const reason = banReason.trim();

      if (!Number.isFinite(expires) || expires <= 0) {
        setUserAction({
          userId,
          action: "ban",
          state: "error",
          message: "Ban duration must be a positive number of seconds.",
        });
        return;
      }

      await runAdminAction(userId, "ban", () =>
        authClient.admin.banUser({
          userId,
          ...(reason ? { banReason: reason } : {}),
          banExpiresIn: expires,
        }),
      );

      router.refresh();

      setIsAdminDialogOpen(false);
      setAdminDialog(null);
      return;
    }

    if (adminDialog.action === "unban") {
      await runAdminAction(userId, "unban", () =>
        authClient.admin.unbanUser({ userId }),
      );

      router.refresh();

      setIsAdminDialogOpen(false);
      setAdminDialog(null);
      return;
    }

    const res = await runAdminAction(userId, "remove", () =>
      authClient.admin.removeUser({ userId }),
    );

    const deletedUserId = (res as any)?.data?.id;
    if (deletedUserId) {
      setRemovedUserIds((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      setUserAction({
        userId,
        action: "remove",
        state: "success",
        message: `Removed: ${deletedUserId}`,
      });
    }

    router.refresh();

    setIsAdminDialogOpen(false);
    setAdminDialog(null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Users, business owners, jobs, proposals, and contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">
              {overview.totals.users}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">
              Business Owners
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">
              {overview.totals.businessOwners}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">{overview.totals.jobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">
              Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">
              {overview.totals.proposals}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">
              Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">
              {overview.totals.contracts}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="influencers">
            Influencers ({influencers.length})
          </TabsTrigger>
          <TabsTrigger value="owners">
            Businesses ({overview.businessOwners.length})
          </TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="space-y-4 border-b">
              <CardTitle>All Users</CardTitle>
              <ControlsRow
                title="Browse users"
                count={filteredUsers.length}
                query={usersQuery}
                onQuery={setUsersQuery}
                sortLabel="Sort"
                sortValue={usersSort}
                onSort={(v) => setUsersSort(v as UserSortKey)}
                sortItems={[
                  { value: "created_desc", label: "Newest" },
                  { value: "created_asc", label: "Oldest" },
                  { value: "name_asc", label: "Name (A→Z)" },
                  { value: "name_desc", label: "Name (Z→A)" },
                  { value: "email_asc", label: "Email (A→Z)" },
                  { value: "email_desc", label: "Email (Z→A)" },
                ]}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredUsers.map((u) => (
                    <AccordionItem
                      key={u.id}
                      value={u.id}
                      className="mb-2 rounded-lg border border-border px-2 last:mb-0 border-b-0"
                    >
                      <AccordionTrigger className="px-2 -mx-2 rounded-lg hover:bg-muted/60 hover:no-underline data-[state=open]:bg-muted/60">
                        <div className="flex flex-1 items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage
                                src={u.image ?? undefined}
                                alt={u.name || u.email || "User"}
                              />
                              <AvatarFallback>
                                {initials(u.name, u.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {u.name || u.email || u.id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {u.email || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {u.role ? (
                              <Badge variant="secondary">{u.role}</Badge>
                            ) : null}
                            {u.verified ? (
                              <Badge variant="outline">verified</Badge>
                            ) : null}
                            {u.onboarded ? (
                              <Badge variant="outline">onboarded</Badge>
                            ) : null}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2 pb-2">
                          <div className="rounded-md bg-muted/30 p-4 space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {u.name || u.email || u.id}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  ID: {u.id}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {isUserBanned(u) ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                      userAction?.state === "loading" &&
                                      userAction.userId === u.id
                                    }
                                    onClick={() => openUnbanDialog(u)}
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={
                                      userAction?.state === "loading" &&
                                      userAction.userId === u.id
                                    }
                                    onClick={() => openBanDialog(u)}
                                  >
                                    Ban
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={
                                    userAction?.state === "loading" &&
                                    userAction.userId === u.id
                                  }
                                  onClick={() => openRemoveDialog(u)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {userAction?.userId === u.id &&
                            userAction.message ? (
                              <div
                                className={`text-xs ${
                                  userAction.state === "error"
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {userAction.action}: {userAction.message}
                              </div>
                            ) : null}

                            <div className="grid gap-3 md:grid-cols-2">
                              <Field label="Email" value={u.email || "-"} />
                              <Field
                                label="Role"
                                value={
                                  u.role ? (
                                    <Badge variant="secondary">{u.role}</Badge>
                                  ) : (
                                    "-"
                                  )
                                }
                              />
                              <Field
                                label="Phone"
                                value={u.businessPhone || "-"}
                              />
                              <Field
                                label="Company"
                                value={u.companyName || "-"}
                              />
                              <Field
                                label="Industry"
                                value={u.industry || "-"}
                              />
                              <Field
                                label="Location"
                                value={u.location || "-"}
                              />
                              <Field
                                label="Created"
                                value={fmtDate(u.createdAt)}
                              />
                              <Field
                                label="Status"
                                value={
                                  <div className="flex flex-wrap items-center gap-2">
                                    {u.verified ? (
                                      <Badge variant="outline">verified</Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        unverified
                                      </Badge>
                                    )}
                                    {u.onboarded ? (
                                      <Badge variant="outline">onboarded</Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        not onboarded
                                      </Badge>
                                    )}
                                  </div>
                                }
                              />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="text-sm font-medium">Social</div>
                              <SocialBlock social={u.socialMedia} />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {!filteredUsers.length ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    No results.
                  </div>
                ) : null}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers" className="mt-4">
          <Card>
            <CardHeader className="space-y-4 border-b">
              <CardTitle>Influencers</CardTitle>
              <ControlsRow
                title="Browse influencers"
                count={filteredInfluencers.length}
                query={influencersQuery}
                onQuery={setInfluencersQuery}
                sortLabel="Sort"
                sortValue={influencersSort}
                onSort={(v) => setInfluencersSort(v as UserSortKey)}
                sortItems={[
                  { value: "created_desc", label: "Newest" },
                  { value: "created_asc", label: "Oldest" },
                  { value: "name_asc", label: "Name (A→Z)" },
                  { value: "name_desc", label: "Name (Z→A)" },
                  { value: "email_asc", label: "Email (A→Z)" },
                  { value: "email_desc", label: "Email (Z→A)" },
                ]}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredInfluencers.map((u) => (
                    <AccordionItem
                      key={u.id}
                      value={u.id}
                      className="mb-2 rounded-lg border border-border px-2 last:mb-0 border-b-0"
                    >
                      <AccordionTrigger className="px-2 -mx-2 rounded-lg hover:bg-muted/60 hover:no-underline data-[state=open]:bg-muted/60">
                        <div className="flex flex-1 items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage
                                src={u.image ?? undefined}
                                alt={u.name || u.email || "Influencer"}
                              />
                              <AvatarFallback>
                                {initials(u.name, u.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {u.name || u.email || u.id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {u.email || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {u.verified ? (
                              <Badge variant="secondary">verified</Badge>
                            ) : null}
                            {u.onboarded ? (
                              <Badge variant="outline">onboarded</Badge>
                            ) : null}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2 pb-2">
                          <div className="rounded-md bg-muted/30 p-4 space-y-4">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {u.name || u.email || u.id}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                ID: {u.id}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <Field label="Email" value={u.email || "-"} />
                              <Field
                                label="Phone"
                                value={u.businessPhone || "-"}
                              />
                              <Field
                                label="Location"
                                value={u.location || "-"}
                              />
                              <Field
                                label="Created"
                                value={fmtDate(u.createdAt)}
                              />
                              <Field
                                label="Status"
                                value={
                                  <div className="flex flex-wrap items-center gap-2">
                                    {u.verified ? (
                                      <Badge variant="outline">verified</Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        unverified
                                      </Badge>
                                    )}
                                    {u.onboarded ? (
                                      <Badge variant="outline">onboarded</Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        not onboarded
                                      </Badge>
                                    )}
                                  </div>
                                }
                              />
                            </div>

                            <Separator />
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Social</div>
                              <SocialBlock social={u.socialMedia} />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {!filteredInfluencers.length ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    No results.
                  </div>
                ) : null}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="mt-4">
          <Card>
            <CardHeader className="space-y-4 border-b">
              <CardTitle>Businesses</CardTitle>
              <ControlsRow
                title="Browse businesses"
                count={filteredOwners.length}
                query={ownersQuery}
                onQuery={setOwnersQuery}
                sortLabel="Sort"
                sortValue={ownersSort}
                onSort={(v) => setOwnersSort(v as OwnerSortKey)}
                sortItems={[
                  { value: "jobs_desc", label: "Most jobs" },
                  { value: "jobs_asc", label: "Fewest jobs" },
                  { value: "company_asc", label: "Company (A→Z)" },
                  { value: "company_desc", label: "Company (Z→A)" },
                  { value: "created_desc", label: "Newest" },
                  { value: "created_asc", label: "Oldest" },
                ]}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredOwners.map((o) => (
                    <AccordionItem
                      key={o.id}
                      value={o.id}
                      className="mb-2 rounded-lg border border-border px-2 last:mb-0 border-b-0"
                    >
                      <AccordionTrigger className="px-2 -mx-2 rounded-lg hover:bg-muted/60 hover:no-underline data-[state=open]:bg-muted/60">
                        <div className="flex flex-1 items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage
                                src={o.image ?? undefined}
                                alt={
                                  o.companyName ||
                                  o.name ||
                                  o.email ||
                                  "Business"
                                }
                              />
                              <AvatarFallback>
                                {initials(o.companyName || o.name, o.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {o.companyName || o.name || o.email || o.id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {o.email || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Badge variant="secondary" className="rounded-full">
                              jobs: {o.jobs.length}
                            </Badge>
                            {o.businessVerified ? (
                              <Badge variant="outline">verified</Badge>
                            ) : null}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 px-2">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Contact:
                              </span>{" "}
                              {o.email || "-"}
                              {o.businessPhone ? ` • ${o.businessPhone}` : ""}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Location:
                              </span>{" "}
                              {o.location || "-"}
                            </div>
                            <div>
                              <div className="text-sm font-medium">Social</div>
                              <SocialBlock social={o.socialMedia} />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Listed Jobs
                            </div>
                            <div className="space-y-2">
                              {o.jobs.map((j) => (
                                <Card key={j.id}>
                                  <CardContent className="py-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="font-medium">
                                        {j.title}
                                      </div>
                                      {j.status ? (
                                        <Badge variant="outline">
                                          {j.status}
                                        </Badge>
                                      ) : null}
                                      <Badge variant="secondary">
                                        {fmtMoney(j.price)}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      proposals: {j.proposals.length} •
                                      contracts: {j.contracts.length}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {!o.jobs.length ? (
                                <div className="text-sm text-muted-foreground">
                                  No jobs.
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {!filteredOwners.length ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    No results.
                  </div>
                ) : null}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader className="space-y-4 border-b">
              <CardTitle>Jobs</CardTitle>
              <ControlsRow
                title="Browse jobs"
                count={filteredJobs.length}
                query={jobsQuery}
                onQuery={setJobsQuery}
                sortLabel="Sort"
                sortValue={jobsSort}
                onSort={(v) => setJobsSort(v as JobSortKey)}
                sortItems={[
                  { value: "created_desc", label: "Newest" },
                  { value: "created_asc", label: "Oldest" },
                  { value: "price_desc", label: "Price (high→low)" },
                  { value: "price_asc", label: "Price (low→high)" },
                  { value: "title_asc", label: "Title (A→Z)" },
                  { value: "title_desc", label: "Title (Z→A)" },
                  { value: "proposals_desc", label: "Most proposals" },
                  { value: "contracts_desc", label: "Most contracts" },
                ]}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredJobs.map((j) => (
                    <AccordionItem
                      key={j.id}
                      value={j.id}
                      className="mb-2 rounded-lg border border-border px-2 last:mb-0 border-b-0"
                    >
                      <AccordionTrigger className="px-2 -mx-2 rounded-lg hover:bg-muted/60 hover:no-underline data-[state=open]:bg-muted/60">
                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {j.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {j.postedBy?.companyName ||
                                j.postedBy?.name ||
                                j.postedBy?.email ||
                                "-"}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                            {j.status ? (
                              <Badge variant="outline">{j.status}</Badge>
                            ) : null}
                            <Badge variant="secondary">
                              {fmtMoney(j.price)}
                            </Badge>
                            <Badge variant="secondary" className="rounded-full">
                              proposals: {j.proposals.length}
                            </Badge>
                            <Badge variant="secondary" className="rounded-full">
                              contracts: {j.contracts.length}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 px-2">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Posted by:
                              </span>{" "}
                              {j.postedBy?.companyName ||
                                j.postedBy?.name ||
                                j.postedBy?.email ||
                                "-"}
                              {j.postedBy?.email
                                ? ` (${j.postedBy.email})`
                                : ""}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Created:
                              </span>{" "}
                              {fmtDate(j.createdAt)}
                            </div>
                            {j.description ? (
                              <div className="text-sm text-muted-foreground">
                                {j.description}
                              </div>
                            ) : null}
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="text-sm font-medium">Proposals</div>
                            <div className="space-y-2">
                              {j.proposals.map((p) => (
                                <Card key={p.id}>
                                  <CardContent className="py-4 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="font-medium">
                                        {p.influencer?.name ||
                                          p.influencer?.email ||
                                          p.influencer?.id ||
                                          "Influencer"}
                                      </div>
                                      {p.status ? (
                                        <Badge variant="outline">
                                          {p.status}
                                        </Badge>
                                      ) : null}
                                      <span className="text-sm text-muted-foreground">
                                        {fmtDate(p.createdAt)}
                                      </span>
                                    </div>
                                    {p.influencer?.email ? (
                                      <div className="text-sm text-muted-foreground">
                                        contact: {p.influencer.email}
                                        {p.influencer.businessPhone
                                          ? ` • ${p.influencer.businessPhone}`
                                          : ""}
                                      </div>
                                    ) : null}
                                    {p.message ? (
                                      <div className="text-sm">{p.message}</div>
                                    ) : null}
                                  </CardContent>
                                </Card>
                              ))}
                              {!j.proposals.length ? (
                                <div className="text-sm text-muted-foreground">
                                  No proposals.
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="text-sm font-medium">Contracts</div>
                            <div className="space-y-2">
                              {j.contracts.map((c) => (
                                <Card key={c.id}>
                                  <CardContent className="py-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="font-medium">{c.id}</div>
                                      {c.status ? (
                                        <Badge variant="outline">
                                          {c.status}
                                        </Badge>
                                      ) : null}
                                      <Badge variant="secondary">
                                        {fmtMoney(c.price)}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        deadline: {fmtDate(c.deadline)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      sender: {c.senderInfluencer?.email || "-"}{" "}
                                      • receiver:{" "}
                                      {c.receiverInfluencer?.email || "-"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      influencerConfirmed:{" "}
                                      {String(!!c.influencerConfirmed)} •
                                      ownerConfirmed:{" "}
                                      {String(!!c.ownerConfirmed)}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {!j.contracts.length ? (
                                <div className="text-sm text-muted-foreground">
                                  No contracts.
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {!filteredJobs.length ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    No results.
                  </div>
                ) : null}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isAdminDialogOpen}
        onOpenChange={(open) => {
          if (!open && dialogIsBusy) return;
          setIsAdminDialogOpen(open);
          if (!open) setAdminDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adminDialog?.action === "ban"
                ? "Ban user"
                : adminDialog?.action === "unban"
                  ? "Unban user"
                  : "Remove user"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {adminDialog?.action === "ban"
                ? "Provide a reason and a ban duration in seconds."
                : adminDialog?.action === "unban"
                  ? "This will remove the ban for this user."
                  : "This action cannot be undone."}
              {adminDialog?.user?.email ? (
                <span className="block mt-2">
                  User:{" "}
                  <span className="font-medium">{adminDialog.user.email}</span>
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {adminDialog?.action === "ban" ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ban-reason">Reason</Label>
                <Input
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Spamming"
                  disabled={dialogIsBusy}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ban-expires">Duration (seconds)</Label>
                <Input
                  id="ban-expires"
                  inputMode="numeric"
                  type="number"
                  min={1}
                  step={1}
                  value={banExpiresInSeconds}
                  onChange={(e) => setBanExpiresInSeconds(e.target.value)}
                  placeholder={String(60 * 60 * 24 * 7)}
                  disabled={dialogIsBusy}
                />
                <div className="text-xs text-muted-foreground">
                  Example: 3600 (1 hour), 86400 (1 day), 604800 (7 days)
                </div>
              </div>
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogIsBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!adminDialog || dialogIsBusy}
              onClick={(e) => {
                e.preventDefault();
                void confirmDialogAction();
              }}
              variant={
                adminDialog?.action === "remove" ? "destructive" : "default"
              }
            >
              {dialogIsBusy
                ? "Working…"
                : adminDialog?.action === "ban"
                  ? "Ban"
                  : adminDialog?.action === "unban"
                    ? "Unban"
                    : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
