import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  BarChart3,
  Cloud,
  CheckCircle2,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-void-900 text-slate-900 dark:text-void-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-void-900/80 backdrop-blur-md border-b border-slate-200 dark:border-void-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-solar-500 animate-glow" />
              <div className="absolute inset-[-6px] rounded-full border border-dashed border-solar-500/30 animate-spin-slow" />
            </div>
            <div className="font-display text-2xl font-extrabold text-solar-600 dark:text-solar-400 tracking-[3px]">
              HELIO
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-solar-500 hover:bg-solar-600 text-white dark:text-void-900 font-display font-bold px-6 py-2.5 rounded-lg transition-all hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-solar-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-solar-400 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-8">
            <div className="inline-block">
              <div className="bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/30 rounded-full px-4 py-2 text-solar-600 dark:text-solar-400 text-sm font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-solar-500 animate-pulse"></span>
                Power Your Solar Future
              </div>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
              Real-Time Solar Grid <br />
              <span className="bg-gradient-to-r from-solar-500 via-solar-600 to-solar-700 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-void-300 max-w-2xl mx-auto leading-relaxed">
              Monitor your solar installation with unprecedented precision.
              Track generation, revenue, and system health in real-time with
              AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/login")}
                className="group relative inline-flex items-center justify-center gap-3 bg-solar-500 hover:bg-solar-600 text-white dark:text-void-900 px-8 py-4 rounded-xl font-display font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-solar-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="relative z-10 w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-3 bg-slate-200 dark:bg-void-800 hover:bg-slate-300 dark:hover:bg-void-700 text-slate-900 dark:text-white px-8 py-4 rounded-xl font-display font-bold transition-all">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mt-20 rounded-3xl overflow-hidden border border-slate-300 dark:border-void-700 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-slate-200 dark:from-void-800 to-slate-300 dark:to-void-700 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto text-solar-500 mb-4 opacity-20" />
                <p className="text-slate-600 dark:text-void-400 font-mono text-sm">
                  Dashboard Preview Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-void-800/50 relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-void-300 max-w-2xl mx-auto">
              Everything you need to optimize your solar investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                label: "Live Monitoring",
                desc: "15-minute granular power data",
              },
              {
                icon: TrendingUp,
                label: "Revenue Tracking",
                desc: "Net metering settlements",
              },
              {
                icon: BarChart3,
                label: "Analytics",
                desc: "Export history & trends",
              },
              {
                icon: Cloud,
                label: "AI Forecasts",
                desc: "Generation predictions",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-slate-50 dark:bg-void-900 border border-slate-200 dark:border-void-700 rounded-2xl hover:border-solar-500/30 hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-solar-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-xl font-bold mb-2">
                  {feature.label}
                </h3>
                <p className="text-slate-600 dark:text-void-300 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-4xl font-extrabold mb-16 text-center">
            Why Choose HELIO?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  title: "Maximize Returns",
                  desc: "Optimize tariff timing and export scheduling",
                },
                {
                  title: "Real-Time Alerts",
                  desc: "Instant notifications for faults and maintenance",
                },
                {
                  title: "Predictive AI",
                  desc: "Forecast generation based on weather patterns",
                },
                {
                  title: "Easy Integration",
                  desc: "Works with most inverters and monitoring devices",
                },
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-energy-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 dark:text-void-300">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-solar-500/20 to-solar-600/20 rounded-2xl p-8 border border-solar-500/30">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-void-900 rounded-xl p-6 border border-slate-200 dark:border-void-700">
                    <div className="text-sm text-slate-600 dark:text-void-400 mb-2">
                      Current Output
                    </div>
                    <div className="text-4xl font-display font-bold text-solar-600 dark:text-solar-400">
                      47.3 kW
                    </div>
                    <div className="text-xs text-slate-600 dark:text-void-400 mt-2">
                      ↑ 12% from last hour
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-void-900 rounded-xl p-6 border border-slate-200 dark:border-void-700">
                      <div className="text-sm text-slate-600 dark:text-void-400 mb-2">
                        Today's Revenue
                      </div>
                      <div className="text-2xl font-display font-bold text-energy-green">
                        ₹2,840
                      </div>
                    </div>
                    <div className="bg-white dark:bg-void-900 rounded-xl p-6 border border-slate-200 dark:border-void-700">
                      <div className="text-sm text-slate-600 dark:text-void-400 mb-2">
                        Grid Health
                      </div>
                      <div className="text-2xl font-display font-bold text-energy-blue">
                        94.2%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-solar-500 via-solar-600 to-solar-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold mb-6">
            Ready to Optimize Your Solar Investment?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join 1000+ solar installations making smarter decisions with HELIO
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-solar-600 font-display font-bold px-10 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-void-800 border-t border-slate-200 dark:border-void-700 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-solar-500"></div>
                <span className="font-display font-bold text-lg">HELIO</span>
              </div>
              <p className="text-slate-600 dark:text-void-300 text-sm">
                Real-time solar intelligence
              </p>
            </div>
            {[
              { title: "Product", links: ["Dashboard", "Features", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Support", links: ["Help Center", "Contact", "Status"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-slate-600 dark:text-void-300 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-300 dark:border-void-700 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-slate-600 dark:text-void-300 text-sm font-mono">
                © 2026 HELIO Solar. All rights reserved.
              </div>
              <div className="flex gap-6">
                {["Privacy", "Terms", "Cookies"].map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    className="text-slate-600 dark:text-void-300 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
