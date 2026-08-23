import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const EFFECTIVE_DATE = "August 23, 2026";
const CONTACT_EMAIL = "jslucas1@msn.com";

export const metadata = {
  title: "Privacy Policy - Swami",
  description: "Privacy Policy for Swami",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Effective {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Swami (&quot;Swami,&quot; &quot;we,&quot; &quot;us&quot;) is a free college football pick&apos;em game played among
                a private group of friends using a virtual, play-money balance. No real money is
                collected, wagered, or paid out through the app. This policy explains what
                information we collect, how it&apos;s used, and who it&apos;s shared with.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>Account information</strong> — name, email address, and profile
                    picture, provided through our authentication provider (Clerk) when you sign
                    in, including via Facebook Login if you choose that option.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>Profile details</strong> — an optional nickname and favorite team you
                    can set yourself.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>Gameplay data</strong> — the leagues you join, the picks/wagers you
                    place using your virtual balance, and your resulting standings and history.
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                We do not collect payment card numbers, bank details, or any other real-money
                financial information, and we do not use tracking pixels or advertising cookies.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">To create and secure your account, and identify you within your league(s)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">To record your picks and calculate balances, standings, and results</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">To send you occasional email reminders about upcoming picks (via Resend)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                We rely on a small number of service providers to run Swami. We do not sell your
                information to anyone, and we do not share it for advertising purposes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>Clerk</strong> — handles sign-in and authentication, including
                    Facebook Login if you use it. Clerk processes your name, email, and profile
                    picture on our behalf.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>Resend</strong> — sends pick reminder emails to the address on your
                    account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>CollegeFootballData.com</strong> — supplies public game schedules and
                    scores; no personal information is sent to this service.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Data Retention &amp; Your Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                We keep account and gameplay data for as long as your account is active so that
                league history and standings remain accurate. You can update your profile
                information (name, nickname, favorite team) at any time from your Profile page.
                To request that your account and associated data be deleted, contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 dark:text-blue-400 underline">
                  {CONTACT_EMAIL}
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Children&apos;s Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Swami is not directed to children, and we do not knowingly collect information
                from anyone under 13 years old.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                If this policy changes, we&apos;ll update the effective date at the top of this
                page.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Questions about this policy or your data? Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 dark:text-blue-400 underline">
                  {CONTACT_EMAIL}
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
