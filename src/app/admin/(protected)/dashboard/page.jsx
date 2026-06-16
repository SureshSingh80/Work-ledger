import React from "react";
import {
  UserPlus,
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  BarChart3,
  LogOut,
} from "lucide-react";
import Cards from "@/components/Cards";

const Dashboard = () => {
  const featureCards = [
    {
      title: "Add Worker",
      description: "Create a new worker or labour profile.",
      icon: <UserPlus className="h-7 w-7" />,
      route: "/admin/create-workers",
    },

    {
      title: "Manage Workers",
      description: "View, update, or remove worker records.",
      icon: <Users className="h-7 w-7" />,
      route: "/admin/workers",
    },

    {
      title: "Attendance",
      description: "Mark workers present, absent, or half-day.",
      icon: <CalendarCheck className="h-7 w-7" />,
      route: "/admin/attendance",
    },

    {
      title: "Payments",
      description: "Record salary payments and advances.",
      icon: <Wallet className="h-7 w-7" />,
      route: "/admin/payments",
    },

    {
      title: "Pending Amounts",
      description: "Track outstanding wages and balances.",
      icon: <Receipt className="h-7 w-7" />,
      route: "/admin/pending-payments",
    },

    {
      title: "Reports & Analytics",
      description: "View attendance and payment reports.",
      icon: <BarChart3 className="h-7 w-7" />,
      route: "/admin/reports",
    },

    {
      title: "Logout",
      description: "Sign out of your current session.",
      icon: <LogOut className="h-7 w-7" />,
      route: "/admin/logout",
    },
  ];
  return <div className="min-h-screen bg-gray-100 p-8">

            <div className="mt-12">
                 <h1 className="text-3xl text-gray-700 font-bold text-center mb-2">Super Admin Dashboard</h1>
                <p className=" text-center text-gray-700 mb-10">Manage your system administration</p>
            </div>
            {/* grid system */}
            <div className="card-container  justify-center items-center  flex-wrap">
               {featureCards.map((card,index)=> (
                    <Cards key={index} title={card.title} description={card.description} icon={card.icon} route={card.route} />
                ))
               }

            </div>
            
        </div>;
};

export default Dashboard;
