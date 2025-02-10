import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";
import React from "react";

export const AuthButton = () => {
  return (
    <Button
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/2 rounded-full shadow-none [&_svg]:size-5"
      variant={"outline"}
    >
      <UserCircleIcon />
      Sign in
    </Button>
  );
};
