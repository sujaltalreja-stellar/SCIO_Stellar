"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ContactHub from "../../components/contact/ContactHub";

export default function ContactPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleLaunchPlatform = (industry: string = "energy", tab: string = "energy-dashboard") => {
    router.push(`/?launch=1&industry=${industry}&tab=${tab}`);
  };

  const handleOpenResources = () => {
    router.push("/?view=resources");
  };

  return (
    <ContactHub
      onBackToHome={handleBackToHome}
      onLaunchPlatform={handleLaunchPlatform}
      onOpenResources={handleOpenResources}
    />
  );
}
