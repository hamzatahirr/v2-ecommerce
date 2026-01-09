"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Heart, 
  Package, 
  MessageCircle,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowRight,
  Shield
} from "lucide-react";
import MainLayout from "@/app/components/templates/MainLayout";

const HowItWorks = () => {
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
      icon: <MessageCircle size={16} />
    },
    {
      id: "how-it-works",
      label: "How It Works",
      href: "/about-us/how-it-works",
      icon: <Package size={16} />
    }
  ];





  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Sellers Only",
      description: "All sellers are verified students, ensuring trust and authenticity."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Direct Communication",
      description: "Chat directly with buyers and sellers for better transactions."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Your financial information is protected with industry-standard encryption."
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Flexible Delivery",
      description: "Choose from pickup, on-campus delivery, or shipping options."
    }
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
              How BuyBuddy Works
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 max-w-3xl mx-auto"
            >
              A simple, safe, and secure way to buy and sell within your university community
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
          {/* Introduction */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Campus-Based Marketplace System
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                BuyBuddy is a campus-based marketplace designed to turn campus commerce into a structured system. By connecting buyers and sellers who share the same campus and mindset, we make shopping fast, convenient, and secure.
              </p>
            </motion.div>
          </div>

          {/* Get Verified Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-20"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Get Verified
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Start Your Journey
              </h3>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl mb-3">🎓</div>
                  <h4 className="font-bold mb-2">Sign Up</h4>
                  <p className="text-blue-100">Students can register for the platform with no initial registration fee.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl mb-3">🔒</div>
                  <h4 className="font-bold mb-2">Security</h4>
                  <p className="text-blue-100">To keep the platform exclusive and trusted, you must verify your account using your University ID Card or a paid fee challan for the current semester.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* For Buyers Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                For Buyers: Find What You Need
              </h3>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    🛍️
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Shop Locally</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Browse products and services offered by fellow students within your own campus.
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                    💰
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Save Money</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Since all sellers are on-site, there are no delivery charges, reducing the overall cost for students.
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                    📱
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Place an Order</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Once you find an item you like, simply place your order through the website to initiate the process.
                </p>
              </div>
            </div>
          </div>

          {/* Coordinate & Meet Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 md:p-12 mb-20 border border-orange-100"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Coordinate & Meet
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                  💬
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Connect with the Seller</h4>
                <p className="text-gray-600">After an order is placed, buyer and seller should communicate to negotiate a mutually convenient time, date, and location on campus.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                  🤝
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Secure Trade</h4>
                <p className="text-gray-600">Meet at the agreed-upon campus location to inspect the product and complete the transaction.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                  😊
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Face-to-Face Trust</h4>
                <p className="text-gray-600">Trading in person with fellow students ensures higher trust and eliminates the chaos of urgent, third-party deliveries.</p>
              </div>
            </div>
          </motion.div>

          {/* For Sellers Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                For Sellers: Grow Your Business
              </h3>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "📦",
                  title: "List Your Products",
                  description: "Start your business and test demand without the pressure of heavy marketing or initial investment.",
                  gradient: "from-blue-400 to-indigo-600"
                },
                {
                  icon: "🎯",
                  title: "Reach Your Audience",
                  description: "Gain direct exposure to a concentrated audience of students who actually understand your products.",
                  gradient: "from-green-400 to-emerald-600"
                },
                {
                  icon: "🛡️",
                  title: "Reduce Risk",
                  description: "By selling within a controlled campus environment, you reduce the risks and costs usually associated with starting an online business.",
                  gradient: "from-purple-400 to-pink-600"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}></div>
                  <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-4xl mb-4 text-center">{item.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg text-center">{item.title}</h4>
                    <p className="text-gray-600 text-center leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose BuyBuddy?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Features designed to make your buying and selling experience exceptional
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-indigo-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-green-50 border border-green-200 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Safety Tips for Transactions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Meet in public places for exchanges</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Inspect items before payment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Use our secure payment system</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Keep all chat records</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Report suspicious activity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Trust your instincts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Get Started CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students already buying and selling on BuyBuddy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Up Now
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-800 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
};

export default HowItWorks;