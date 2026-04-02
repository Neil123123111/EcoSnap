import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import UploadForm from "../components/UploadForm";
import Navbar from "../components/Navbar";
import HeroVideo from "../components/HeroVideo";

export default function HomePage() {
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newVisibleSteps = new Set(visibleSteps);
        entries.forEach((entry) => {
          const index = Number.parseInt((entry.target as HTMLElement).dataset.step || "0");
          if (entry.isIntersecting) {
            newVisibleSteps.add(index);
          }
        });
        setVisibleSteps(newVisibleSteps);
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div
      className="
        min-h-screen transition-colors duration-300
        bg-gradient-to-br from-green-50 to-white
        dark:from-gray-900 dark:to-gray-800
        text-gray-800 dark:text-gray-100
        relative
      "
    >
      <div className="pt-24">
        <Navbar />

      {/* 🎬 HERO VIDEO (REPLACED OLD HERO) */}
      <HeroVideo onScrollToUpload={scrollToUpload} />

      {/* OVERVIEW SECTION */}
      <section className="relative py-32 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-950 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                Our Story
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 dark:from-blue-400 dark:via-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              About EcoSnap
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              EcoSnap is an AI-powered environmental monitoring platform designed to empower citizens and communities to report and track environmental violations in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* LEFT: Mission Section */}
            <div className="space-y-8">
              <div className="group">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-green-600 dark:group-hover:from-blue-400 dark:group-hover:to-green-400 transition-all duration-500">
                  Our Mission
                </h3>
              </div>
              
              <div className="relative pl-6 border-l-4 border-gradient-to-b from-blue-400 to-green-400 space-y-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We believe every citizen has the right to a clean and healthy environment. EcoSnap leverages artificial intelligence and mobile technology to make environmental monitoring accessible, transparent, and democratic.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  By creating a platform where anyone can document and share environmental violations, we're building a community-driven solution to pollution and environmental degradation.
                </p>
              </div>

              {/* Stats or Highlights */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Transparent</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">AI-Driven</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Accurate</div>
                </div>
              </div>
            </div>

            {/* RIGHT: 3 Feature Cards */}
            <div className="space-y-6">
              {[
                {
                  icon: "🌍",
                  title: "Global Impact",
                  desc: "Connect with environmental advocates worldwide and contribute to global sustainability efforts.",
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  icon: "🤖",
                  title: "AI-Powered",
                  desc: "Advanced machine learning automatically identifies and analyzes environmental violations with precision.",
                  gradient: "from-purple-500 to-purple-600"
                },
                {
                  icon: "🔍",
                  title: "Transparent",
                  desc: "All reports are verified, crowd-sourced, and available for public review to ensure accountability.",
                  gradient: "from-green-500 to-emerald-600"
                }
              ].map((feature) => (
                <div key={feature.title} className="group">
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                    
                    {/* Animated Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Content */}
                    <div className="relative p-8">
                      {/* Icon Circle */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} text-white mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                        <span className="text-3xl">{feature.icon}</span>
                      </div>

                      {/* Title */}
                      <h4 className={`text-xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                        {feature.title}
                      </h4>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.desc}
                      </p>

                      {/* Animated Line */}
                      <div className={`mt-4 h-1 bg-gradient-to-r ${feature.gradient} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 bg-white dark:bg-gray-800 transition">
        <h2 className="text-4xl font-bold text-center mb-16 
                       text-gray-800 dark:text-white">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            {
              title: "Upload Evidence",
              desc: "Snap and upload environmental violations instantly.",
              icon: "📸",
              action: () => navigate("/upload"),
            },
            {
              title: "AI Detection",
              desc: "AI identifies pollution types automatically.",
              icon: "🤖",
              action: () => navigate("/upload"),
            },
            {
              title: "Report Issues",
              desc: "Submit evidence with AI analysis and community verification.",
              icon: "📢",
              action: () => navigate("/upload"),
            },
          ].map((f) => (
            <button
              key={f.title}
              onClick={f.action}
              className="relative group text-left w-full"
            >
              {/*  BOUNDING BOX AI */}
              <div
                className="
                  absolute inset-0 rounded-3xl
                  border-2 border-green-400/40
                  opacity-0 group-hover:opacity-100
                  animate-pulse
                  transition
                "
              />

              {/*  SCAN LINE */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="
                    w-full h-1 bg-green-400/30
                    opacity-0 group-hover:opacity-100
                    animate-[scan_2s_linear_infinite]
                  "
                />
              </div>

              {/* CARD */}
              <div
                className="
                  p-8 rounded-3xl shadow-lg border
                  bg-gradient-to-br from-green-100 to-white
                  dark:from-gray-700 dark:to-gray-800

                  transform transition duration-300
                  group-hover:scale-105
                  group-hover:shadow-2xl
                "
              >
                <div className="text-4xl mb-4">{f.icon}</div>

                <h3 className="text-xl font-semibold mb-2 
                               text-gray-800 dark:text-white">
                  {f.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300">
                  {f.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            How It Works
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-20 max-w-2xl mx-auto">
            Simple steps to make environmental impact in your community
          </p>

          {/* Connector Lines */}
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent dark:via-green-600 pointer-events-none opacity-30"></div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Capture",
                description: "Take a photo or video of environmental violation",
                icon: "📸"
              },
              {
                step: "2",
                title: "Record",
                description: "Add voice description and location details",
                icon: "📍"
              },
              {
                step: "3",
                title: "Analyze",
                description: "AI analyzes pollution type and severity level",
                icon: "🤖"
              },
              {
                step: "4",
                title: "Share",
                description: "Submit for community verification and response",
                icon: "🌍"
              }
            ].map((item, index) => (
              <div
                key={item.title}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-step={index}
                className={`relative text-center group transition-all duration-700 transform ${
                  visibleSteps.has(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`
                }}
              >
                {/* Step Card Container */}
                <div className="relative p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-green-400 dark:hover:border-green-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                  
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  {/* Animated Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-2xl"></div>

                  <div className="relative z-10">
                    {/* Large Step Number Circle */}
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg transform group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
                      <span>{item.step}</span>
                      {/* Animated Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-0 group-hover:opacity-100 scale-125 animate-ping"></div>
                    </div>

                    {/* Icon */}
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                      {item.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Divider Line */}
                    <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Connector Arrow for Desktop */}
                {index < 3 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <div className="text-2xl text-green-400 dark:text-green-500 font-bold opacity-50 group-hover:opacity-100 transition-opacity">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="relative py-32 bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-24">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-semibold mb-6">
                Our Team
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Passionate innovators dedicated to making environmental monitoring accessible to everyone
            </p>
          </div>

          {/* Team Grid - Focus List Style */}
          <div className="space-y-8 mb-16">
            {[
              {
                name: "Phan Hải Trần Quang",
                role: "CTO & Design",
                bio: "Leading technical architecture and innovative product design",
                image: "/src/assets/team/z7677651184707_466b1602689d0e14df72c47945b2e9ed.jpg",
                color: "from-blue-400 to-blue-600",
              },
              {
                name: "Đỗ Châu Bửu",
                role: "Lead PM",
                bio: "Driving product strategy and user-centric development",
                image: "src/assets/team/02E7CD6C-B8DA-4240-A31C-B11688163FE0_1_105_c.jpeg",
                color: "from-purple-400 to-purple-600",
              },
              {
                name: "Phạm Văn Hiếu",
                role: "DevOps & Infrastructure",
                bio: "Building scalable and reliable infrastructure systems",
                image: "/src/assets/team/z7677979674856_1904b5edc2b6b7328ba8feb2a5f27157.jpg",
                color: "from-green-400 to-green-600",
              },
              {
                name: "Võ Xuân Hữu",
                role: "Frontend Developer",
                bio: "Creating beautiful and responsive user experiences",
                image: "/src/assets/team/z7679797812862_33f8f29fb9b5ba534b859209fdcbb00d.jpg",
                color: "from-pink-400 to-pink-600",
              },
              {
                name: "Phạm Trần Tiến Phát",
                role: "Backend Developer",
                bio: "Designing robust APIs and database architecture",
                image: "/src/assets/team/z7677692245542_328b5d4631a61a37c9d4f787b76c93b1.jpg",
                color: "from-orange-400 to-orange-600",
              }
            ].map((member, idx) => (
              <div key={member.name} className={`group relative`}>
                <div className={`flex items-center gap-8 ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} flex-col md:min-h-72 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-400/50`}>
                  
                  {/* Large Image Section */}
                  <div className="relative w-full md:w-2/5 h-72 md:h-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {/* Glowing Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Large Avatar Image */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-110"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white dark:border-gray-600 transition-transform duration-500 group-hover:scale-105">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.background = `linear-gradient(135deg, rgb(255,255,255))`;
                            e.currentTarget.parentElement!.className += ` bg-gradient-to-br ${member.color} flex items-center justify-center text-8xl`;
                          }}
                        />
                      </div>
                    </div>


                  </div>

                  {/* Info Section */}
                  <div className="w-full md:w-3/5 px-8 py-8 md:py-10 flex flex-col justify-center">
                    
                    {/* Role Badge */}
                    <div className="mb-4 inline-block">
                      <span className="px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 text-sm font-bold">
                        {member.role}
                      </span>
                    </div>

                    {/* Name with Enhanced Styling */}
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-blue-600 dark:group-hover:from-green-400 dark:group-hover:to-blue-400 transition-all duration-500">
                      {member.name}
                    </h3>

                    {/* Animated Divider */}
                    <div className="w-16 h-1.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                    {/* Bio */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                      {member.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4">
                      <button className="px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:from-green-400 hover:to-blue-400 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-300 dark:border-gray-600">
                        🔗 Connect
                      </button>
                      <button className="px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-400 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-300 dark:border-gray-600">
                        💬 Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Tagline */}
          <div className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text">
              ✨ Dedicated to protecting our planet through innovative technology 🌍
            </p>
          </div>
        </div>
      </section>

      {/* UPLOAD */}
      <section
        id="upload"
        className="
          py-28 flex flex-col items-center px-6
          bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800
        "
      >
        <h2 className="text-4xl font-bold mb-6 
                       text-gray-800 dark:text-white">
          Report an Issue
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-10 text-center max-w-md">
          Upload an image and let our AI analyze environmental violations.
        </p>

        <div className="w-full max-w-md">
          <UploadForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">EcoSnap</h3>
              <p className="text-gray-400 text-sm">
                AI-powered environmental monitoring platform
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              © 2026 EcoSnap 🌱 - Making environmental monitoring accessible to everyone
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
