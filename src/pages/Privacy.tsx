import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Seo from '@/components/Seo';

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <Seo
        title="Privacy Policy | MyGirivalam.in"
        description="Privacy Policy for MyGirivalam.in — the Tiruvannamalai Girivalam guide with live GPS tracking, temple timings, and Pournami calendar."
        canonical="/privacy"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-playfair text-3xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <Card className="border-primary/20 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Arunachala Vibe - Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: January 31, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Create an account or use our services</li>
                <li>Contact us for support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mt-3">This may include:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Name, email address, phone number</li>
                <li>Location data for Girivalam tracking</li>
                <li>Device information and usage data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Communicate with you about products, services, and promotions</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Location Data</h2>
              <p>
                Arunachala Vibe collects location data to provide Girivalam tracking and navigation features.
                This data is used only for the purpose of enhancing your spiritual journey experience.
                You can control location permissions through your device settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                except as described in this policy. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>With service providers who assist us in operating our services</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>In connection with a business transfer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill
                the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access, update, or delete your personal information</li>
                <li>Object to or restrict certain processing of your information</li>
                <li>Data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage,
                and assist in our marketing efforts. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Third-Party Services</h2>
              <p>
                Our service may contain links to third-party websites or services that are not owned or controlled by us.
                We are not responsible for the privacy practices of these third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect personal information
                from children under 13. If we become aware that we have collected such information, we will take steps
                to delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@arunachalavibe.com
                <br />
                Address: Tiruvannamalai, Tamil Nadu, India
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-center text-muted-foreground">
                Your privacy is important to us. Thank you for trusting Arunachala Vibe with your spiritual journey.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;