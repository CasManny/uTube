import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { Video } from "lucide-react";
import Link from "next/link";
import { StudioUploadButton } from "../studio-upload-modal";

export const StudioNavbar = () => {
  return (
    <nav className="fixed border-b shadow-md top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        {/* {logo} */}
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href={"/studio"}>
            <div className="flex p-4 items-center gap-1">
              <Video className="text-red-500 size-14" />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/* {spacer} */}

        <div className="flex-1" />

        {/* { auth button} */}
        <div className="flex-shrink-0 items-center flex gap-4">
          <StudioUploadButton />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
