import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import DisclaimerBar from "@/components/marketing/DisclaimerBar";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <Nav isAdmin={isAdmin} />
      <main>{children}</main>
      <DisclaimerBar />
      <Footer isAdmin={isAdmin} />
    </>
  );
}
