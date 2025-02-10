import { HomeLayout } from "@/modules/home/ui/layouts/home.layout";
import React, { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return <HomeLayout>{children}</HomeLayout>;
};

export default Layout;
