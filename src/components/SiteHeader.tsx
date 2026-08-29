import { Navigation } from "@/components/Navigation";

const SiteHeader = () => {
  return (
    <header
      className="fixed left-0 right-0 z-50"
      style={{ top: "var(--app-banner-h, 0px)" }}
    >
      <div className="flex justify-center items-center mx-auto px-4 py-3">
        <Navigation />
      </div>
    </header>
  );
};

export default SiteHeader;
