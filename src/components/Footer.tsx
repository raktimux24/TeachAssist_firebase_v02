"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Home,
  LayoutGrid,
  Info,
  Contact,
  Shield,
  FileText,
  Cookie
} from 'lucide-react';

interface SocialLink {
  name: string;
  href: string;
}

interface FooterLink {
  name: string;
  Icon: React.ElementType;
  href?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: {
    name: string;
    description: string;
  };
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  copyright?: string;
}

const defaultBrand = {
  name: "TeachAssist Pro",
  description: "Empowering CBSE educators with AI-powered teaching tools designed specifically for classes 7-12."
};

const defaultSocialLinks: SocialLink[] = [
  { name: "Facebook", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "LinkedIn", href: "#" }
];

const defaultColumns: FooterColumn[] = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", Icon: Home, href: "#hero" },
      { name: "Features", Icon: LayoutGrid, href: "#features" },
      { name: "How It Works", Icon: Info, href: "#how-it-works" },
      { name: "Testimonials", Icon: FileText, href: "#testimonials" },
      { name: "Pricing", Icon: FileText, href: "#pricing" },
      { name: "FAQ", Icon: FileText, href: "#faq" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "CBSE Curriculum", Icon: FileText, href: "#" },
      { name: "Teacher Resources", Icon: FileText, href: "#" },
      { name: "Blog", Icon: FileText, href: "#" },
      { name: "Support", Icon: Contact, href: "#contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", Icon: Shield, href: "#" },
      { name: "Terms of Service", Icon: FileText, href: "#" },
      { name: "Cookie Policy", Icon: Cookie, href: "#" }
    ]
  }
];

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ 
    className, 
    brand = defaultBrand, 
    socialLinks = defaultSocialLinks, 
    columns = defaultColumns, 
    copyright = `© ${new Date().getFullYear()} TeachAssist Pro. All rights reserved.`, 
    ...props 
  }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn("bg-gray-900 text-gray-300", className)}
        {...props}
      >
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <a href="#" className="text-xl font-semibold text-white">
                {brand.name}
              </a>
              <p className="text-sm text-gray-400 mt-2">
                {brand.description}
              </p>

              <p className="text-sm font-light text-gray-500 mt-4">
                {socialLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <a
                      className="hover:text-white transition-colors"
                      target="_blank"
                      href={link.href}
                      rel="noopener noreferrer"
                    >
                      {link.name}
                    </a>
                    {index < socialLinks.length - 1 && " • "}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="grid grid-cols-2 mt-16 md:grid-cols-3 lg:col-span-8 lg:justify-items-end lg:mt-0">
              {columns.map(({ title, links }) => (
                <div key={title} className="last:mt-12 md:last:mt-0">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {links.map(({ name, Icon, href }) => (
                      <li key={name}>
                        <a
                          href={href || "#"}
                          className="text-sm transition-colors text-gray-400 hover:text-white group flex items-center"
                        >
                          <Icon className="inline h-4 w-4 mr-1.5 transition-colors stroke-gray-400 group-hover:stroke-white" />
                          {name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {copyright && (
            <div className="mt-16 border-t border-gray-800 pt-6">
              <p className="text-xs text-gray-500">{copyright}</p>
            </div>
          )}
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

export default Footer;