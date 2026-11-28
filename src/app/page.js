import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  CheckCircle2,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";

import Reveal from "@/components/home/Reveal";
import CategoryIcon from "@/components/services/CategoryIcon";
import ServiceCard from "@/components/services/ServiceCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { db } from "@/lib/db";
import {
  SERVICE_CATEGORY_META,
  normalizeCategory,
  serializeService,
} from "@/lib/services";

export const instant = false;

const HERO_IMAGE =
  "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=2200";

const steps = [
  {
    title: "Discover services",
    description:
      "Browse curated photographers, venues, florists, caterers, stylists, and fashion houses.",
    icon: Search,
    href: "/services",
  },
  {
    title: "Compare trusted vendors",
    description:
      "See pricing, location, and vendor details in one place before you reach out.",
    icon: Store,
    href: "/services",
  },
  {
    title: "Plan with confidence",
    description:
      "Keep every shortlisted service and booking detail close to your wedding plan.",
    icon: CalendarHeart,
    href: "/sign-up",
  },
];

const benefits = [
  {
    title: "Approved, active listings",
    description:
      "Only reviewed services reach the marketplace, so every listing is ready for couples to explore.",
    icon: BadgeCheck,
    href: "/services",
  },
  {
    title: "Clear pricing up front",
    description:
      "Compare starting prices, locations, and vendor details without chasing scattered links.",
    icon: Wallet,
    href: "/services",
  },
  {
    title: "A dashboard for every role",
    description:
      "Customers, vendors, and admins each get a focused space with the right tools and permissions.",
    icon: Users,
    href: "/sign-up",
  },
  {
    title: "Secure wedding planning",
    description:
      "Better Auth and server-side role checks keep accounts and protected actions in the right hands.",
    icon: ShieldCheck,
    href: "/sign-in",
  },
];

