import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";

export const StudioUploadButton = () => {
  return (
    <Button variant={"secondary"}>
      <PlusIcon />
      Create
    </Button>
  );
};
