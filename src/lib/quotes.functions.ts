import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { quoteRequestSchema, isStaff } from "./quote-request";

export const submitQuote = createServerFn({ method: "POST" })
  .validator(quoteRequestSchema)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("quote_requests")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error("Your request could not be saved. Please try again.");
    return row;
  });

export const getStaffInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError) throw new Error("Unable to check staff access.");
    if (!isStaff(roles ?? [])) throw new Error("Staff access required");
    const { data: requests, error } = await context.supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Unable to load quote requests.");
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name,avatar_url")
      .eq("id", context.userId)
      .single();
    return { approved: true, requests: requests ?? [], profile };
  });