export default async function Home() {
  await connection();

  let publishedServices = [];
  let servicesError = "";

  try {
    const services = await db
      .collection("services")
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(120)
      .toArray();

    publishedServices = services.map(serializeService);
  } catch (error) {
    console.error("Unable to load home page services:", error);
    servicesError =
      "Featured services are temporarily unavailable. Please try again shortly.";
  }

  const featuredServices = publishedServices.slice(0, 6);

  const categoryCounts = publishedServices.reduce((counts, service) => {
    const category = normalizeCategory(service.category);
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#1c0c15]">
        <Image
          src={HERO_IMAGE}
          alt="Newlywed couple celebrating their wedding day"
          fill
          preload
          unoptimized
          sizes="100vw"
          className="animate-hero-zoom object-cover object-center opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0d1b]/95 via-[#3a1124]/75 to-[#140910]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.28),transparent_55%)]" />

        <div className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />

        <Heart className="pointer-events-none absolute left-[9%] top-[24%] h-6 w-6 text-rose-300/40" />
        <Sparkles className="pointer-events-none absolute right-[12%] top-[20%] h-8 w-8 text-amber-200/60" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:py-32 lg:py-36">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            The wedding marketplace for every detail
          </div>

          <h1 className="animate-fade-up animation-delay-100 mt-7 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your dream wedding,
            <br />
            <span className="bg-gradient-to-r from-rose-200 via-amber-100 to-rose-300 bg-clip-text text-transparent">
              beautifully planned.
            </span>
          </h1>

          <p className="animate-fade-up animation-delay-200 mt-6 max-w-2xl text-base leading-relaxed text-rose-50/85 sm:text-lg">
            Discover handpicked photographers, venues, florists, caterers,
            stylists, and fashion houses — all in one calm, beautiful space.
            From the first idea to the final dance, WedPlan keeps every detail
            close.
          </p>

          <div className="animate-fade-up animation-delay-300 mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/services"
              className={cn(
                buttonVariants(),
                "min-h-12 gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-7 text-sm font-semibold text-white shadow-xl shadow-rose-900/30 hover:from-rose-400 hover:to-pink-400"
              )}
            >
              Explore Wedding Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-12 gap-2 rounded-full border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
              )}
            >
              <Heart className="h-4 w-4" />
              Join WedPlan
            </Link>
          </div>

          <div className="animate-fade-up animation-delay-500 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-rose-50/75 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-300" />
              Verified vendors
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Secure accounts
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Free to explore
            </span>
          </div>

          <div className="animate-fade-up animation-delay-500 mt-12 grid w-full max-w-2xl grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md sm:gap-4 sm:p-4">
            {[
              { value: publishedServices.length, label: "Live services" },
              { value: SERVICE_CATEGORY_META.length, label: "Categories" },
              { value: "1", label: "Planning hub" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-2 py-2 text-center sm:px-4"
              >
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fff8fa] to-transparent" />
      </section>

      {/* Featured services */}
      <section
        id="featured-services"
        className="relative px-4 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-500 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured Wedding Services
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Handpicked vendors for your big day
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
                  Approved, active listings from trusted WedPlan professionals —
                  with photos, pricing, location, and vendor details up front.
                </p>
              </div>

              <Link
                href="/services"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group min-h-11 w-fit gap-2 rounded-full border-rose-200 bg-white px-5 font-semibold text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-50"
                )}
              >
                View all services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          {servicesError ? (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {servicesError}
            </div>
          ) : null}

          {featuredServices.length > 0 ? (
            <Reveal className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
              {featuredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                />
              ))}
            </Reveal>
          ) : (
            <Reveal className="mt-8">
              <div className="rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  New vendor listings are on the way
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Published services will appear here automatically. Admins can
                  add and publish listings from the admin console.
                </p>
                <Link
                  href="/services"
                  className={cn(
                    buttonVariants(),
                    "mt-5 min-h-11 gap-2 rounded-full px-5 font-semibold"
                  )}
                >
                  Browse services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="relative overflow-hidden bg-gradient-to-b from-[#fff8fa] via-white to-[#fff8fa] px-4 py-16 sm:py-20"
      >
        <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-500 shadow-sm">
              <Heart className="h-3.5 w-3.5" />
              Wedding Service Categories
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explore every part of your celebration
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
              Choose a category to see the vendors and services that fit your
              wedding vision.
            </p>
          </Reveal>

          <Reveal className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
            {SERVICE_CATEGORY_META.map((category) => {
              const count = categoryCounts[category.label] || 0;

              return (
                <Link
                  key={category.slug}
                  href={`/services?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-100/40 transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-200/40"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-50 transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200">
                      <CategoryIcon category={category.label} className="h-6 w-6" />
                    </span>

                    <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-rose-500" />
                  </div>

                  <h3 className="relative mt-5 text-lg font-semibold text-slate-900">
                    {category.label}
                  </h3>

                  <p className="relative mt-2 text-sm leading-relaxed text-slate-500">
                    {category.blurb}
                  </p>

                  <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                    {count} {count === 1 ? "service" : "services"}
                  </p>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Why choose WedPlan */}
      <section
        id="why-choose-wedplan"
        className="relative overflow-hidden bg-[#1c0c15] px-4 py-16 sm:py-20"
      >
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Why Choose WedPlan?
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A calmer way to plan the biggest day of your life
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-rose-50/75 sm:text-base">
              Everything you need to discover, compare, and organize wedding
              services — built around trust, clarity, and role-based tools.
            </p>
          </Reveal>

          <Reveal
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            delay={0.1}
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <Link
                  key={benefit.title}
                  href={benefit.href}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-rose-300/30 hover:bg-white/10"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-950/40">
                    <Icon className="h-5 w-5" />
                  </span>

                  <h3 className="mt-4 font-semibold text-white">
                    {benefit.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-rose-50/65">
                    {benefit.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-200 transition group-hover:text-white">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-rose-100 bg-white p-6 shadow-sm shadow-rose-100/40 sm:p-10">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                  <Users className="h-3.5 w-3.5" />
                  How WedPlan works
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  From inspiration to “I do”, in three calm steps
                </h2>
              </div>

              <Link
                href="/sign-up"
                className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
              >
                Create your free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal className="mt-8 grid gap-4 sm:grid-cols-3" delay={0.1}>
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Link
                  key={step.title}
                  href={step.href}
                  className="group relative rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:bg-white hover:shadow-md hover:shadow-rose-100/60"
                >
                  <span className="absolute right-4 top-4 text-4xl font-bold text-rose-100">
                    {index + 1}
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    Continue
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
