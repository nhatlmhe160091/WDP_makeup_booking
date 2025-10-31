/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-dynamic";
import "@muahub/styles/style.css";
// import Script from "next/script";
// import AboutUsComponent from "../components/AboutUsComponent";
// import OurFeaturesComponent from "../components/OurFeaturesComponent";
// import OurOfferComponent from "../components/OurOfferComponent";
// import FAQsComponent from "../components/FAQsComponent";
// import OurTeamComponent from "../components/OurTeamComponent";
// import TestimonialComponent from "../components/TestimonialComponent";
import META_DATA from "./metaData";
import UserProfileComponent from "../components/UserProfileComponent";

export const metadata = {
  title: `${META_DATA.TITLE}`,
  description: META_DATA.DESCRIPTION,
  applicationName: META_DATA.APPLICATION_NAME,
  keywords: META_DATA.KEYWORDS,
  robots: META_DATA.ROBOTS,
  openGraph: {
    title: META_DATA.TITLE,
    description: META_DATA.DESCRIPTION,
    images: META_DATA.IMAGE,
    type: "website",
    url: META_DATA.URL
  }
};

export default function ProfilePage() {
  return <UserProfileComponent />;
}
