"use client";

import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LICENSES = [
  { name: "Next.js", license: "MIT" },
  { name: "React", license: "MIT" },
  { name: "React DOM", license: "MIT" },
  { name: "TypeScript", license: "Apache-2.0" },
  { name: "Tailwind CSS", license: "MIT" },
  { name: "Zustand", license: "MIT" },
  { name: "@tanstack/react-query", license: "MIT" },
  { name: "next-themes", license: "MIT" },
  { name: "framer-motion", license: "MIT" },
  { name: "lucide-react", license: "ISC" },
  { name: "sonner", license: "MIT" },
  { name: "clsx", license: "MIT" },
  { name: "tailwind-merge", license: "MIT" },
  { name: "class-variance-authority", license: "Apache-2.0" },
  { name: "@supabase/supabase-js", license: "MIT" },
  { name: "@supabase/ssr", license: "MIT" },
  { name: "Quill", license: "BSD-3-Clause" },
  { name: "quill-delta-to-html", license: "MIT" },
  { name: "dompurify", license: "Apache-2.0" },
];

/**
 * LicensesSection — the Settings → Open Source Licenses section. Lists the
 * key open source dependencies used by the web application (the complete list
 * with license texts lives in `package.json` and each package's own LICENSE).
 */
export function LicensesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Open Source Licenses
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          This application is built with the following open source software.
          The full dependency list and license texts are available in the
          project repository.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="size-4 text-primary" aria-hidden />
            Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {LICENSES.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {item.license}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
