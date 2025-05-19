import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import EditInvoiceForm from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  //params = await params;  
  const id =  params.id;
  
    const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  
  if (!invoice) {
      notFound();
    }
  return (
    <main>
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Invoices', href: '/dashboard/invoices' },
              {
                label: 'Edit Invoice',
                href: `/dashboard/invoices/${id}/edit/`,
                active: true,
              },
            ]}
          />
    
      <EditInvoiceForm invoice={invoice} customers={customers} />
    </main>
  );
}