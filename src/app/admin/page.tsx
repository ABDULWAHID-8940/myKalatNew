import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin-overview";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth");
  if (session.user.role !== "admin") redirect("/");

  const overview = await getAdminOverview();

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8 space-y-6">
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
            <div className="text-2xl font-semibold">{overview.totals.users}</div>
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
            <CardTitle className="text-sm text-muted-foreground">Jobs</CardTitle>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="owners">Business Owners</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {overview.users.map((u) => (
                    <AccordionItem key={u.id} value={u.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {u.name || u.email || u.id}
                          </span>
                          {u.role ? (
                            <Badge variant="secondary">{u.role}</Badge>
                          ) : null}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Email:</span>{" "}
                            {u.email || "-"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Phone:
                            </span>{" "}
                            {u.businessPhone || "-"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Company:
                            </span>{" "}
                            {u.companyName || "-"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Location:
                            </span>{" "}
                            {u.location || "-"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Created:
                            </span>{" "}
                            {fmtDate(u.createdAt)}
                          </div>
                          <Separator />
                          <div>
                            <div className="text-sm font-medium">Social</div>
                            <SocialBlock social={u.socialMedia} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {overview.businessOwners.map((o) => (
                    <AccordionItem key={o.id} value={o.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {o.companyName || o.name || o.email || o.id}
                          </span>
                          <Badge variant="secondary">jobs: {o.jobs.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
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
                            <div className="text-sm font-medium">Listed Jobs</div>
                            <div className="space-y-2">
                              {o.jobs.map((j) => (
                                <Card key={j.id}>
                                  <CardContent className="py-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="font-medium">{j.title}</div>
                                      {j.status ? (
                                        <Badge variant="outline">{j.status}</Badge>
                                      ) : null}
                                      <Badge variant="secondary">
                                        {fmtMoney(j.price)}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      proposals: {j.proposals.length} • contracts:{" "}
                                      {j.contracts.length}
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
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {overview.jobs.map((j) => (
                    <AccordionItem key={j.id} value={j.id}>
                      <AccordionTrigger>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{j.title}</span>
                          {j.status ? (
                            <Badge variant="outline">{j.status}</Badge>
                          ) : null}
                          <Badge variant="secondary">{fmtMoney(j.price)}</Badge>
                          <Badge variant="secondary">
                            proposals: {j.proposals.length}
                          </Badge>
                          <Badge variant="secondary">
                            contracts: {j.contracts.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Posted by:</span>{" "}
                              {j.postedBy?.companyName ||
                                j.postedBy?.name ||
                                j.postedBy?.email ||
                                "-"}
                              {j.postedBy?.email ? ` (${j.postedBy.email})` : ""}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Created:</span>{" "}
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
                                        <Badge variant="outline">{p.status}</Badge>
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
                                        <Badge variant="outline">{c.status}</Badge>
                                      ) : null}
                                      <Badge variant="secondary">
                                        {fmtMoney(c.price)}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        deadline: {fmtDate(c.deadline)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      sender: {c.senderInfluencer?.email || "-"} •
                                      receiver: {c.receiverInfluencer?.email || "-"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      influencerConfirmed: {String(
                                        !!c.influencerConfirmed,
                                      )}{" "}
                                      • ownerConfirmed: {String(!!c.ownerConfirmed)}
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
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
