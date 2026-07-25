import { BackToTop } from "@/components/layout/back-to-top";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { getSettings } from "@/lib/api/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }

  return (
    <>
      <SiteHeader />
      <EmailVerificationBanner />
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
      <BackToTop />
    </>
  );
}
