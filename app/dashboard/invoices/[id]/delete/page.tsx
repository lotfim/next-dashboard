import { fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { DeleteInvoice } from "@/app/ui/invoices/buttons";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;
  const id = param.id;
  const invoice = fetchInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Delete Invoice",
            href: `/dashboard/invoices/${id}/delete/`,
            active: true,
          },
        ]}
      />

      <DeleteInvoice id={id} />
    </main>
  );
}
