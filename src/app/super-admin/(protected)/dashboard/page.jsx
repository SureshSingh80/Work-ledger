'use client';
import Cards from "@/components/Cards";
import { ShieldPlus, Users, Crown, UserCog, LogOut } from "lucide-react";


const Dashboard = ()=>{

    const featureCards = [
    { title: "Create Admin", description: "Create a new admin account to manage the system.", icon: <ShieldPlus className="h-7 w-7" />, route: "/super-admin/create-admin" },
    { title: "Manage Admins", description: "View, edit, or delete existing admin accounts.", icon: <Users className="h-7 w-7" />, route: "/super-admin/manage-admins" },
    { title: "Create SuperAdmin", description: "Create a new super admin account with elevated privileges.", icon: <Crown className="h-7 w-7" />, route: "/super-admin/create-superadmin" },
    { title: "Manage SuperAdmins", description: "View, edit, or delete existing super admin accounts.", icon: <UserCog className="h-7 w-7" />, route: "/super-admin/manage-superadmins" },
    { title: "Logout", description: "Sign out of your current session.", icon: <LogOut className="h-7 w-7" />, route: "/super-admin/logout" },
];
    return(
        <div className="min-h-screen bg-gray-100 p-8">

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
            
        </div>
    )
}

export default Dashboard;