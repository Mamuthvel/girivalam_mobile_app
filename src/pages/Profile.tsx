import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X } from 'lucide-react';
import logoUrl from "@/assets/newlogo.svg";
import { logger } from "@/lib/logger";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry", "Other"
];

const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "other", country: "Other" }
];

const Profile = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState('');

  const [ageGroup, setAgeGroup] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load existing profile
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setDisplayName(data.display_name || '');
          setEmail(data.email || user.email || '');

          // split country code + mobile stored together if needed
          if (data.mobile_number?.includes("-")) {
            const [cc, mob] = data.mobile_number.split("-");
            setCountryCode(cc);
            setMobile(mob);
          } else {
            setMobile(data.mobile_number || '');
          }

          setAgeGroup(data.age_group || '');
          setBloodGroup(data.blood_group || '');
          setGender(data.gender || '');

          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setPincode(data.pincode || '');
        } else {
          setEmail(user.email || '');
        }

      } catch (error) {
        logger.error('Error loading profile:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  // VALIDATION
  const validateFields = () => {
    if (!mobile.trim()) {
      return "Mobile number is required.";
    }
    if (!/^\d{10}$/.test(mobile)) {
      return "Mobile number must be 10 digits.";
    }
    if (pincode.trim() && !/^\d{6}$/.test(pincode)) {
      return "Pincode must be exactly 6 digits.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateFields();
    if (errorMsg) {
      toast({ title: "Validation Error", description: errorMsg, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName,
        email,
        mobile_number: `${countryCode}-${mobile}`,
        age_group: ageGroup,
        blood_group: bloodGroup,
        gender,
        address,
        city,
        state,
        pincode,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });

      navigate('/');

    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background p-4 relative">

      <Link to="/" className="flex items-center gap-2 mb-4">
        <img src={logoUrl} alt="Arunachala Vibe" className="h-7 sm:h-8 w-auto" loading="eager" />
      </Link>

      <button
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        onClick={() => navigate('/')}
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex items-center justify-center min-h-[85vh]">
        <div className="w-full max-w-3xl">

          <div className="text-center mb-8">
            <h1 className="font-playfair text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Tell us about yourself</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Fill in your details</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email (Read-only)</Label>
                    <Input value={email} readOnly className="bg-gray-100" />
                  </div>

                  {/* <div className="space-y-2">
                    <Label>Country Code</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code} ({item.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number <span className="text-red-600">*</span></Label>
                    <Input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) setMobile(e.target.value);
                      }}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div> */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Mobile Number <span className="text-red-600">*</span></Label>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Country Code */}
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="col-span-1">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.code} ({item.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Mobile Number */}
                      <Input
                        type="tel"
                        className="col-span-2"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) setMobile(e.target.value);
                        }}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>
                  {/* Age Group */}
                  <div className="space-y-2">
                    <Label>Age Group (Optional)</Label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below_18">Below 18</SelectItem>
                        <SelectItem value="18_30">18–30</SelectItem>
                        <SelectItem value="31_50">31–50</SelectItem>
                        <SelectItem value="50_plus">50+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-2">
                    <Label>Blood Group (Optional)</Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender (Optional)</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address (Optional)</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pincode */}
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      value={pincode}
                      maxLength={6}
                      placeholder="6-digit pincode"
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) setPincode(e.target.value);
                      }}
                    />
                  </div>

                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Profile;
