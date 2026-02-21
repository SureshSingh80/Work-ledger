import Link from "next/link";

export default function Home() {
  return (
   
       <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
         <div className="hidden sm:block">
           <h1 className=" text-2xl font-bold text-blue-600">
            LabourManager
          </h1>
         </div>

        <div className="flex justify-between items-center w-full sm:w-auto">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition mr-4"
          >
            Login
          </Link>

          <Link
            href="/request-access"
            className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            Request Access
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Smart Labour & Attendance Management System
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-8">
          Track daily attendance, automatically calculate wages,
          and manage your workers efficiently with a secure SaaS platform.
        </p>

        <div className="space-x-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Login Now
          </Link>

          <Link
            href="/request-access"
            className="px-6 py-3 rounded-xl border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            Request Access
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 px-6 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">
          Key Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
            <h4 className="text-xl font-semibold mb-3">
              Daily Attendance Tracking
            </h4>
            <p className="text-gray-600">
              Mark labour attendance daily with a single click.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
            <h4 className="text-xl font-semibold mb-3">
              Automatic Wage Calculation
            </h4>
            <p className="text-gray-600">
              If marked present, total amount increases automatically
              based on per-day charge.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
            <h4 className="text-xl font-semibold mb-3">
              Secure JWT Authentication
            </h4>
            <p className="text-gray-600">
              Custom username & password based login system
              with secure cookies.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h3>

        <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700">
          <p>1️⃣ Admin creates your account</p>
          <p>2️⃣ Login using username and password</p>
          <p>3️⃣ Add your labour details</p>
          <p>4️⃣ Mark attendance daily</p>
          <p>5️⃣ System automatically calculates total wages</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-8 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} LabourManager SaaS. All rights reserved.
      </footer>
    </div>
  
  );
}
