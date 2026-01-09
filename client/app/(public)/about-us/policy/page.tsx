"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, 
  Shield, 
  Users, 
  AlertCircle,
  CheckCircle,
  Eye,
  Lock,
  Heart
} from "lucide-react";
import MainLayout from "@/app/components/templates/MainLayout";

const Policy = () => {
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
      icon: <AlertCircle size={16} />
    }
  ];



  const prohibitedItems = [
    "Weapons or dangerous items",
    "Illegal substances or paraphernalia", 
    "Counterfeit goods",
    "Stolen property",
    "Adult content or services",
    "Academic dishonesty materials",
    "Hate speech or discriminatory content",
    "Items violating university policies"
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Policies & Guidelines
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Our commitment to safety, fairness, and transparency
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
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AlertCircle className="w-4 h-4" />
            Important Guidelines
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Terms of Use & Community Guidelines
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To maintain a safe and reliable marketplace for our campus community, all users must adhere to the following guidelines:
          </p>
        </motion.div>
      </div>

      {/* Guidelines Sections */}
      <div className="space-y-8 mb-16">
        {[
          {
            icon: <Shield className="w-8 h-8" />,
            title: "User Verification & Eligibility",
            badge: "Required",
            badgeColor: "bg-red-100 text-red-800",
            content: [
              "BuyBuddy is exclusively for university students.",
              "To access the marketplace, you must verify your identity by providing a valid Student ID Card or a paid fee challan for the current semester.",
              "Accounts without proper verification will not be permitted to list or buy items."
            ],
            gradient: "from-red-50 to-pink-50"
          },
          {
            icon: <Eye className="w-8 h-8" />,
            title: "Accuracy of Listings & Honesty",
            badge: "Critical",
            badgeColor: "bg-orange-100 text-orange-800",
            content: [
              "Sellers are responsible for providing 100% honest and accurate information.",
              "If a listing contains fake information or does not match the actual product, BuyBuddy reserves the right to take strict action against the seller.",
              "In the case of food items, all ingredients must be correctly mentioned (if mentioned).",
              "Providing misleading details is strictly prohibited and can lead to penalties."
            ],
            gradient: "from-orange-50 to-amber-50"
          },
          {
            icon: <Users className="w-8 h-8" />,
            title: "Ethical Standards",
            badge: "Mandatory",
            badgeColor: "bg-purple-100 text-purple-800",
            content: [
              "Users are expected to maintain high ethical standards.",
              "You are strictly prohibited from listing any items or services that are illegal, unethical, or in violation of university regulations.",
              "Any post found to be inappropriate or harmful to the campus environment will be removed immediately."
            ],
            gradient: "from-purple-50 to-indigo-50"
          },
          {
            icon: <Lock className="w-8 h-8" />,
            title: "Transactions & Personal Safety",
            badge: "Safety First",
            badgeColor: "bg-blue-100 text-blue-800",
            content: [
              "All transactions are to be conducted on a Peer-to-Peer (P2P) basis.",
              "For your safety, we recommend meeting in well-lit, public campus areas to inspect items and complete payments via Cash-on-Delivery.",
              "Please note that BuyBuddy acts only as a platform to connect buyers and sellers and is not responsible for the quality of goods or the outcome of any transaction."
            ],
            gradient: "from-blue-50 to-cyan-50"
          },
          {
            icon: <AlertCircle className="w-8 h-8" />,
            title: "Account Conduct & Enforcement",
            badge: "Zero Tolerance",
            badgeColor: "bg-gray-800 text-white",
            content: [
              "We prioritize a respectful community.",
              "If a user is reported for fraudulent activity, providing false information, or violating these terms, BuyBuddy reserves the right to permanently ban the account and take necessary action without prior notice."
            ],
            gradient: "from-gray-50 to-slate-50"
          }
        ].map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className={`relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br ${section.gradient}`}
          >
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="text-indigo-600 flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${section.badgeColor}`}>
                      {section.badge}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

          {/* Prohibited Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start gap-4">
              <div className="text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Prohibited Items & Services
                </h3>
                <p className="text-gray-600 mb-4">
                  To maintain a safe and trustworthy environment, the following items and services are strictly prohibited on BuyBuddy:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {prohibitedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4 text-sm">
                  Violation of these policies may result in account suspension or permanent removal from the platform.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Enforcement Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Policy Enforcement
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Warning</h4>
                <p className="text-sm text-gray-600">
                  First violations receive a warning and policy clarification
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Suspension</h4>
                <p className="text-sm text-gray-600">
                  Repeated violations result in temporary account suspension
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Permanent Ban</h4>
                <p className="text-sm text-gray-600">
                  Serious violations lead to permanent account removal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact for Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <h3 className="text-xl font-bold mb-4">
              Questions About Our Policies?
            </h3>
            <p className="text-blue-100 mb-6">
              If you have questions or need clarification on any of our policies, we&apos;re here to help.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
};

export default Policy;