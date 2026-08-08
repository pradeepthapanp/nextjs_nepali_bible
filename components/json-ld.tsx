import type { JsonLdGraph } from "@/lib/json-ld";

/**
 * Renders JSON-LD structured data (server component).
 *
 * `data` may be a single graph or an array of graphs; each becomes its own
 * `<script type="application/ld+json">` block so search engines parse them
 * independently (no duplicate schema types within one page).
 */
export function JsonLd({ data }: { data: JsonLdGraph | JsonLdGraph[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
