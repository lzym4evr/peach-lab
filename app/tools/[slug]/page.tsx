import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolRenderer from "@/components/tools/ToolRenderer";
import IconRenderer from "@/components/icons/IconRenderer";
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
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="text-sm font-medium text-[#F28C6F]">
              {t.common.backToHome}
            </a>

            <a href="/" className="text-sm font-medium text-[#E6765B]">
              {t.common.viewAllTools}
            </a>
          </div>

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

      <section className="mx-auto max-w-5xl px-6 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="text-sm font-medium text-[#F28C6F]">
            {t.common.backToHome}
          </a>

          <a href="/" className="text-sm font-medium text-[#E6765B]">
            {t.common.viewAllTools}
          </a>
        </div>

        <div className="mt-6 md:mt-8 md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-10 md:shadow-sm">
          <div className="md:block">
            <div className="flex items-center gap-4 md:block">
              <div className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0EA] text-3xl md:mb-5 md:h-16 md:w-16 md:text-4xl">
                <IconRenderer
                  type="tool"
                  name={tool.slug}
                  fallback={tool.icon}
                  className="h-9 w-9 md:h-10 md:w-10"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#F28C6F]">
                  {tool.category}
                </p>

                <h1 className="mt-1 text-2xl font-bold leading-[1.12] tracking-tight text-[#111827] md:mt-2 md:text-5xl md:leading-tight">
                  {tool.title}
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:mt-4 md:text-base md:leading-7">
              {tool.description}
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            <ToolRenderer slug={tool.slug} icon={tool.icon} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}