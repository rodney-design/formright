import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import DisclaimerBar from "@/components/marketing/DisclaimerBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <DisclaimerBar />
      <Footer />
    </>
  );
}
