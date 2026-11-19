import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error("Unable to load profile");
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return { profile, roles: roles ?? [] };
  });
export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ display_name: z.string().trim().min(1).max(100) }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error("Unable to save profile");
    return { success: true };
  });
export const getAdminAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error || !admin) throw new Error("Administrator access required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) throw new Error("Unable to load accounts");
    const { data: profiles } = await context.supabase.from("profiles").select("*");
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id,role");
    if (rolesError) throw new Error("Unable to load roles");
    return users.users.map((user) => ({
      id: user.id,
      email: user.email ?? "",
      confirmed: !!user.email_confirmed_at,
      created_at: user.created_at,
      display_name: profiles?.find((p) => p.id === user.id)?.display_name ?? "",
      roles: roles?.filter((r) => r.user_id === user.id).map((r) => r.role) ?? [],
    }));
  });
export const grantStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ user_id: z.string().uuid(), role: z.enum(["staff", "admin"]) }))
  .handler(async ({ context, data }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error || !admin) throw new Error("Administrator access required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(
      data.user_id,
    );
    if (targetError || !target.user.email_confirmed_at)
      throw new Error("Account must verify its email first");
    const { error: writeError } = await supabaseAdmin
      .from("user_roles")
      .upsert(data, { onConflict: "user_id,role" });
    if (writeError) throw new Error("Unable to grant access");
    return { success: true };
  });
