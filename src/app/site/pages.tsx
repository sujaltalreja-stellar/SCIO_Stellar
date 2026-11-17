"use client";

/* Public marketing subpages. Each page = SiteLayout + PageHero + the sections that used to live on the single homepage. */
import React from "react";
import SiteLayout from "../../components/site/SiteLayout";
import { useSite } from "../../components/site/SiteContext";
import { ConnectBand, NextPages, PageHero, PrimaryButton, SecondaryButton } from "../../components/site/blocks";
import SolutionSection from "../../components/landing/sections/SolutionSection";
import HowItWorksSection from "../../components/landing/sections/HowItWorksSection";
import CapabilitiesSection from "../../components/landing/sections/CapabilitiesSection";
import ControlTowerSection from "../../components/landing/sections/ControlTowerSection";
import IntegrationsSection from "../../components/landing/sections/IntegrationsSection";
import IndustriesSection from "../../components/landing/sections/IndustriesSection";
import GallerySection from "../../components/landing/sections/GallerySection";
import ProblemSection from "../../components/landing/sections/ProblemSection";
import WhyScioSection from "../../components/landing/sections/WhyScioSection";
import BetaCohortSection from "../../components/landing/sections/BetaCohortSection";
import FaqSection from "../../components/landing/sections/FaqSection";

function TalkButton({ label = "Talk to our team" }: { label?: string }) {
  const { openDemo } = useSite();
  return <PrimaryButton onClick={openDemo}>{label}</PrimaryButton>;
}

function BetaButton() {
  const { openBeta } = useSite();
  return <PrimaryButton onClick={openBeta}>Apply for the beta cohort</PrimaryButton>;
}

export function PlatformPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Platform" }]}
        eyebrow="How SCIO works"
        title="One operating layer from sensor to work order"
        subtitle="SCIO connects your machines, SCADA and ERP, understands how your assets relate, predicts what will fail, and acts on it in the systems your teams already use."
        image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=75"
        actions={
          <>
            <TalkButton />
            <SecondaryButton href="/app">Open the live platform</SecondaryButton>
          </>
        }
      />
      <SolutionSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <NextPages
        items={[
          { label: "Control Tower", desc: "See a live multi-sector operations dashboard.", to: "/platform/control-tower" },
          { label: "Integrations", desc: "How SCIO plugs into SCADA, ERP and IoT.", to: "/platform/integrations" },
          { label: "Enterprise questions", desc: "Deployment, security, AI and ROI, answered.", to: "/faq" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

export function ControlTowerPage() {
  return (
    <SiteLayout orbIndustry="maritime">
      <PageHero
        crumbs={[{ label: "Platform", to: "/platform" }, { label: "Control Tower" }]}
        eyebrow="Operations Control Tower"
        title="Every vessel, plant and shipment in one live view"
        subtitle="Readiness, inspections, fuel and safety equipment in a single cockpit, with AI flagging what needs attention first."
        actions={
          <>
            <TalkButton label="Book a walkthrough" />
            <SecondaryButton href="/?launch=1&industry=maritime&tab=dashboard">Launch the live demo</SecondaryButton>
          </>
        }
      />
      <ControlTowerSection />
      <NextPages
        items={[
          { label: "How SCIO works", desc: "Connect, understand, predict, act.", to: "/platform" },
          { label: "Maritime", desc: "How SCIO runs ocean fleets and ports.", to: "/industries/maritime" },
          { label: "Integrations", desc: "Where the Control Tower gets its data.", to: "/platform/integrations" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

export function IntegrationsPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Platform", to: "/platform" }, { label: "Integrations" }]}
        eyebrow="Integrations"
        title="Works with the systems you already run"
        subtitle="40+ industrial protocols and pre-built ERP connectors. SCIO sits between your data sources and your business outcomes, with no rip-and-replace."
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=75"
        actions={<TalkButton />}
      />
      <IntegrationsSection />
      <NextPages
        items={[
          { label: "How SCIO works", desc: "What happens after the data arrives.", to: "/platform" },
          { label: "Why SCIO", desc: "Data sovereignty, security and how we compare.", to: "/why-scio" },
          { label: "Enterprise questions", desc: "Deployment and security details.", to: "/faq" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

export function IndustriesPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Industries" }]}
        eyebrow="Industries"
        title="Built for four of the hardest operations on earth"
        subtitle="Renewable energy, maritime fleets, manufacturing and global logistics. Each has its own physics, regulations and failure modes. SCIO is tuned for all four."
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=75"
        actions={<TalkButton />}
      />
      <IndustriesSection />
      <GallerySection />
      <ConnectBand />
    </SiteLayout>
  );
}

export function WhyScioPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Company" }, { label: "Why SCIO" }]}
        eyebrow="Why SCIO"
        title="Your data already knows what's happening"
        subtitle="Most operations have the signals. They're split across SCADA, spreadsheets and ERP, and nobody sees them in time. SCIO closes that gap."
        actions={<TalkButton />}
      />
      <ProblemSection />
      <WhyScioSection />
      <NextPages
        items={[
          { label: "How SCIO works", desc: "The four-step operating loop.", to: "/platform" },
          { label: "Customers", desc: "Who's running SCIO in production pilots.", to: "/customers" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

export function CustomersPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Customers" }]}
        eyebrow="Private beta cohort"
        title="Running in production with four global operators"
        subtitle="SCIO is deployed in live production pilots under strict NDA across energy, maritime, manufacturing and cold-chain logistics."
        actions={
          <>
            <BetaButton />
            <SecondaryButton to="/resources">Read case studies</SecondaryButton>
          </>
        }
      />
      <BetaCohortSection />
      <NextPages
        items={[
          { label: "Case studies & blogs", desc: "Field notes and results.", to: "/resources" },
          { label: "Industries", desc: "How SCIO works in each sector.", to: "/industries" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

export function FaqPage() {
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Company" }, { label: "Enterprise questions" }]}
        eyebrow="Enterprise questions"
        title="What enterprise teams ask us"
        subtitle="Deployment, security, AI accuracy and ROI. Search or filter below, or ask the SCIO assistant in the corner."
      />
      <FaqSection />
      <ConnectBand />
    </SiteLayout>
  );
}
