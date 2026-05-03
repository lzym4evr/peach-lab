import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolRenderer from "@/components/tools/ToolRenderer";
import { tools } from "@/data/tools";
import { t } from "@/data/messages";

type ToolPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export const dynamicParams = false;

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;

  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    return (
      <main className="min-h-screen bg-[#FFFDFC] text-[#111827]">
        <Header />

        <section className="mx-auto max-w-4xl px-6 py-20">
          <a href="/" className="text-sm font-medium text-[#F28C6F]">
            {t.common.backToHome}
          </a>

          <div className="mt-8 rounded-3xl border border-[#F1E5DF] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">{t.common.toolNotFound}</h1>
            <p className="mt-3 text-gray-600">
              {t.common.toolNotFoundDescription}
            </p>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#111827]">
      <Header />

      <section className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        <a href="/" className="text-sm font-medium text-[#F28C6F]">
          {t.common.backToHome}
        </a>

        <div className="mt-8 rounded-3xl border border-[#F1E5DF] bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0EA] text-4xl">
                {tool.icon}
              </div>

              <p className="text-sm font-medium text-[#F28C6F]">
                {tool.category}
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                {tool.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                {tool.description}
              </p>
            </div>

            <a
              href="/"
              className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-5 py-3 text-center text-sm font-semibold text-[#E6765B] hover:bg-[#FFF0EA]"
            >
              {t.common.viewAllTools}
            </a>
          </div>

          <div className="mt-10">
            <ToolRenderer slug={tool.slug} icon={tool.icon} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}