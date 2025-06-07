import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) return redirect("/sign-in");

    if (session.user.role === "ADMIN") return redirect("/admin/dashboard");
    if (session.user.role === "DRIVER") return redirect("/driver/home");

    return redirect("/onboarding");
}
