import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const SUPPORT_EMAIL = 'chandruvscn143@gmail.com';

const ChildSafety = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      <Seo
        title="Child Safety Standards | MyGirivalam.in"
        description="Girivalam's standards against child sexual abuse and exploitation (CSAE), and how to report concerns."
        canonical="/child-safety"
      />
      <SiteHeader />
      <div className="w-full max-w-4xl mx-auto flex-1 p-4 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-playfair text-3xl font-bold">Child Safety Standards</h1>
          </div>
        </div>

        <Card className="border-primary/20 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Girivalam — Standards Against Child Sexual Abuse &amp; Exploitation (CSAE)</CardTitle>
            <p className="text-muted-foreground">Last updated: July 31, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Our commitment</h2>
              <p>
                Girivalam has a zero-tolerance policy towards child sexual abuse and exploitation (CSAE),
                including child sexual abuse material (CSAM). We are committed to keeping our community safe
                and to preventing the use of our app to create, store, or share such material.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Prohibited conduct</h2>
              <p>The following are strictly prohibited on Girivalam:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Any content that sexualises, exploits, or endangers children.</li>
                <li>Grooming, solicitation, or predatory behaviour towards minors.</li>
                <li>Sharing, requesting, or linking to CSAM in chats, groups, or any other feature.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How to report a concern</h2>
              <p>
                Users can report child safety concerns directly in the app using the <strong>Report</strong>
                option available on messages and user profiles, or by emailing us at{' '}
                <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}?subject=Child%20Safety%20Report`}>
                  {SUPPORT_EMAIL}
                </a>.
                Reports are reviewed promptly and offending content and accounts are removed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. How we respond</h2>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>We review every report and remove violating content and accounts.</li>
                <li>
                  We report confirmed CSAE/CSAM to the relevant authorities, including the National Center for
                  Missing &amp; Exploited Children (NCMEC) and/or applicable regional and national authorities in India.
                </li>
                <li>We preserve relevant evidence as required by law and cooperate with law-enforcement requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Compliance</h2>
              <p>
                Girivalam complies with applicable child-safety laws and Google Play's Child Safety Standards
                policy. We regularly review these standards to keep our community safe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
              <p>
                Point of contact for child-safety matters:{' '}
                <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
};

export default ChildSafety;
