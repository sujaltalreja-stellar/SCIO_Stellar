"use client";

import React from "react";
import SiteLayout from "../site/SiteLayout";
import HomePage from "./HomePage";

/** The public homepage at "/", loaded without the platform dashboards (see AppRouter). */
export default function HomeRoutePage() {
  return (
    <SiteLayout>
      <HomePage />
    </SiteLayout>
  );
}
