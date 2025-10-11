import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RankingColumn<Row> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: Row, index: number) => ReactNode;
};

export interface RankingTableProps<Row> {
  rows: Row[];
  columns: RankingColumn<Row>[];
  getRowKey?: (row: Row, index: number) => string | number;
  className?: string;
  caption?: ReactNode;
  maxRows?: number;
}

const rankAccentClasses = [
  "bg-main text-main-foreground border-border",
  "bg-secondary-background text-foreground border-border",
  "bg-secondary-background text-foreground border-border",
];

export function RankingTable<Row>({
  rows,
  columns,
  getRowKey,
  className,
  caption,
  maxRows,
}: RankingTableProps<Row>) {
  const displayRows = maxRows ? rows.slice(0, maxRows) : rows;
  return (
    <div
      className={cn(
        "rounded-base border-2 border-border bg-background shadow-shadow overflow-hidden",
        className
      )}>
      {caption ? (
        <div className="border-b-2 border-border bg-secondary-background px-6 py-4 text-sm font-heading uppercase tracking-wide text-foreground">
          {caption}
        </div>
      ) : null}
      <table className="w-full border-collapse">
        <thead className="bg-secondary-background border-b-2 border-border h-12 3xl:h-16 4xl:h-20 5xl:h-24">
          <tr className="text-left text-xs 3xl:text-base 4xl:text-lg 5xl:text-xl font-heading uppercase tracking-[0.15em] text-foreground/80">
            <th className="px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 5xl:px-12 5xl:py-6">Poz.</th>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 5xl:px-12 5xl:py-6",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.headerClassName
                )}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-6 py-8 3xl:px-8 3xl:py-10 4xl:px-10 4xl:py-12 5xl:px-12 5xl:py-14 text-center text-sm 3xl:text-lg 4xl:text-xl 5xl:text-2xl font-base text-foreground"
              >
                Brak wyników do wyświetlenia
              </td>
            </tr>
          ) : (
            displayRows.map((row, index) => {
              const rowKey = getRowKey ? getRowKey(row, index) : index;
              const rank = index + 1;
              const rankAccent =
                rankAccentClasses[index] ?? "bg-background text-foreground border-border";

              return (
                <tr
                  key={rowKey}
                  className="border-b border-border last:border-b-0 odd:bg-background even:bg-secondary-background/30">
                  <td className="px-6 py-4 3xl:px-8 3xl:py-5 4xl:px-10 4xl:py-6 5xl:px-12 5xl:py-8">
                    <span
                      className={cn(
                        "inline-flex min-w-[2.5rem] 3xl:min-w-[3rem] 4xl:min-w-[3.5rem] 5xl:min-w-[4rem] items-center justify-center rounded-full border-2 px-2 py-1 3xl:px-3 3xl:py-1.5 4xl:px-4 4xl:py-2 5xl:px-5 5xl:py-2.5 text-sm 3xl:text-base 4xl:text-lg 5xl:text-xl font-heading",
                        rankAccent
                      )}>
                      #{rank}
                    </span>
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 3xl:px-8 3xl:py-5 4xl:px-10 4xl:py-6 5xl:px-12 5xl:py-8 text-sm 3xl:text-lg 4xl:text-xl 5xl:text-2xl font-base",
                        column.align === "right" && "text-right",
                        column.align === "center" && "text-center",
                        column.cellClassName
                      )}>
                      {column.render
                        ? column.render(row, index)
                        : (row as Record<string, ReactNode>)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
