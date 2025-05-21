"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import z from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(formData: FormData) {
  const schema = z.object({
    customerId: z.string().min(1, { message: "Customer ID is required" }),
    amount: z.coerce
      .number()
      .positive({ message: "Amount must be greater than 0" }),
    status: z.enum(["paid", "pending", "failed"], {
      errorMap: () => ({ message: "Status is required" }),
    }),
  });
  const validatedFields = schema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    /* return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };*/
    throw new Error("Missing Fields. Failed to Create Invoice.");
  }
  const { customerId, amount, status } = validatedFields.data;
  try {
    await sql`
      INSERT INTO invoices
        (customer_id, amount, status, date)
      VALUES
        (${customerId}, ${amount} * 100, ${status}, NOW())
    `;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create invoice.");
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const schema = z.object({
    customerId: z.string().min(1, { message: "Customer ID is required" }),
    amount: z.coerce
      .number()
      .positive({ message: "Amount must be greater than 0" }),
    status: z.enum(["paid", "pending", "failed"], {
      errorMap: () => ({ message: "Status is required" }),
    }),
  });
  const validatedFields = schema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    /*return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };*/
    throw new Error("Missing Fields. Failed to Update Invoice.");
  }
  const { customerId, amount, status } = validatedFields.data;
  console.log("Update Invoice:", { id, customerId, amount, status });
  try {
    await sql`
      UPDATE invoices
      SET
        customer_id = ${customerId},
        amount = ${amount} * 100,
        status = ${status}
      WHERE
        id = ${id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update invoice.");
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string, formData: FormData) {
  try {
    await sql`
      DELETE FROM invoices
      WHERE
        id = ${id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update invoice.");
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
