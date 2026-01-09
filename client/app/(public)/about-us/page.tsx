"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Users, 
  Target, 
  Award,
  ArrowRight,
  FileText,
  HelpCircle
} from "lucide-react";
import MainLayout from "@/app/components/templates/MainLayout";

const AboutUs = () => {
  const pathname = usePathname();

  const tabs = [
    {
      id: "about",
      label: "About Us",
      href: "/about-us",
      icon: <Heart size={16} />
    },
    {
      id: "policy",
      label: "Policy", 
      href: "/about-us/policy",
      icon: <FileText size={16} />
    },
    {
      id: "how-it-works",
      label: "How It Works",
      href: "/about-us/how-it-works",
      icon: <HelpCircle size={16} />
    }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "We verify all sellers and ensure secure transactions for our community."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      description: "Building a trusted marketplace where students can buy and sell with confidence."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Student Empowerment",
      description: "Enabling student entrepreneurs to start and grow their businesses."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Maintaining high standards for all products and services on our platform."
    }
  ];



  return (
    <MainLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              About BuyBuddy
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8"
            >
              Empowering student entrepreneurs and creating a trusted marketplace for the university community
            </motion.p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white shadow-sm sticky top-16 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-1 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  pathname === tab.href
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Section */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div> */}

          {/* Who We Are */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Who We Are
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Students Building for Students
              </h2>
              <div className="max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed space-y-4">
                <p>
                  At BuyBuddy, we realized that our campus is full of talented entrepreneurs who have great products but struggle to reach the <span className="font-semibold text-indigo-600">right audience</span>. On the other hand, student buyers are often discouraged by high delivery charges and long waiting times when shopping online.
                </p>
                <p className="text-xl font-medium text-indigo-600">
                  We created BuyBuddy to cover this gap and connect the two.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Our Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white mb-20"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="w-4 h-4" />
                Our Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Entrepreneurship Shouldn&apos;t Be Seasonal
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                We believe that entrepreneurship shouldn&apos;t be &quot;seasonal&quot; or limited to university stalls twice a year. Our goal is to turn campus commerce into a structured, sustainable system where students can start small, test their ideas, and grow within their own community.
              </p>
            </div>
          </motion.div>

          {/* What Makes Us Different */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Makes Us Different?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                BuyBuddy is a campus-based marketplace, designed specifically for our unique environment. Because we are all part of the same campus, we offer benefits that traditional e-commerce cannot match:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "💸",
                  title: "Zero Delivery Charges",
                  description: "Since buyers and sellers are on the same campus, there are no extra costs like the usual 250–350 PKR delivery fees.",
                  gradient: "from-green-400 to-emerald-600"
                },
                {
                  icon: "⚡",
                  title: "Same-Day Delivery",
                  description: "No more waiting 5 to 7 days for your order; get what you need, when you need it.",
                  gradient: "from-blue-400 to-indigo-600"
                },
                {
                  icon: "🛡️",
                  title: "A Trusted Community",
                  description: "We prioritize security by verifying users through their university ID cards, ensuring a safe platform for everyone.",
                  gradient: "from-purple-400 to-pink-600"
                },
                {
                  icon: "🚀",
                  title: "Support for Student Startups",
                  description: "We reduce risk for student sellers by giving them a concentrated audience without heavy marketing or initial investment.",
                  gradient: "from-orange-400 to-red-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}></div>
                  <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Our Promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center border border-gray-200"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Our Promise
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Where Everyone Wins
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              BuyBuddy is here to make campus life more convenient for buyers and more rewarding for sellers. By connecting people with the same mindset and location, we are building a marketplace where everyone wins.
            </p>
          </motion.div>

          {/* Values Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from platform design to community building
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-indigo-600 mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re looking to buy unique products or start selling your own creations, BuyBuddy is here to support your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Shopping
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/become-seller"
                className="inline-flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-800 transition-colors"
              >
                Become a Seller
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
};

export default AboutUs;