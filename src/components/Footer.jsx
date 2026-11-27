import Link from "next/link";

import BackToTop from "@/components/feedback/BackToTop";

import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Heart,
  ArrowRight,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Find Vendors", href: "/services" },
    { name: "Categories", href: "/#categories" },
    { name: "How It Works", href: "/#how-it-works" },
  ];

  const services = [
    {
      name: "Photography & Videography",
      href: "/services?category=photography-videography",
    },
    {
      name: "Catering Services",
      href: "/services?category=catering-services",
    },
    {
      name: "Wedding Venues",
      href: "/services?category=wedding-venues",
    },
    {
      name: "Decoration & Florist",
      href: "/services?category=decoration-florist",
    },
  ];

  const socials = [
    { name: "Facebook", href: "https://facebook.com" },
    { name: "Instagram", href: "https://instagram.com" },
    { name: "LinkedIn", href: "https://linkedin.com" },
  ];

  const currentYear = CURRENT_YEAR;

  return (
    <footer className="relative overflow-hidden bg-[#080910] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-rose-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="relative -top-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#21131f] via-[#17121c] to-[#11121b] p-8 shadow-2xl shadow-black/20 md:p-12">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-medium text-rose-300">
                <Sparkles size={14} />
                Make Every Moment Special
              </div>

              <h2 className="text-2xl font-bold leading-tight md:text-4xl">
                Your dream wedding
                <br />
                starts with{" "}
                <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                  WedPlan.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-400">
                Discover amazing vendors and make your special day truly
                unforgettable.
              </p>
            </div>

            <Link
              href="/services"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-rose-500/40"
            >
              Explore Services
              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </div>

        {/* Main Footer */}
        <div className="grid gap-12 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-16">
          {/* Brand Column */}
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25 transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                
                <Heart size={23} fill="white" />
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                Wed<span className="text-rose-400">Plan</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-gray-400">
              Planning your wedding should be as beautiful as the day itself.
              Find trusted vendors and create unforgettable memories with
              WedPlan.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/40 hover:bg-rose-500 hover:text-white"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-7 text-base font-bold tracking-wide text-white">
              Quick Links
              <span className="mt-3 block h-1 w-9 rounded-full bg-gradient-to-r from-rose-500 to-pink-400" />
            </h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex w-fit items-center gap-2 text-sm text-gray-400 transition-colors hover:text-rose-400"
                  >
                    <ArrowRight
                      size={14}
                      className="text-rose-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-7 text-base font-bold tracking-wide text-white">
              Our Services
              <span className="mt-3 block h-1 w-9 rounded-full bg-gradient-to-r from-rose-500 to-pink-400" />
            </h3>

            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="group flex w-fit items-center gap-2 text-sm text-gray-400 transition-colors hover:text-rose-400"
                  >
                    <ArrowRight
                      size={14}
                      className="text-rose-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                    />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-7 text-base font-bold tracking-wide text-white">
              Contact Us
              <span className="mt-3 block h-1 w-9 rounded-full bg-gradient-to-r from-rose-500 to-pink-400" />
            </h3>

            <div className="space-y-5">
              <a
                href="mailto:shafiq.tsc@gmail.com"
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/10 text-rose-400 transition group-hover:bg-rose-500 group-hover:text-white">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="mt-1 text-sm text-gray-300 transition group-hover:text-rose-400">
                    shafiq.tsc@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+8801712222143"
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/10 text-rose-400 transition group-hover:bg-rose-500 group-hover:text-white">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="mt-1 text-sm text-gray-300 transition group-hover:text-rose-400">
                    +880 1712-222143
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/10 text-rose-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="mt-1 text-sm text-gray-300">Jhenaidah, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-5 py-7 text-center md:flex-row">
          <p className="text-sm text-gray-500">
            © {currentYear}{" "}
            <span className="font-semibold text-gray-300">WedPlan</span>. All
            rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            Made with
            <Heart size={14} className="fill-rose-500 text-rose-500" />
            for beautiful moments.
          </p>

          <BackToTop />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
