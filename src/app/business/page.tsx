import Footer from "@/components/footer";
import InfluencerSection from "@/components/influencers";
import JobPostingForm from "@/components/jobPostingForm";
import Welcome from "@/components/wlcome";
import { auth } from "@/lib/auth";
import {redirect} from "next/navigation";
import { headers } from "next/headers";
export default async function Home() {
const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "business") {
    redirect("/influencer");
  }

  return (
    <div className=" mx-auto ">
      <Welcome />
      <h2 className="md:text-3xl text-2xl font-bold mb-4 text-center mt-10 px-5">
        Post Your Marketing Job
      </h2>
      <p className="text-gray-600 text-center mb-1 px-5">
        Fill out the form below to find the perfect marketers and influencers
        for your business needs
      </p>
      <JobPostingForm />
      <InfluencerSection />
      <Footer />
    </div>
  );
}
