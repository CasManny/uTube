import { SidebarTrigger } from "@/components/ui/sidebar";
import { Video } from "lucide-react";
import Link from "next/link";
import React from "react";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        {/* {logo} */}
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href={"/"}>
            <div className="flex p-4 items-center gap-1">
              <Video className="text-red-500 size-14" />
              <p className="text-xl font-semibold tracking-tight">UTube</p>
            </div>
          </Link>
        </div>

        {/* { search bar} */}
        <div className="flex-1 justify-center max-w-[700px] mx-auto">
          <SearchInput />
        </div>

        {/* { auth button} */}
        <div className="flex-shrink-0 items-center flex gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
