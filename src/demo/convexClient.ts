import { ConvexReactClient } from "convex/react";

// One Convex client for the SCIO app (same deployment as the rest of the site).
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
