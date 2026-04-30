import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchTools from "@/components/SearchTools";
import PopularTools from "@/components/PopularTools";
import CategoryGrid from "@/components/CategoryGrid";
import AllTools from "@/components/AllTools";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#111827]">
      <Header />
      <Hero />
      <SearchTools />
      <PopularTools />
      <CategoryGrid />
      <AllTools />
      <Footer />
    </main>
  );
}