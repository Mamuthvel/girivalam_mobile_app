import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const SUPPORT_EMAIL = 'chandruvscn143@gmail.com';

const DeleteAccount = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      <Seo
        title="Delete Your Account | MyGirivalam.in"
        description="How to permanently delete your MyGirivalam account and associated data."
        canonical="/delete-account"
      />
      <SiteHeader />
      <div className="w-full max-w-4xl mx-auto flex-1 p-4 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Trash2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-playfair text-3xl font-bold">Delete Your Account</h1>
          </div>
        </div>

        <Card className="border-primary/20 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Girivalam (MyGirivalam.in) — Account &amp; Data Deletion</CardTitle>
            <p className="text-muted-foreground">Developer: Girivalam</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <p>
              You can permanently delete your Girivalam account and the data associated with it at any time.
              There are two ways to do this.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3">Option 1 — Delete from within the app</h2>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>Open the <strong>Girivalam</strong> app and sign in.</li>
                <li>Go to <strong>Profile</strong> → <strong>Settings</strong>.</li>
                <li>Tap <strong>Delete account</strong> and confirm.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Option 2 — Request deletion by email</h2>
              <p>
                Send an email from the address linked to your account to{' '}
                <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Girivalam%20account`}>
                  {SUPPORT_EMAIL}
                </a>{' '}
                with the subject <strong>“Delete my Girivalam account”</strong>. We will verify and process
                your request within <strong>30 days</strong> and confirm by email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What data is deleted</h2>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Your account and profile (name, email/phone)</li>
                <li>Saved locations and your Girivalam journey history</li>
                <li>Group memberships and in-app messages you sent</li>
                <li>Any location data associated with your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What may be retained</h2>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  Records we are legally required to keep (e.g. donation/transaction records), retained only
                  for the period required by law.
                </li>
                <li>Anonymised, aggregated analytics that can no longer identify you.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p>
                Questions? Contact us at{' '}
                <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-center text-muted-foreground">
                We respect your right to control your data. Om Namah Shivaya.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
};

export default DeleteAccount;
